import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS & Preflight handling
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-pin, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Persistence Path
const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'sangam_records.json');
const adminConfigPath = path.join(dataDir, 'admin_config.json');

// Interface definition for records
interface AuditMetadata {
  registrantName: string;
  registrantEmail: string;
  registrantPhone: string;
  designatedRole: string;
  sourceForm: string;
  clientIp: string;
  userAgent: string;
  timestampUtc: string;
  timestampIst: string;
}

interface DatabaseSchema {
  delegates: any[];
  tickets: any[];
  plays: any[];
  secretariat: any[];
  inquiries: any[];
  sponsors: any[];
}

// Initial Database state (0 mock entries)
const initialDb: DatabaseSchema = {
  delegates: [],
  tickets: [],
  plays: [],
  secretariat: [],
  inquiries: [],
  sponsors: []
};

// Ensure data directory and file exist
function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify(initialDb, null, 2), 'utf-8');
      return { ...initialDb };
    }
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      delegates: Array.isArray(parsed.delegates) ? parsed.delegates : [],
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
      plays: Array.isArray(parsed.plays) ? parsed.plays : [],
      secretariat: Array.isArray(parsed.secretariat) ? parsed.secretariat : [],
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      sponsors: Array.isArray(parsed.sponsors) ? parsed.sponsors : [],
    };
  } catch (error) {
    console.error('Error reading sangam_records.json:', error);
    return { ...initialDb };
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const sanitized: DatabaseSchema = {
      delegates: Array.isArray(db.delegates) ? db.delegates : [],
      tickets: Array.isArray(db.tickets) ? db.tickets : [],
      plays: Array.isArray(db.plays) ? db.plays : [],
      secretariat: Array.isArray(db.secretariat) ? db.secretariat : [],
      inquiries: Array.isArray(db.inquiries) ? db.inquiries : [],
      sponsors: Array.isArray(db.sponsors) ? db.sponsors : []
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing sangam_records.json:', error);
  }
}

// Organizer / Admin PIN Authentication
function getAdminPin(): string {
  try {
    if (fs.existsSync(adminConfigPath)) {
      const config = JSON.parse(fs.readFileSync(adminConfigPath, 'utf-8'));
      if (config.pin && typeof config.pin === 'string') {
        return config.pin.trim();
      }
    }
  } catch (e) {
    // fallback to default
  }
  return (process.env.ADMIN_PIN || 'adminisvansh').trim();
}

function setAdminPin(newPin: string): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(
    adminConfigPath,
    JSON.stringify({ pin: newPin.trim(), updatedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

function checkAdminAuth(req: Request): boolean {
  const pinHeader = req.headers['x-admin-pin'];
  const pinQuery = req.query.pin;
  const pinBody = req.body?.pin;
  const provided = String(pinHeader || pinQuery || pinBody || '').trim();
  return provided.length > 0 && provided === getAdminPin();
}

// Random alphanumeric generator for official accreditation
function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand}`;
}

// Provenance & Audit helper
function createAuditTrail(
  req: Request,
  info: { name: string; email: string; phone: string; role: string; sourceForm: string }
): AuditMetadata {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '127.0.0.1');
  const userAgent = (req.headers['user-agent'] as string) || 'Browser Client';
  const now = new Date();
  
  const formattedIst = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
    hour12: true
  }).format(now);

  return {
    registrantName: info.name || 'Anonymous',
    registrantEmail: info.email || 'N/A',
    registrantPhone: info.phone || 'N/A',
    designatedRole: info.role,
    sourceForm: info.sourceForm,
    clientIp: ip,
    userAgent,
    timestampUtc: now.toISOString(),
    timestampIst: `${formattedIst} (IST)`
  };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. POST /api/register-delegate
app.post('/api/register-delegate', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      whatsappPhone,
      institution,
      cityState,
      participationCategory,
      parliamentTrack,
      priorExperience,
      accessCode
    } = req.body;

    if (!fullName || !email || !whatsappPhone || !participationCategory) {
      return res.status(400).json({ error: 'Missing required delegate accreditation fields.' });
    }

    const cleanPhone = String(whatsappPhone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Mobile number must be exactly 10 digits without any alphabets or symbols.' });
    }

    if (cityState && /\d/.test(String(cityState))) {
      return res.status(400).json({ error: 'City must not contain numbers. Only alphabets are permitted.' });
    }

    const code = generateCode('SNGM-DEL');
    const db = getDatabase();

    // Check optional access / concession / invite code
    const normalizedAccessCode = String(accessCode || '').trim().toUpperCase();
    let fee = 650;
    let feeStatus = 'Confirmed';
    if (['SECRETARIAT', 'VIP2026', 'CULTRAHUS', 'FREEPASS', 'GUEST', 'COLLEGE100', 'SPECIAL'].includes(normalizedAccessCode)) {
      fee = 0;
      feeStatus = `Confirmed (100% Fee Waiver: ${normalizedAccessCode})`;
    } else if (['SANGAM50', 'STUDENT50', 'HALF50'].includes(normalizedAccessCode)) {
      fee = 325;
      feeStatus = `Confirmed (50% Concession: ${normalizedAccessCode})`;
    } else if (normalizedAccessCode.length > 0) {
      feeStatus = `Confirmed (Affiliated Code: ${normalizedAccessCode})`;
    }

    const newRecord = {
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      accreditationCode: code,
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      whatsappPhone: cleanPhone,
      institution: String(institution || 'Independent Artist').trim(),
      cityState: String(cityState || 'New Delhi').trim(),
      participationCategory,
      parliamentTrack: parliamentTrack || 'Cultural Heritage & Creative Democracy',
      priorExperience: String(priorExperience || '').trim(),
      appliedCode: normalizedAccessCode || undefined,
      registrationFee: fee,
      currency: 'INR',
      status: feeStatus,
      festivalDate: '2026-10-18',
      venue: 'TBA',
      addedBy: createAuditTrail(req, {
        name: fullName,
        email,
        phone: cleanPhone,
        role: 'Cultural Delegate',
        sourceForm: 'delegate_accreditation_form'
      })
    };

    db.delegates.unshift(newRecord);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Accreditation successfully confirmed for Cultrahus Sangam 2026.',
      record: newRecord
    });
  } catch (err: any) {
    console.error('Delegate registration error:', err);
    return res.status(500).json({ error: 'Failed to process delegate registration.' });
  }
});

// GET /api/accreditation/:code - Look up accreditation by code (Code Option)
app.get('/api/accreditation/:code', (req: Request, res: Response) => {
  try {
    const rawCode = String(req.params.code || '').trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ error: 'Please provide an accreditation code.' });
    }

    const db = getDatabase();
    const cleanRaw = rawCode.replace(/[^A-Z0-9]/g, '');
    const match = db.delegates.find((d) => {
      const dCode = String(d.accreditationCode || '').toUpperCase();
      const dId = String(d.id || '').toUpperCase();
      return (
        dCode === rawCode ||
        dId === rawCode ||
        dCode.replace(/[^A-Z0-9]/g, '') === cleanRaw
      );
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        error: `No accreditation record found for code "${rawCode}". Please check your code or register anew.`
      });
    }

    return res.json({
      success: true,
      record: match
    });
  } catch (err: any) {
    console.error('Lookup accreditation error:', err);
    return res.status(500).json({ error: 'Failed to lookup accreditation record.' });
  }
});

// 1b. GET /api/lookup-ticket/:code - Code option pass verification
app.get('/api/lookup-ticket/:code', (req: Request, res: Response) => {
  try {
    const rawCode = String(req.params.code || '').trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ error: 'Please provide a ticket pass code or phone number.' });
    }

    const db = getDatabase();
    const cleanRaw = rawCode.replace(/[^A-Z0-9]/g, '');
    const match = db.tickets.find((t) => {
      const tCode = String(t.ticketCode || '').toUpperCase();
      const tId = String(t.id || '').toUpperCase();
      const tPhone = String(t.whatsappPhone || '').replace(/\D/g, '');
      return (
        tCode === rawCode ||
        tId === rawCode ||
        tCode.replace(/[^A-Z0-9]/g, '') === cleanRaw ||
        (cleanRaw.length === 10 && tPhone === cleanRaw)
      );
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        error: `No ticket pass found for code "${rawCode}". Please check your code or book anew.`
      });
    }

    return res.json({
      success: true,
      record: match
    });
  } catch (err: any) {
    console.error('Lookup ticket pass error:', err);
    return res.status(500).json({ error: 'Failed to lookup ticket pass record.' });
  }
});

// 2. POST /api/book-ticket
app.post('/api/book-ticket', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      whatsappPhone,
      tier,
      quantity = 1,
      seats = [],
      foodAddon = 'none',
      totalAmount
    } = req.body;

    if (!fullName || !email || !whatsappPhone || !tier) {
      return res.status(400).json({ error: 'Missing required ticket booking details.' });
    }

    const cleanPhone = String(whatsappPhone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'WhatsApp phone number must be exactly 10 digits without any alphabets or symbols.' });
    }

    const code = generateCode('SNGM-TKT');
    const db = getDatabase();

    const tierNameMap: Record<string, string> = {
      classic: 'Classic Conclave Pass (₹200 - No Food)',
      royal: 'Royal Patron Pass (₹400)',
      sovereign: 'VIP Sovereign Pass - Front Row (₹600 - Food Included)'
    };

    const newRecord = {
      id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketCode: code,
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      whatsappPhone: cleanPhone,
      tier,
      tierName: tierNameMap[tier] || tier,
      quantity: Number(quantity) || 1,
      seats: Array.isArray(seats) ? seats : [],
      foodAddon,
      totalAmount: Number(totalAmount) || 200,
      currency: 'INR',
      status: 'Confirmed',
      accessBadge: 'All-Day Festival Access',
      festivalDate: '2026-10-18',
      venue: 'TBA',
      addedBy: createAuditTrail(req, {
        name: fullName,
        email,
        phone: cleanPhone,
        role: 'Conclave Passholder',
        sourceForm: 'conclave_ticket_checkout'
      })
    };

    db.tickets.unshift(newRecord);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Tickets successfully booked and pass generated.',
      record: newRecord
    });
  } catch (err: any) {
    console.error('Ticket booking error:', err);
    return res.status(500).json({ error: 'Failed to process ticket booking.' });
  }
});

// 3. POST /api/register-play
app.post('/api/register-play', (req: Request, res: Response) => {
  try {
    const {
      troupeName,
      playTitle,
      playwright,
      director,
      contactPerson,
      email,
      whatsappPhone,
      category,
      castCrewCount,
      durationMinutes,
      synopsis,
      technicalRider
    } = req.body;

    if (!troupeName || !playTitle || !director || !email || !whatsappPhone) {
      return res.status(400).json({ error: 'Missing required theatre play registration fields.' });
    }

    const cleanPhone = String(whatsappPhone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'WhatsApp phone must be exactly 10 digits without any alphabets or symbols.' });
    }

    const code = generateCode('SNGM-TRP');
    const db = getDatabase();

    const newRecord = {
      id: `trp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      troupeCode: code,
      troupeName: String(troupeName).trim(),
      playTitle: String(playTitle).trim(),
      playwright: String(playwright || 'Original Ensemble').trim(),
      director: String(director).trim(),
      contactPerson: String(contactPerson || director).trim(),
      email: String(email).trim().toLowerCase(),
      whatsappPhone: cleanPhone,
      category: category || 'Proscenium',
      castCrewCount: Number(castCrewCount) || 10,
      durationMinutes: Number(durationMinutes) || 45,
      synopsis: String(synopsis || '').trim(),
      technicalRider: String(technicalRider || '').trim(),
      status: 'Under Jury Review',
      festivalDate: '2026-10-18',
      addedBy: createAuditTrail(req, {
        name: contactPerson || director,
        email,
        phone: cleanPhone,
        role: 'Troupe Lead / Director',
        sourceForm: 'theatre_troupe_registration'
      })
    };

    db.plays.unshift(newRecord);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Theatre troupe performance registered successfully.',
      record: newRecord
    });
  } catch (err: any) {
    console.error('Play registration error:', err);
    return res.status(500).json({ error: 'Failed to process troupe registration.' });
  }
});

// 4. POST /api/secretariat-apply
app.post('/api/secretariat-apply', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      whatsappPhone,
      previousExperience,
      department,
      whyJoin,
      timeCommitment,
      referredBy
    } = req.body;

    if (!fullName || !email || !whatsappPhone || !department || !previousExperience || !whyJoin || !timeCommitment || !referredBy) {
      return res.status(400).json({ error: 'Please fill in all required fields indicated with *.' });
    }

    const cleanPhone = String(whatsappPhone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Mobile number must be exactly 10 digits without any alphabets or symbols.' });
    }

    const code = generateCode('SNGM-SEC');
    const db = getDatabase();

    const newRecord = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      applicationCode: code,
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      whatsappPhone: cleanPhone,
      previousExperience: String(previousExperience).trim(),
      department: String(department).trim(),
      whyJoin: String(whyJoin).trim(),
      timeCommitment: String(timeCommitment).trim(),
      referredBy: String(referredBy).trim(),
      status: 'Application Received',
      festivalDate: '2026-10-18',
      addedBy: createAuditTrail(req, {
        name: fullName,
        email,
        phone: cleanPhone,
        role: `Secretariat Applicant (${department})`,
        sourceForm: 'cultrahus_organisation_secretariat_form'
      })
    };

    db.secretariat.unshift(newRecord);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Cultrahus Organisation application submitted successfully.',
      record: newRecord
    });
  } catch (err: any) {
    console.error('Secretariat application error:', err);
    return res.status(500).json({ error: 'Failed to process secretariat application.' });
  }
});

// 5. POST /api/inquiry
app.post('/api/inquiry', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      whatsappPhone,
      category = 'General Query',
      subject,
      message
    } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: 'Missing required inquiry details.' });
    }

    let cleanPhone = 'N/A';
    if (whatsappPhone && String(whatsappPhone).trim().length > 0) {
      const digits = String(whatsappPhone).replace(/\D/g, '');
      if (digits.length === 10) {
        cleanPhone = digits;
      } else {
        return res.status(400).json({ error: 'WhatsApp phone must be exactly 10 digits without any alphabets or symbols.' });
      }
    }

    const code = generateCode('SNGM-INQ');
    const db = getDatabase();

    const newRecord = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      inquiryCode: code,
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      whatsappPhone: cleanPhone,
      category: String(category).trim(),
      subject: String(subject || 'Sangam 2026 Inquiry').trim(),
      message: String(message).trim(),
      status: 'Desk Assigned',
      addedBy: createAuditTrail(req, {
        name: fullName,
        email,
        phone: cleanPhone,
        role: 'General Inquirer',
        sourceForm: 'general_inquiry_form'
      })
    };

    db.inquiries.unshift(newRecord);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received by the Cultrahus Sangam Secretariat.',
      record: newRecord
    });
  } catch (err: any) {
    console.error('Inquiry error:', err);
    return res.status(500).json({ error: 'Failed to log inquiry.' });
  }
});

// 5b. POST /api/sponsor - Submit Sponsorship Package / Proposal
app.post('/api/sponsor', (req: Request, res: Response) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      whatsappPhone,
      city,
      tier,
      amount,
      industry,
      website,
      activationSpace = 'Yes',
      objectives,
      notes,
      deckFileName,
      deckFileSize,
      deckFileType,
      deckFileData
    } = req.body;

    if (!companyName || !contactPerson || !email || !whatsappPhone || !tier) {
      return res.status(400).json({
        error: 'Please provide organization/brand name, contact person, email, WhatsApp phone, and select a partnership tier.'
      });
    }

    const cleanPhone = String(whatsappPhone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Mobile / WhatsApp number must be exactly 10 digits.' });
    }

    if (city && !/^[A-Za-z\s]+$/.test(String(city).trim())) {
      return res.status(400).json({ error: 'City name must contain only alphabets and spaces.' });
    }

    const tierRates: Record<string, number> = {
      'Silver Partner': 25000,
      'Gold Partner': 50000,
      'Platinum Partner': 75000,
      'Presenting Partner': 100000
    };

    const finalTier = String(tier).trim();
    const finalAmount = Number(amount) || tierRates[finalTier] || 25000;

    const sponsorCode = generateCode('SNGM-SPN');
    const db = getDatabase();

    const newRecord = {
      id: `spn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sponsorCode,
      tier: finalTier,
      amount: finalAmount,
      companyName: String(companyName).trim(),
      contactPerson: String(contactPerson).trim(),
      email: String(email).trim().toLowerCase(),
      whatsappPhone: cleanPhone,
      city: String(city || '').trim(),
      industry: String(industry || '').trim(),
      website: String(website || '').trim(),
      activationSpace: String(activationSpace || 'Yes').trim(),
      objectives: String(objectives || '').trim(),
      notes: String(notes || '').trim(),
      deckFileName: deckFileName ? String(deckFileName).trim() : undefined,
      deckFileSize: deckFileSize ? Number(deckFileSize) : undefined,
      deckFileType: deckFileType ? String(deckFileType).trim() : undefined,
      deckFileData: deckFileData ? String(deckFileData) : undefined,
      status: 'Proposal Submitted',
      addedBy: createAuditTrail(req, {
        name: contactPerson,
        email,
        phone: cleanPhone,
        role: `Sponsor Partner (${finalTier})`,
        sourceForm: 'sponsor_us_form'
      })
    };

    db.sponsors.unshift(newRecord);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: `Thank you! Your partnership proposal for ${finalTier} (₹${finalAmount.toLocaleString('en-IN')}) has been recorded. Our Festival Curation Directorate will connect with your team.`,
      record: newRecord
    });
  } catch (err: any) {
    console.error('Sponsorship submission error:', err);
    return res.status(500).json({ error: 'Failed to record sponsorship proposal.' });
  }
});

// 6. POST /api/admin/verify - Check Organizer PIN
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { pin } = req.body;
  const currentPin = getAdminPin();
  if (String(pin || '').trim() === currentPin) {
    return res.json({ success: true, authorized: true, message: 'Organizer authenticated successfully.' });
  }
  return res.status(401).json({ success: false, authorized: false, error: 'Incorrect Organizer PIN.' });
});

// 7. POST /api/admin/change-pin - Update Organizer PIN
app.post('/api/admin/change-pin', (req: Request, res: Response) => {
  const { currentPin, newPin } = req.body;
  if (String(currentPin || '').trim() !== getAdminPin()) {
    return res.status(401).json({ success: false, error: 'Current PIN is incorrect.' });
  }
  if (!newPin || String(newPin).trim().length < 4) {
    return res.status(400).json({ success: false, error: 'New PIN must be at least 4 characters.' });
  }
  setAdminPin(String(newPin).trim());
  return res.json({ success: true, message: 'Organizer PIN successfully updated.' });
});

// 8. GET /api/admin/all-records - Get all registrations for organizer (PIN required)
app.get('/api/admin/all-records', (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({
      success: false,
      error: 'Restricted: Valid Organizer PIN is required to view registration records.'
    });
  }
  try {
    const db = getDatabase();
    return res.json({
      success: true,
      data: db,
      counts: {
        delegates: db.delegates.length,
        tickets: db.tickets.length,
        plays: db.plays.length,
        secretariat: db.secretariat.length,
        inquiries: db.inquiries.length,
        sponsors: (db.sponsors || []).length,
        total:
          db.delegates.length +
          db.tickets.length +
          db.plays.length +
          db.secretariat.length +
          db.inquiries.length +
          (db.sponsors || []).length
      },
      retrievedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve organizer registration database.' });
  }
});

// 9. GET /api/database/collections - Public counts summary
app.get('/api/database/collections', (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const metadata = {
      delegates: db.delegates.length,
      tickets: db.tickets.length,
      plays: db.plays.length,
      secretariat: db.secretariat.length,
      inquiries: db.inquiries.length,
      sponsors: (db.sponsors || []).length,
      totalRecords:
        db.delegates.length +
        db.tickets.length +
        db.plays.length +
        db.secretariat.length +
        db.inquiries.length +
        (db.sponsors || []).length,
      lastUpdated: new Date().toISOString()
    };
    return res.json({ success: true, collections: metadata });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch collection counts.' });
  }
});

// 10. GET /api/database/collections/:id - Retrieve collection records (PIN required)
app.get('/api/database/collections/:id', (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({
      success: false,
      error: 'Restricted: Valid Organizer PIN is required to access personal registrant data.'
    });
  }

  try {
    const { id } = req.params;
    const db = getDatabase();
    const validKeys: (keyof DatabaseSchema)[] = ['delegates', 'tickets', 'plays', 'secretariat', 'inquiries', 'sponsors'];
    
    if (!validKeys.includes(id as keyof DatabaseSchema)) {
      return res.status(404).json({ error: `Collection '${id}' not found.` });
    }

    const items = db[id as keyof DatabaseSchema] || [];
    return res.json({
      success: true,
      collection: id,
      count: items.length,
      data: items
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve collection.' });
  }
});

// 11. POST /api/database/clear - Clear collection records (PIN required)
app.post('/api/database/clear', (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({
      success: false,
      error: 'Restricted: Valid Organizer PIN is required to modify database records.'
    });
  }

  try {
    const { collection } = req.body;
    let db = getDatabase();

    if (collection && collection !== 'all') {
      const validKeys: (keyof DatabaseSchema)[] = ['delegates', 'tickets', 'plays', 'secretariat', 'inquiries', 'sponsors'];
      if (validKeys.includes(collection as keyof DatabaseSchema)) {
        db[collection as keyof DatabaseSchema] = [];
      } else {
        return res.status(400).json({ error: `Invalid collection: ${collection}` });
      }
    } else {
      db = {
        delegates: [],
        tickets: [],
        plays: [],
        secretariat: [],
        inquiries: [],
        sponsors: []
      };
    }

    saveDatabase(db);
    return res.json({
      success: true,
      message: collection && collection !== 'all' ? `Collection '${collection}' cleared.` : 'All collections purged.',
      db
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to clear database records.' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    festival: 'Cultrahus Sangam 2026',
    date: '18 October 2026',
    venue: 'TBA',
    timestamp: new Date().toISOString()
  });
});

// Explicit JSON 404 handler for all unmatched API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.path} not found.`
  });
});

// Centralized Express error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled server error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error processing request.'
    });
  }
  next(err);
});

// Process crash guards
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception caught:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection caught:', reason);
});

// -------------------------------------------------------------
// Vite middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cultrahus Sangam 2026 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
