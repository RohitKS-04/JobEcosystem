import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts';
import {
  LandingPage,
  DashboardPage,
  SavedPage,
  SettingsPage,
  DigestPage,
  ProofPage,
  TestChecklistPage,
  ShipPage,
} from '../features/dashboard/pages';
import { NotFoundPage } from './NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/digest" element={<DigestPage />} />
        <Route path="/jt/07-test" element={<TestChecklistPage />} />
        <Route path="/jt/08-ship" element={<ShipPage />} />
        <Route path="/jt/proof" element={<ProofPage />} />
        <Route path="/proof" element={<ProofPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
