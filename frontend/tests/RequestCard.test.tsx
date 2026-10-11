import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RequestCard } from '../src/components/RequestCard';
import type { ServiceRequest } from '../src/types';

const request: ServiceRequest = {
  id: 'req-2',
  title: 'Library Wi-Fi drops',
  description: 'The connection resets every few minutes on the second floor.',
  category: 'Wi-Fi',
  location: 'Central Library - Floor 2',
  priority: 'High',
  status: 'In Progress',
  resolutionNotes: '',
  submittedBy: 'Rahul Menon',
  createdAt: '2026-10-09T10:30:00.000Z',
  updatedAt: '2026-10-09T10:30:00.000Z',
};

describe('Request card', () => {
  it('shows the title, status, and priority', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RequestCard request={request} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Library Wi-Fi drops')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getAllByTestId('status-badge')).toHaveLength(2);
  });
});
