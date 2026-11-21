import React, { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { applyAppIdentity } from './lib/pwa';
import MaintenancePage from './components/MaintenancePage';
import { PublicLayout } from './components/site/Chrome';
import { RequireRole } from './components/Guards';
import Home from './pages/public/Home';

// Pages chargées à la demande (le téléphone ne télécharge que ce qui est affiché)
function lazyNamed<T extends Record<string, any>, K extends keyof T>(load: () => Promise<T>, name: K) {
  return lazy(() => load().then((mod) => ({ default: mod[name] as React.ComponentType<any> })));
}
const PageLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center" aria-label="Chargement">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-ember/30 border-t-ember" />
  </div>
);

const Services = lazy(() => import('./pages/public/Services'));
const Studio = lazy(() => import('./pages/public/Studio'));
const EquipmentPage = lazy(() => import('./pages/public/EquipmentPage'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Booking = lazy(() => import('./pages/public/Booking'));
const NotFound = lazyNamed(() => import('./pages/public/ActionPages'), 'NotFound');
const PaymentAction = lazyNamed(() => import('./pages/public/ActionPages'), 'PaymentAction');
const PaymentReturn = lazyNamed(() => import('./pages/public/ActionPages'), 'PaymentReturn');
const PresenceAction = lazyNamed(() => import('./pages/public/ActionPages'), 'PresenceAction');
const ForgotPassword = lazyNamed(() => import('./pages/auth/AuthPages'), 'ForgotPassword');
const Login = lazyNamed(() => import('./pages/auth/AuthPages'), 'Login');
const Register = lazyNamed(() => import('./pages/auth/AuthPages'), 'Register');
const ResetPassword = lazyNamed(() => import('./pages/auth/AuthPages'), 'ResetPassword');
const AccountDashboard = lazyNamed(() => import('./pages/account/Account'), 'AccountDashboard');
const AccountLayout = lazyNamed(() => import('./pages/account/Account'), 'AccountLayout');
const AccountProfile = lazyNamed(() => import('./pages/account/Account'), 'AccountProfile');
const AccountReservations = lazyNamed(() => import('./pages/account/Account'), 'AccountReservations');
const StaffLayout = lazyNamed(() => import('./pages/staff/StaffLayout'), 'StaffLayout');
const StaffLogin = lazyNamed(() => import('./pages/staff/StaffLayout'), 'StaffLogin');
const AdminCalendar = lazyNamed(() => import('./pages/admin/Overview'), 'AdminCalendar');
const AdminDashboard = lazyNamed(() => import('./pages/admin/Overview'), 'AdminDashboard');
const AdminPayments = lazyNamed(() => import('./pages/admin/Overview'), 'AdminPayments');
const AdminReservations = lazyNamed(() => import('./pages/admin/Reservations'), 'AdminReservations');
const AdminOrders = lazyNamed(() => import('./pages/admin/Orders'), 'AdminOrders');
const AdminProductions = lazyNamed(() => import('./pages/admin/Productions'), 'AdminProductions');
const AdminClients = lazyNamed(() => import('./pages/admin/People'), 'AdminClients');
const AdminTeam = lazyNamed(() => import('./pages/admin/People'), 'AdminTeam');
const AdminEquipment = lazyNamed(() => import('./pages/admin/Catalog'), 'AdminEquipment');
const AdminGallery = lazyNamed(() => import('./pages/admin/Catalog'), 'AdminGallery');
const AdminServices = lazyNamed(() => import('./pages/admin/Catalog'), 'AdminServices');
const AdminAvailability = lazyNamed(() => import('./pages/admin/Settings'), 'AdminAvailability');
const AdminSettings = lazyNamed(() => import('./pages/admin/Settings'), 'AdminSettings');
const InvoiceList = lazyNamed(() => import('./pages/shared/Invoices'), 'InvoiceList');
const InvoiceView = lazyNamed(() => import('./pages/shared/Invoices'), 'InvoiceView');
const PublicInvoice = lazyNamed(() => import('./pages/shared/Invoices'), 'PublicInvoice');
const EngineerAbsences = lazyNamed(() => import('./pages/engineer/Engineer'), 'EngineerAbsences');
const EngineerCalendar = lazyNamed(() => import('./pages/engineer/Engineer'), 'EngineerCalendar');
const EngineerHome = lazyNamed(() => import('./pages/engineer/Engineer'), 'EngineerHome');
const EngineerProfile = lazyNamed(() => import('./pages/engineer/Engineer'), 'EngineerProfile');

// Mode maintenance : passer à true pour afficher uniquement la page de maintenance
const MAINTENANCE = false;

const App: React.FC = () => {
  const { pathname } = useLocation();
  // Application « Westaf Admin » (noire) pour /admin et /ingenieur, « Westaf Records » (blanche) ailleurs
  useEffect(() => { applyAppIdentity(pathname); }, [pathname]);
  if (MAINTENANCE) return <MaintenancePage />;
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="facture/:token" element={<PublicInvoice />} />
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
        <Route path="commandes" element={<AdminOrders />} />
        <Route path="calendrier" element={<AdminCalendar />} />
        <Route path="paiements" element={<AdminPayments />} />
        <Route path="factures" element={<InvoiceList scope="admin" />} />
        <Route path="factures/:id" element={<InvoiceView scope="admin" />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="ingenieurs" element={<AdminTeam kind="engineer" />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="equipements" element={<AdminEquipment />} />
        <Route path="galerie" element={<AdminGallery />} />
        <Route path="productions" element={<AdminProductions />} />
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
    </Suspense>
  );
};

export default App;
