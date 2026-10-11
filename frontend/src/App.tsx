import { Route, Routes } from 'react-router-dom';
import { RequireAdmin } from './components/RequireAdmin';
import { AppLayout } from './layouts/AppLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminRequestsPage } from './pages/AdminRequestsPage';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { LandingPage } from './pages/LandingPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<StudentDashboardPage />} />
        <Route path="/requests" element={<MyRequestsPage />} />
        <Route path="/requests/new" element={<CreateRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailsPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <RequireAdmin>
              <AdminRequestsPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
