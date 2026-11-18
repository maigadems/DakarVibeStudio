import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MaintenancePage from './components/MaintenancePage';
import { PublicLayout } from './components/site/Chrome';
import { RequireRole } from './components/Guards';
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import Studio from './pages/public/Studio';
import EquipmentPage from './pages/public/EquipmentPage';
import Contact from './pages/public/Contact';
import Booking from './pages/public/Booking';
import { NotFound, PaymentAction, PaymentReturn, PresenceAction } from './pages/public/ActionPages';
import { ForgotPassword, Login, Register, ResetPassword } from './pages/auth/AuthPages';
import { AccountDashboard, AccountLayout, AccountProfile, AccountReservations } from './pages/account/Account';
import { StaffLayout, StaffLogin } from './pages/staff/StaffLayout';
import { AdminCalendar, AdminDashboard, AdminPayments } from './pages/admin/Overview';
import { AdminReservations } from './pages/admin/Reservations';
import { AdminClients, AdminTeam } from './pages/admin/People';
import { AdminEquipment, AdminGallery, AdminServices } from './pages/admin/Catalog';
import { AdminAvailability, AdminSettings } from './pages/admin/Settings';
import { InvoiceList, InvoiceView } from './pages/shared/Invoices';
import { EngineerAbsences, EngineerCalendar, EngineerHome, EngineerProfile } from './pages/engineer/Engineer';

// Mode maintenance : passer à true pour afficher uniquement la page de maintenance
const MAINTENANCE = false;

const App: React.FC = () => {
  if (MAINTENANCE) return <MaintenancePage />;
  return (
    <Routes>
      {/* Site public */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="studio" element={<Studio />} />
        <Route path="galerie" element={<Navigate to="/studio" replace />} />
        <Route path="equipements" element={<EquipmentPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="tarifs" element={<Navigate to="/services" replace />} />
        <Route path="reservation" element={<Booking />} />
        <Route path="paiement/retour" element={<PaymentReturn />} />
        <Route path="paiement/:token" element={<PaymentAction />} />
        <Route path="presence/:token" element={<PresenceAction />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Authentification */}
      <Route path="connexion" element={<Login />} />
      <Route path="inscription" element={<Register />} />
      <Route path="mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="reinitialiser-mot-de-passe" element={<ResetPassword />} />

      {/* Espace client */}
      <Route path="mon-espace" element={<RequireRole roles={['client']}><AccountLayout /></RequireRole>}>
        <Route index element={<AccountDashboard />} />
        <Route path="reservations" element={<AccountReservations />} />
        <Route path="factures" element={<InvoiceList scope="client" />} />
        <Route path="factures/:id" element={<InvoiceView scope="client" />} />
        <Route path="profil" element={<AccountProfile />} />
      </Route>

      {/* Administration (Jeuss + super admin) */}
      <Route path="admin" element={<StaffLogin />} />
      <Route path="admin" element={<RequireRole roles={['admin', 'super_admin']} loginPath="/admin"><StaffLayout kind="admin" /></RequireRole>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="calendrier" element={<AdminCalendar />} />
        <Route path="paiements" element={<AdminPayments />} />
        <Route path="factures" element={<InvoiceList scope="admin" />} />
        <Route path="factures/:id" element={<InvoiceView scope="admin" />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="ingenieurs" element={<AdminTeam kind="engineer" />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="equipements" element={<AdminEquipment />} />
        <Route path="galerie" element={<AdminGallery />} />
        <Route path="disponibilites" element={<AdminAvailability />} />
        <Route path="parametres" element={<AdminSettings />} />
        <Route path="administrateurs" element={<RequireRole roles={['super_admin']} loginPath="/admin"><AdminTeam kind="admin" /></RequireRole>} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Ingénieur du son */}
      <Route path="ingenieur" element={<RequireRole roles={['engineer']} loginPath="/admin"><StaffLayout kind="engineer" /></RequireRole>}>
        <Route index element={<EngineerHome />} />
        <Route path="calendrier" element={<EngineerCalendar />} />
        <Route path="disponibilites" element={<EngineerAbsences />} />
        <Route path="profil" element={<EngineerProfile />} />
        <Route path="*" element={<Navigate to="/ingenieur" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
