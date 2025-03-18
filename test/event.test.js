const request = require('supertest');
const app = require('../code');

describe('Event API', () => {
    let token = '';

    beforeAll(async () => {
        await request(app).post('/register').send({ username: 'testuser', password: 'password123' });
        
        const loginRes = await request(app).post('/login').send({ username: 'testuser', password: 'password123' });
        token = loginRes.body.token;
    });

    it('should create an event', async () => {
        const res = await request(app)
            .post('/events')
            .set('Authorization', token)
            .send({ name: 'Meeting', description: 'Team meeting', date: '2025-05-01', category: 'Work', reminder: true });
        
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Event created');
    });

    it('should get events', async () => {
        const res = await request(app)
            .get('/events')
            .set('Authorization', token);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
