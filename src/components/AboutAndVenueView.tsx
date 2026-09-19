import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Train,
  Car,
  ShieldAlert,
  Award,
  Users,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Phone,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { ADVISORY_BOARD } from '../data/festivalData';
import { CultrahusLogo } from './CultrahusLogo';

export const AboutAndVenueView: React.FC = () => {
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('All');

  const galleryImages = [
    {
      id: 1,
      title: 'Proscenium Lighting & Climax Monologue',
      category: 'Theatre',
      url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Street Theatre (Nukkad) High-Decibel Circle',
      category: 'Street Play',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Classical Kathak Rhythm & Mudra Ensemble',
      category: 'Dance',
      url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Youth Cultural Parliament Plenary Hall',
      category: 'Parliament',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'Indie Folk Fusion Percussion Live',
      category: 'Music',
      url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 6,
      title: 'Grand Evening Garba & Dandiya Under Lights',
      category: 'Dandiya & Finale',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const filteredGallery = galleryImages.filter(
    (item) => selectedGalleryCategory === 'All' || item.category === selectedGalleryCategory
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Mission Section */}
      <section className="text-center max-w-3xl mx-auto flex flex-col items-center">
        <CultrahusLogo size="lg" className="mb-4" />
        <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-2">
          Cultural Manifesto & Heritage
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#242c18] leading-tight">
          About Cultrahus Sangam
        </h1>
        <p className="mt-4 text-[#556345] text-base leading-relaxed">
          Established as a national forum for proscenium excellence and cultural democratic thought, <strong>Cultrahus Sangam</strong> bridges classical Indian aesthetics with progressive contemporary youth expressions.
        </p>
      </section>

      {/* Narrative Card */}
      <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-2xl p-8 sm:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-[#4f5c40] text-sm leading-relaxed">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#242c18]">
            The Stage as the Republic’s Conscience
          </h2>
          <p>
            Theatre in India has perpetually served as the vanguard of societal transformation. From the ancient dramaturgy of Bharata Muni’s Natyashastra to the fervent post-independence street movements of IPTA, live performance is our country’s collective memory.
          </p>
          <p>
            On Sunday, October 18, 2026, over 1,200 delegates, collegiate troupes, and cultural lawmakers will convene in the capital to ratify the <em>2026 Performing Arts Manifesto</em> and compete for the Sovereign Natya Puraskar.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ebf0e2] text-[#344222] font-semibold text-xs border border-[#c9d6ba]">
              <Sparkles className="w-3.5 h-3.5 text-[#5b6e41]" />
              <span>Conclave Date: Sunday, 18 October 2026</span>
            </span>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-[#cfc5b0] shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800&auto=format&fit=crop&q=80"
            alt="Theatre Ensemble Stage Lighting"
            referrerPolicy="no-referrer"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#202816] via-transparent to-transparent opacity-85" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d7c494]">National Stage</span>
            <p className="font-serif font-bold text-sm">Venue: TBA</p>
          </div>
        </div>
      </div>

      {/* Official Venue Announcement Card */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-2">
            Festival Grounds & Logistics
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-[#242c18]">
            Venue Announcement
          </h2>
          <p className="mt-2 text-[#586447] text-sm">
            Important directive regarding the festival complex and auditorium allocation in New Delhi.
          </p>
        </div>

        <div className="bg-[#fbf9f4] border-2 border-[#cfc5b0] rounded-3xl p-8 sm:p-10 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#dfd7c5]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#364325] text-[#f4efe4] flex items-center justify-center shrink-0 shadow">
                <MapPin className="w-7 h-7 text-[#d7c494]" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-[#ebf0e2] text-[#334122] border border-[#c4d2b5] inline-block mb-1">
                  Location Status
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18]">
                  Venue: TBA
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/919818561227"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#364325] hover:bg-[#455430] text-[#f4efe4] text-xs font-bold rounded-xl transition-colors shadow"
              >
                <Phone className="w-3.5 h-3.5 text-[#d7c494]" />
                <span>Contact Us: +91 98185 61227</span>
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#526042] leading-relaxed">
            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c5] space-y-2">
              <span className="font-bold text-[#242c18] block text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#5b6e41]" />
                Venue Announcement Notice
              </span>
              <p>
                The official auditorium complex and venue in New Delhi: <strong>TBA</strong>. To accommodate the expanding participation of 1,200+ delegates and proscenium society stages, the national secretariat will announce the final central auditorium allotment.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c5] space-y-2">
              <span className="font-bold text-[#242c18] block text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5b6e41]" />
                Direct Delegate Dispatch
              </span>
              <p>
                All registered delegates, performing collegiate troupes, and ticket holders will receive full venue directions, transit guidelines, gate pass numbers, and Google Map pins directly via official WhatsApp and Email.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c5] space-y-2">
              <span className="font-bold text-[#242c18] block text-sm flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#5b6e41]" />
                Helpline & Assistance
              </span>
              <p>
                If you have accommodation queries, group transit questions, or bulk university arrivals, please Contact Us at our central secretariat desk for dedicated liaison support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-2">
            Eminent Patrons & Mentors
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-[#242c18]">
            Festival Advisory Board
          </h2>
          <p className="mt-2 text-[#586447] text-sm">
            Distinguished theatricians, national fellowship awardees, and policy scholars steering Cultrahus Sangam 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVISORY_BOARD.map((member, i) => (
            <div
              key={i}
              className="bg-[#fbf9f4] border border-[#d9d0be] rounded-2xl p-5 shadow-sm text-center flex flex-col items-center"
            >
              <img
                src={member.image}
                alt={member.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover border-2 border-[#5b6e41]/50 mb-4 shadow"
              />
              <h3 className="font-serif text-base font-bold text-[#242c18]">{member.name}</h3>
              <p className="text-xs font-semibold text-[#5a6c42] mt-0.5">{member.role}</p>
              <p className="text-[11px] text-[#6b775f] mt-2">{member.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Media Photo Gallery */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-1">
              Photographic Archives
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-[#242c18]">
              Festival Media Gallery
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', 'Theatre', 'Street Play', 'Dance', 'Parliament', 'Music'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedGalleryCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedGalleryCategory === cat
                    ? 'bg-[#364325] text-[#d7c494] shadow'
                    : 'bg-white border border-[#dfd7c5] text-[#556345] hover:bg-[#f4efe4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-2xl overflow-hidden shadow border border-[#cfc5b0] bg-stone-900"
            >
              <img
                src={img.url}
                alt={img.title}
                referrerPolicy="no-referrer"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-mono text-[#d7c494] font-bold uppercase tracking-wider">
                  {img.category}
                </span>
                <h4 className="font-serif text-sm font-bold text-white mt-1">
                  {img.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
