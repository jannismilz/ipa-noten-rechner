import express from 'express';
import sql from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [profile] = await sql`
      SELECT 
        up.id,
        up.first_name,
        up.last_name,
        up.thesis_topic,
        up.submission_date,
        up.onboarding_completed,
        u.email
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
      WHERE up.user_id = ${req.userId}
    `;

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  const { firstName, lastName, thesisTopic, submissionDate, onboardingCompleted } = req.body;

  try {
    const [profile] = await sql`
      UPDATE user_profiles
      SET 
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
        thesis_topic = COALESCE(${thesisTopic}, thesis_topic),
        submission_date = COALESCE(${submissionDate}, submission_date),
        onboarding_completed = COALESCE(${onboardingCompleted}, onboarding_completed),
        updated_at = NOW()
      WHERE user_id = ${req.userId}
      RETURNING *
    `;

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
