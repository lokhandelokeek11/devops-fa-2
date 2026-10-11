import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../src/context/AppContext';
import { CreateRequestPage } from '../src/pages/CreateRequestPage';

vi.mock('../src/services/requestService', () => ({
  createRequest: vi.fn(),
}));

describe('Create request form', () => {
  it('renders the fields a student must complete', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppProvider>
          <CreateRequestPage />
        </AppProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit request' })).toBeInTheDocument();
    expect(screen.getByTestId('request-form')).toBeInTheDocument();
  });
});
