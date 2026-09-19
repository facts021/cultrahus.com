import React, { useState } from 'react';
import {
  Sparkles,
  Ticket,
  UserCheck,
  MapPin,
  MessageSquare,
  Users,
  Theater,
  Menu,
  X,
  Compass,
  ShieldCheck,
  Lock,
  Crown
} from 'lucide-react';
import { CultrahusLogo } from './CultrahusLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: Compass },
    { id: 'delegate', label: 'Delegate Pass', icon: UserCheck, badge: '₹650' },
    { id: 'tickets', label: 'Book Tickets', icon: Ticket, badge: 'Auditorium' },
    { id: 'troupe', label: 'Troupe Entry', icon: Theater },
    { id: 'secretariat', label: 'Join Secretariat', icon: Users },
    { id: 'sponsor', label: 'Sponsor Us', icon: Crown, badge: 'Packages' },
    { id: 'about', label: 'About & Venue', icon: MapPin },
    { id: 'contact', label: 'Contact Us', icon: MessageSquare }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f6f2e9] border-b border-[#cfc4ad] text-[#242c18] shadow-md">
      {/* Top Banner Stripe */}
      <div className="bg-[#ede4d2] text-[11px] py-1 px-4 text-center font-semibold tracking-wider text-[#3d4c2a] uppercase border-b border-[#dfd6c3]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Sparkles className="w-3 h-3 text-[#788e55]" />
            <span>Sunday, 18 October 2026 • Venue: TBA • Official Conclave Portal</span>
          </div>
          <button
            onClick={() => handleNavClick('admin')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] lowercase font-mono transition-colors ${
              activeTab === 'admin'
                ? 'bg-[#3b4928] text-[#f7f4ec] font-bold'
                : 'text-[#4a5e33] hover:text-[#192111] hover:underline font-semibold'
            }`}
            title="Organizer Portal & Registration Registry"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>organizer registry</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Emblem */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <CultrahusLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#242c18] group-hover:text-[#4a5e33] transition-colors">
                  Cultrahus Sangam
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#ebf0e2] text-[#344222] font-semibold border border-[#c3d3b4]">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-[#556345] tracking-wider uppercase font-medium hidden sm:block">
                National Theatre Conclave & Cultural Parliament
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#3b4928] text-[#f7f4ec] shadow-sm'
                      : 'text-[#384626] hover:text-[#192111] hover:bg-[#eae1cd]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e5d4aa]' : 'text-[#5d7143]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        isActive
                          ? 'bg-[#e5d4aa] text-[#242c18]'
                          : 'bg-[#ebf0e2] text-[#344222] border border-[#c3d3b4]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs border ${
                activeTab === 'admin'
                  ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18]'
                  : 'bg-[#ede4d2] hover:bg-[#e1d5bd] text-[#242c18] border-[#c7bca5]'
              }`}
              title="Restricted Organizer Registration Registry - View all registered persons"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-[#e5d4aa]' : 'text-[#3b4928]'}`} />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => handleNavClick('delegate')}
              className="px-3.5 py-2 rounded-md text-xs font-bold bg-[#ede4d2] hover:bg-[#e3d7bf] text-[#28351b] border border-[#c7bca5] transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#4a5e33]" />
              <span>Accreditation</span>
            </button>
            <button
              onClick={() => handleNavClick('tickets')}
              className="px-4 py-2 rounded-md text-xs font-bold bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-sans shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5 text-[#e5d4aa]" />
              <span>Book Pass</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 rounded-md text-[#344222] hover:text-[#182010] hover:bg-[#eae1cd] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#f6f2e9] border-t border-[#cfc4ad] px-4 pt-3 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="text-[11px] uppercase tracking-widest text-[#556345] px-3 pb-2 font-bold">
            Festival Portals & Information
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#3b4928] text-[#f7f4ec]'
                    : 'text-[#384626] hover:bg-[#eae1cd] hover:text-[#192111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#e5d4aa]' : 'text-[#5d7143]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ebf0e2] text-[#344222] font-bold border border-[#c3d3b4]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('delegate')}
              className="w-full py-2.5 rounded-md text-xs font-bold bg-[#ede4d2] text-[#28351b] border border-[#c7bca5] text-center"
            >
              Delegate Pass ₹650
            </button>
            <button
              onClick={() => handleNavClick('tickets')}
              className="w-full py-2.5 rounded-md text-xs font-bold bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] text-center shadow"
            >
              Book Passes
            </button>
          </div>
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#f7f4ec] bg-[#3b4928] hover:bg-[#485932] border border-[#2e3a1f] flex items-center justify-center gap-2 transition shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#e5d4aa]" />
              <span>Admin Portal (Registered Attendees Registry)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
