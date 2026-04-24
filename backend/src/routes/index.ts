import { Router } from 'express';
import {
  getAirdrops,
  markTaskComplete,
  markTaskIncomplete,
  getProgress,
  triggerAgent,
} from '../controllers/airdropController';

const router = Router();

// Airdrop routes
router.get('/airdrops', getAirdrops);
router.post('/airdrops/:id/tasks/:taskId/complete', markTaskComplete);
router.delete('/airdrops/:id/tasks/:taskId/complete', markTaskIncomplete);

// User progress
router.get('/user/progress', getProgress);

// Agent trigger (for demo)
router.post('/agent/trigger', triggerAgent);

export default router;