import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import { healthRoutes } from '../src/routes/health.js';

const app = express();
app.use('/api/health', healthRoutes);

describe('Health', () => {
  it('GET /api/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
  });
});
