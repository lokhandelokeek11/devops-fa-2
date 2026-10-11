import request from 'supertest';
import app from '../src/app';

const validRequest = {
  title: 'Broken classroom projector',
  description: 'The projector in room 204 does not display the laptop screen.',
  category: 'Projector',
  location: 'Block A - Room 204',
  priority: 'High',
  submittedBy: 'Aisha Khan',
};

describe('service requests', () => {
  it('creates a request with Pending status', async () => {
    const response = await request(app).post('/api/requests').send(validRequest);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(validRequest.title);
    expect(response.body.data.status).toBe('Pending');
    expect(response.body.data.priority).toBe('High');
    expect(response.body.data.resolutionNotes).toBe('');
  });

  it('rejects an invalid request', async () => {
    const response = await request(app).post('/api/requests').send({
      title: 'Hi',
      description: 'short',
      category: 'Not real',
      location: '',
      priority: 'Urgent',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
    expect(typeof response.body.error).toBe('string');
  });

  it('returns a request by id and lists it', async () => {
    const created = await request(app).post('/api/requests').send(validRequest);
    const id = created.body.data.id as string;

    const fetched = await request(app).get(`/api/requests/${id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.id).toBe(id);
    expect(fetched.body.data.location).toBe(validRequest.location);

    const list = await request(app).get('/api/requests').query({ submittedBy: 'Aisha Khan' });
    expect(list.status).toBe(200);
    expect(list.body.data.total).toBe(1);
    expect(list.body.data.requests).toHaveLength(1);
  });

  it('lets an administrator update status, priority, and resolution notes', async () => {
    const created = await request(app).post('/api/requests').send(validRequest);
    const id = created.body.data.id as string;

    const updated = await request(app).patch(`/api/admin/requests/${id}/status`).send({
      status: 'Resolved',
      priority: 'Medium',
      resolutionNotes: 'Replaced the HDMI cable and confirmed the display.',
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe('Resolved');
    expect(updated.body.data.priority).toBe('Medium');
    expect(updated.body.data.resolutionNotes).toContain('HDMI');

    const stats = await request(app).get('/api/admin/stats');
    expect(stats.status).toBe(200);
    expect(stats.body.data.total).toBe(1);
    expect(stats.body.data.resolved).toBe(1);
  });

  it('returns a consistent error for an unknown request', async () => {
    const response = await request(app).get('/api/requests/00000000-0000-4000-8000-000000000099');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Request not found',
      error: 'Not Found',
    });
  });
});
