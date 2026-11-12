import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Server REST API Endpoints', () => {
  it('GET /api/health returns 200 and status "ok"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('services');
  });

  it('GET /api/presets returns success true and a non-empty presets array', async () => {
    const res = await request(app).get('/api/presets');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.presets)).toBe(true);
    expect(res.body.presets.length).toBeGreaterThan(0);
  });

  it('POST /api/scan-and-generate with no image returns an error status (400 or 500) and success false', async () => {
    const res = await request(app)
      .post('/api/scan-and-generate')
      .send({});
    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/publish with a sample listing returns success true and a product with an id and status "active"', async () => {
    const sampleListing = {
      product: {
        title: 'Premium Insulated Water Bottle',
        category: 'Sports & Outdoors',
        description: 'Stainless steel bottle keeps water cold for 24 hours.',
        tags: ['bottle', 'stainless steel'],
        suggestedPrice: 799
      }
    };

    const res = await request(app)
      .post('/api/publish')
      .send(sampleListing);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('product');
    expect(res.body.product).toHaveProperty('id');
    expect(res.body.product.status).toBe('active');
    expect(res.body.product.title).toBe('Premium Insulated Water Bottle');
  });
});
