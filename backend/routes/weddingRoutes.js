import express from 'express';
import {
  chat,
  generateThemeImageController,
  getState,
  resetSessionController,
  selectCatererController,
  selectMenuController,
} from '../controllers/weddingController.js';

const router = express.Router();

// Main chat endpoint — the single entry point for all user messages
router.post('/chat', chat);

// Get current wedding planning state for a session
router.get('/state/:sessionId', getState);

// Reset a planning session
router.post('/reset', resetSessionController);

// Select a catering menu
router.post('/select-menu', selectMenuController);

// Select a caterer and reveal that caterer's menu
router.post('/select-caterer', selectCatererController);

// Generate a Gemini moodboard image for a theme prompt
router.post('/theme-image', generateThemeImageController);

export default router;
