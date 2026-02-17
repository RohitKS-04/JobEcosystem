import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { PlacementReadinessPage } from './pages/PlacementReadinessPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { JobTrackerPage } from './pages/JobTrackerPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="placement" replace />} />
        <Route path="placement/*" element={<PlacementReadinessPage />} />
        <Route path="resume/*" element={<ResumeBuilderPage />} />
        <Route path="jobs/*" element={<JobTrackerPage />} />
      </Route>
    </Routes>
  );
}
