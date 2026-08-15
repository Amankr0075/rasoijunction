import express from 'express';
import { summarize } from '../services/groqService.js';

const router = express.Router();

/**
 * POST /api/summarize
 * Body: { text: string }
 * Returns: { success: true, summary: string }
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing or invalid "text" field in request body' });
    }
    const summary = await summarize(text);
    return res.json({ success: true, summary });
  } catch (err) {
    console.error('Summarization error:', err.message);
    return res.status(500).json({ success: false, message: 'Summarization failed. Please try again.' });
  }
});

export default router;
