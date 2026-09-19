import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { DelegateFormView } from './components/DelegateFormView';
import { TicketBookingView } from './components/TicketBookingView';
import { TroupeRegistrationView } from './components/TroupeRegistrationView';
import { SecretariatPortalView } from './components/SecretariatPortalView';
import { AboutAndVenueView } from './components/AboutAndVenueView';
import { ContactInquiryView } from './components/ContactInquiryView';
import { SponsorUsView } from './components/SponsorUsView';
import { AdminRegistryView } from './components/AdminRegistryView';
import { Footer } from './components/Footer';
import { PrintablePassModal } from './components/PrintablePassModal';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [passModalData, setPassModalData] = useState<any | null>(null);

  // Clean and normalize incoming tab name
  const normalizeTab = (raw: string): string => {
    const cleaned = (raw || '').replace(/^[#/]+/, '').trim().toLowerCase();
    const validTabs = ['home', 'delegate', 'tickets', 'troupe', 'secretariat', 'about', 'contact', 'sponsor', 'admin'];
    if (validTabs.includes(cleaned)) return cleaned;
    if (cleaned === 'ticket') return 'tickets';
    if (cleaned === 'delegates' || cleaned === 'accreditation') return 'delegate';
    if (cleaned === 'plays' || cleaned === 'play') return 'troupe';
    return 'home';
  };

  // Read URL hash on load for deep linking if present (e.g. #tickets or #delegate)
  useEffect(() => {
    const syncFromUrl = () => {
      const hash = window.location.hash;
      if (hash) {
        setActiveTab(normalizeTab(hash));
      }
    };

    syncFromUrl();
    window.addEventListener('hashchange', syncFromUrl);

    // Stealth shortcut (Ctrl+Shift+A or Alt+Shift+A) to open organizer registry
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleTabChange('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Guarantee viewport scrolls to top when activeTab changes to prevent blank screen perception
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    const cleanTab = normalizeTab(tab);
    setActiveTab(cleanTab);
    try {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `#${cleanTab}`);
      } else {
        window.location.hash = cleanTab;
      }
    } catch {
      // ignore
    }
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ec] text-[#242c18] selection:bg-[#5a6c42]/25 selection:text-[#1d2414]">
      
      {/* Sticky Public Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1">
        <ErrorBoundary fallbackTitle="Cultrahus Sangam Portal">
          {activeTab === 'home' && <HomeView setActiveTab={handleTabChange} />}
          {activeTab === 'delegate' && (
            <DelegateFormView onPassGenerated={(data) => setPassModalData(data)} />
          )}
          {activeTab === 'tickets' && (
            <TicketBookingView onPassGenerated={(data) => setPassModalData(data)} />
          )}
          {activeTab === 'troupe' && (
            <TroupeRegistrationView onPassGenerated={(data) => setPassModalData(data)} />
          )}
          {activeTab === 'secretariat' && (
            <SecretariatPortalView onPassGenerated={(data) => setPassModalData(data)} />
          )}
          {activeTab === 'about' && <AboutAndVenueView />}
          {activeTab === 'contact' && <ContactInquiryView />}
          {activeTab === 'sponsor' && <SponsorUsView />}
          {activeTab === 'admin' && (
            <AdminRegistryView
              onClose={() => handleTabChange('home')}
              onViewPass={(data) => setPassModalData(data)}
            />
          )}

          {/* Safety fallback if activeTab is unrecognized or blank */}
          {!['home', 'delegate', 'tickets', 'troupe', 'secretariat', 'about', 'contact', 'sponsor', 'admin'].includes(activeTab) && (
            <HomeView setActiveTab={handleTabChange} />
          )}
        </ErrorBoundary>
      </main>

      {/* Printable / Authenticated Festival Pass Modal */}
      {passModalData && (
        <PrintablePassModal
          passData={passModalData}
          onClose={() => setPassModalData(null)}
        />
      )}

      {/* Public Footer */}
      <Footer setActiveTab={handleTabChange} />

    </div>
  );
}
