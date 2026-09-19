import { FAQItem, AuditoriumSeat, TicketTier } from '../types';

export const FESTIVAL_GENRES = [
  {
    title: 'Theatre & Nukkad Natak',
    badge: 'Flagship Conclave',
    tagline: 'Proscenium Grandeur & Street Voices',
    description: 'From introspective proscenium productions with intricate lighting cues to raw, pulse-pounding street plays in the open amphitheatre.',
    color: 'border-[#5b6e41]/40 bg-[#ebf0e2]/60'
  },
  {
    title: 'Indian Dance Assemblies',
    badge: 'Heritage & Modern',
    tagline: 'Kathak, Odissi, Bharatnatyam & Fusion',
    description: 'Expressive mudras, rigorous footwork, and contemporary physical theatre celebrating timeless aesthetic rasas.',
    color: 'border-[#708051]/40 bg-[#f4efe4]/80'
  },
  {
    title: 'Live Music Bands & Fusion',
    badge: 'Acoustic & Electric',
    tagline: 'Sufi, Folk Rock & Hindustani Grooves',
    description: 'High-octane collegiate and professional ensembles uniting sarangi, electric bass, dholak, and soul-stirring vocal melodies.',
    color: 'border-[#5b6e41]/35 bg-[#e8ede0]/60'
  },
  {
    title: 'Dandiya & Garba Raas',
    badge: 'Cultural Festive',
    tagline: 'Traditional Rhythms & Community Circles',
    description: 'An open-air evening extravaganza of traditional dhol rhythms, authentic choreography, and colorful festive attire.',
    color: 'border-[#c59a3f]/40 bg-[#faf6eb]'
  },
  {
    title: 'Celebrity Guest DJ & EDM',
    badge: 'Youth Euphoria',
    tagline: 'Electronic Sangeet & Soundscapes',
    description: 'Grand festival finale bringing youth energy with headliner festival remixes, bass drops, and visual stage projections.',
    color: 'border-[#43522e]/40 bg-[#e2ead7]/60'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Registration',
    question: 'What is included in the ₹650 Accredited Delegate Pass?',
    answer: 'The ₹650 Delegate Accreditation grants you all-day VIP access across all 5 festival stages and performance halls, an official Delegate Kit with the 2026 Conclave Monograph, voting rights in the Cultural Parliament session, and an authenticated digital certificate of representation.'
  },
  {
    id: 'faq-2',
    category: 'Tickets',
    question: 'How do Conclave Ticket passes differ between Classic, Royal, and VIP Sovereign?',
    answer: 'Classic (₹200, crossed from ₹350) offers general amphitheatre & auditorium entry with no food included. Royal (₹400, crossed from ₹600) includes reserved mid-tier auditorium seating and a high-tea refreshment box. VIP Sovereign (₹600, crossed from ₹1,050) guarantees front-row seating (Rows A-B), fast-track security access, and food included (complimentary royal banquet dining). IMPORTANT: Every pass tier includes complete unrestricted entry to both the Grand Garba Night / Dandiya Raas and the Celebrity DJ Night at zero extra charge!'
  },
  {
    id: 'faq-3',
    category: 'Participation',
    question: 'How are theatre troupes and street plays selected?',
    answer: 'Troupes submit their play details, synopsis, and technical riders via the Troupe Registration portal. Our jury panel curates 16 proscenium productions and 24 street play finalists. All selected troupes receive official letters of invitation.'
  },
  {
    id: 'faq-4',
    category: 'Venue',
    question: 'Where is Cultrahus Sangam 2026 taking place, and how do I reach it?',
    answer: 'Venue: TBA. The central festival secretariat is finalizing the central auditorium complex in New Delhi to accommodate 1,200+ delegates and proscenium stages. All confirmed delegates, collegiate troupes, and ticket holders will receive exact location coordinates, entry gates, and transit guidelines directly via WhatsApp and registered Email.'
  },
  {
    id: 'faq-5',
    category: 'Registration',
    question: 'What happens immediately after I submit my delegate or ticket form?',
    answer: 'You will receive an instant official reference code (e.g. SNGM-DEL-XXXXX or SNGM-TKT-XXXXX) along with a verifiable digital pass preview containing a secure QR code and audit metadata. You can save, print, or download your pass immediately.'
  }
];

export const ADVISORY_BOARD = [
  {
    name: 'Prof. Virendra N. Kaul',
    role: 'Festival Chairman & Senior Dramaturge',
    title: 'Former Dean, National School of Drama, New Delhi',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Padmashri Smt. Meenakshi Sanyal',
    role: 'Dean of Performing Arts & Classical Choreography',
    title: 'Distinguished Fellow, Sangeet Natak Akademi',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Harshavardhan Trivedi',
    role: 'Chairperson, Cultural Parliament & Policy Forum',
    title: 'Author of "The Theatre of the Indian Republic"',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rituja Sen Choudhury',
    role: 'Convenor, Secretariat & Youth Council',
    title: 'Founder, Cultrahus Heritage & Arts Initiative',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
  }
];

export function generateInitialSeatMap(): AuditoriumSeat[] {
  const seats: AuditoriumSeat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const reservedKeys = new Set(['A-3', 'A-4', 'B-7', 'C-5', 'D-9', 'E-2']);

  rows.forEach((row) => {
    let tier: TicketTier = 'classic';
    let price = 200;
    if (row === 'A' || row === 'B') {
      tier = 'sovereign';
      price = 600;
    } else if (row === 'C' || row === 'D') {
      tier = 'royal';
      price = 400;
    }

    for (let num = 1; num <= 14; num++) {
      const id = `${row}-${num}`;
      seats.push({
        id,
        row,
        number: num,
        tier,
        price,
        status: reservedKeys.has(id) ? 'reserved' : 'available'
      });
    }
  });

  return seats;
}
