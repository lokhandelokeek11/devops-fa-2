import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('reports that the service and database are available', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('smart-campus-backend');
    expect(response.body.database).toBe('connected');
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('answers the liveness probe without checking the database', async () => {
    const response = await request(app).get('/api/health/live');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('smart-campus-backend');
  });
});

describe('GET /metrics', () => {
  it('exposes Prometheus metrics', async () => {
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toContain('http_requests_total');
    expect(response.text).toContain('http_request_duration_seconds');
    expect(response.text).toContain('http_active_requests');
    expect(response.text).toContain('app_uptime_seconds');
  });
});
