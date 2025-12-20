import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import jwt from 'jsonwebtoken';
import sql from '../db/connection.js';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, deleteTestUser } from './setup.js';

const API_URL = 'http://localhost:3001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let testUser;
let authToken;

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

beforeEach(async () => {
  testUser = await createTestUser('evaltest', 'password123');
  authToken = jwt.sign({ userId: testUser.id }, JWT_SECRET, { expiresIn: '7d' });
});

afterEach(async () => {
  await sql`DELETE FROM criteria_notes WHERE user_id = ${testUser.id}`;
  await sql`DELETE FROM ticked_requirements WHERE user_id = ${testUser.id}`;
  await deleteTestUser(testUser.id);
});

describe('Evaluation Routes', () => {
  describe('GET /api/evaluations/criteria', () => {
    test('should get criteria data without authentication', async () => {
      const response = await fetch(`${API_URL}/evaluations/criteria`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('criterias');
      expect(Array.isArray(data.criterias)).toBe(true);
    });
  });

  describe('GET /api/evaluations', () => {
    test('should get evaluations with authentication', async () => {
      const response = await fetch(`${API_URL}/evaluations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('categories');
      expect(data).toHaveProperty('criterias');
      expect(Array.isArray(data.criterias)).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
    });

    test('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/evaluations`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No token provided');
    });

    test('should include ticked requirements and notes', async () => {
      await sql`
        INSERT INTO ticked_requirements (user_id, criteria_id, requirement)
        VALUES (${testUser.id}, 'A1', 'Test requirement')
      `;

      await sql`
        INSERT INTO criteria_notes (user_id, criteria_id, note)
        VALUES (${testUser.id}, 'A1', 'Test note')
      `;

      const response = await fetch(`${API_URL}/evaluations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      const criteriaA1 = data.criterias.find(c => c.id === 'A1');
      if (criteriaA1) {
        expect(criteriaA1.ticked_requirements).toContain('Test requirement');
        expect(criteriaA1.note).toBe('Test note');
      }
    });
  });

  describe('POST /api/evaluations/:criteriaId', () => {
    test('should save ticked requirements', async () => {
      const response = await fetch(`${API_URL}/evaluations/A1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickedRequirements: ['Requirement 1', 'Requirement 2'],
          note: null
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      const saved = await sql`
        SELECT requirement FROM ticked_requirements 
        WHERE user_id = ${testUser.id} AND criteria_id = 'A1'
      `;
      expect(saved.length).toBe(2);
    });

    test('should save criteria note', async () => {
      const response = await fetch(`${API_URL}/evaluations/A1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickedRequirements: [],
          note: 'This is a test note'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      const [saved] = await sql`
        SELECT note FROM criteria_notes 
        WHERE user_id = ${testUser.id} AND criteria_id = 'A1'
      `;
      expect(saved.note).toBe('This is a test note');
    });

    test('should delete note when empty string provided', async () => {
      await sql`
        INSERT INTO criteria_notes (user_id, criteria_id, note)
        VALUES (${testUser.id}, 'A1', 'Existing note')
      `;

      const response = await fetch(`${API_URL}/evaluations/A1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickedRequirements: [],
          note: ''
        })
      });

      expect(response.status).toBe(200);

      const saved = await sql`
        SELECT note FROM criteria_notes 
        WHERE user_id = ${testUser.id} AND criteria_id = 'A1'
      `;
      expect(saved.length).toBe(0);
    });

    test('should replace existing requirements', async () => {
      await sql`
        INSERT INTO ticked_requirements (user_id, criteria_id, requirement)
        VALUES (${testUser.id}, 'A1', 'Old requirement')
      `;

      const response = await fetch(`${API_URL}/evaluations/A1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickedRequirements: ['New requirement'],
          note: null
        })
      });

      expect(response.status).toBe(200);

      const saved = await sql`
        SELECT requirement FROM ticked_requirements 
        WHERE user_id = ${testUser.id} AND criteria_id = 'A1'
      `;
      expect(saved.length).toBe(1);
      expect(saved[0].requirement).toBe('New requirement');
    });

    test('should reject invalid criteria ID', async () => {
      const response = await fetch(`${API_URL}/evaluations/INVALID`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickedRequirements: [],
          note: null
        })
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Criteria not found');
    });

    test('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/evaluations/A1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickedRequirements: [],
          note: null
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No token provided');
    });
  });

  describe('GET /api/evaluations/calculate', () => {
    test('should calculate scores with no data', async () => {
      const response = await fetch(`${API_URL}/evaluations/calculate`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('categoryScores');
      expect(data).toHaveProperty('totalScore');
      expect(data).toHaveProperty('finalGrade');
      expect(typeof data.totalScore).toBe('number');
      expect(typeof data.finalGrade).toBe('number');
    });

    test('should reject request without token', async () => {
      const response = await fetch(`${API_URL}/evaluations/calculate`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('No token provided');
    });

    test('should calculate scores with ticked requirements', async () => {
      await sql`
        INSERT INTO ticked_requirements (user_id, criteria_id, requirement)
        VALUES (${testUser.id}, 'A1', 'Test requirement 1')
      `;

      const response = await fetch(`${API_URL}/evaluations/calculate`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('categoryScores');
      expect(data).toHaveProperty('totalScore');
      expect(data).toHaveProperty('finalGrade');
      expect(Object.keys(data.categoryScores).length).toBeGreaterThan(0);
    });
  });
});
