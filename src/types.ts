export interface AuditMetadata {
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

export type DisciplineCategory =
  | 'Solo Dance'
  | 'Group Dance'
  | 'Solo Music'
  | 'Group Music'
  | 'Act'
  | 'Group Act'
  | string;

export interface DelegateRecord {
  id: string;
  accreditationCode: string;
  fullName: string;
  email: string;
  whatsappPhone: string;
  institution: string;
  cityState: string;
  participationCategory: DisciplineCategory;
  parliamentTrack: string;
  priorExperience: string;
  registrationFee: number;
  currency: string;
  status: string;
  festivalDate: string;
  venue: string;
  appliedCode?: string;
  addedBy: AuditMetadata;
}

export type TicketTier = 'classic' | 'royal' | 'sovereign';

export interface TicketRecord {
  id: string;
  ticketCode: string;
  fullName: string;
  email: string;
  whatsappPhone: string;
  tier: TicketTier;
  tierName: string;
  quantity: number;
  seats: string[];
  foodAddon: 'none' | 'sattvic_thali' | 'high_tea_box';
  totalAmount: number;
  currency: string;
  status: string;
  accessBadge: string;
  festivalDate: string;
  venue: string;
  addedBy: AuditMetadata;
}

export interface PlayRecord {
  id: string;
  troupeCode: string;
  troupeName: string;
  playTitle: string;
  playwright: string;
  director: string;
  contactPerson: string;
  email: string;
  whatsappPhone: string;
  category: 'Proscenium' | 'Nukkad (Street Play)';
  castCrewCount: number;
  durationMinutes: number;
  synopsis: string;
  technicalRider: string;
  status: string;
  festivalDate: string;
  addedBy: AuditMetadata;
}

export interface SecretariatRecord {
  id: string;
  applicationCode: string;
  fullName: string;
  email: string;
  whatsappPhone: string;
  previousExperience: string;
  department: 'MANAGEMENT' | 'CONTENT' | 'GRAPHICS' | 'OUTREACH' | 'FINANCE' | string;
  whyJoin: string;
  timeCommitment: string;
  referredBy: string;
  status: string;
  festivalDate: string;
  addedBy: AuditMetadata;
}

export interface InquiryRecord {
  id: string;
  inquiryCode: string;
  fullName: string;
  email: string;
  whatsappPhone: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  addedBy: AuditMetadata;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Registration' | 'Tickets' | 'Venue' | 'Participation';
}

export interface AuditoriumSeat {
  id: string;
  row: string;
  number: number;
  tier: TicketTier;
  price: number;
  status: 'available' | 'reserved';
}

export type SponsorshipTier =
  | 'Silver Partner'
  | 'Gold Partner'
  | 'Platinum Partner'
  | 'Presenting Partner';

export interface SponsorRecord {
  id: string;
  sponsorCode: string;
  tier: SponsorshipTier;
  amount: number;
  companyName: string;
  contactPerson: string;
  email: string;
  whatsappPhone: string;
  city: string;
  industry?: string;
  website?: string;
  activationSpace: 'Yes' | 'No' | 'Custom Request' | string;
  objectives?: string;
  notes?: string;
  deckFileName?: string;
  deckFileSize?: number;
  deckFileType?: string;
  deckFileData?: string;
  status: string;
  addedBy: AuditMetadata;
}
