import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../src/context/AppContext';
import { StudentDashboardPage } from '../src/pages/StudentDashboardPage';
import { getRequests } from '../src/services/requestService';
import type { ServiceRequest } from '../src/types';

vi.mock('../src/services/requestService', () => ({
  getRequests: vi.fn(),
}));

const sample: ServiceRequest = {
  id: 'req-1',
  title: 'Loose socket',
  description: 'The wall socket beside the whiteboard sparks when used.',
  category: 'Electrical',
  location: 'Block B - Room 204',
  priority: 'Critical',
  status: 'Pending',
  resolutionNotes: '',
  submittedBy: 'Aisha Khan',
  createdAt: '2026-10-09T09:00:00.000Z',
  updatedAt: '2026-10-09T09:00:00.000Z',
};

describe('Student dashboard', () => {
  it('renders request totals and the latest request', async () => {
    vi.mocked(getRequests).mockResolvedValue({
      requests: [sample],
      total: 1,
      page: 1,
      limit: 50,
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppProvider>
          <StudentDashboardPage />
        </AppProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Student Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('Loose socket')).toBeInTheDocument();
    expect(screen.getByText('My requests')).toBeInTheDocument();
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
  });
});
