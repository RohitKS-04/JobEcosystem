import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../features/marketing/pages/LandingPage';
import {
  AssessmentsPage,
  DashboardPage,
  PracticePage,
  ProfilePage,
  ResourcesPage,
} from '../features/platform/pages';
import { DashboardLayout } from '../layouts';
import { NotFoundPage } from './NotFoundPage';

// Job Tracker Components
const JobTrackerDashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-slate-900">Job Tracker</h2>
    </div>
    <div className="grid gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Track Your Job Applications</h3>
        <p className="text-slate-600 mb-4">Monitor your job search progress, track applications, and manage interview schedules.</p>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg bg-slate-50 p-4">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-slate-600">Applied</div>
          </div>
          <div className="flex-1 rounded-lg bg-slate-50 p-4">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-slate-600">Interviews</div>
          </div>
          <div className="flex-1 rounded-lg bg-slate-50 p-4">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-slate-600">Offers</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="jobs" element={<JobTrackerDashboard />} />
                <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
