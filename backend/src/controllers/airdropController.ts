import { Request, Response } from 'express';
import {
  getAllAirdrops,
  completeTask,
  uncompleteTask,
  getUserProgress,
} from '../services/airdropService';
import { runReminderCheck } from '../jobs/reminderAgent';

const DEFAULT_USER_ID = Number(process.env.DEFAULT_USER_ID) || 1;

export const getAirdrops = async (req: Request, res: Response): Promise<void> => {
  try {
    const airdrops = await getAllAirdrops(DEFAULT_USER_ID);
    res.json({ success: true, data: airdrops });
  } catch (err) {
    console.error('getAirdrops error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch airdrops' });
  }
};

export const markTaskComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: airdropId, taskId } = req.params;
    const result = await completeTask(Number(airdropId), Number(taskId), DEFAULT_USER_ID);

    if (!result.success) {
      res.status(404).json({ success: false, message: result.message });
      return;
    }

    res.json({ success: true, message: result.message });
  } catch (err) {
    console.error('markTaskComplete error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete task' });
  }
};

export const markTaskIncomplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: airdropId, taskId } = req.params;
    const result = await uncompleteTask(Number(airdropId), Number(taskId), DEFAULT_USER_ID);
    res.json({ success: true, message: result.message });
  } catch (err) {
    console.error('markTaskIncomplete error:', err);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

export const getProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const progress = await getUserProgress(DEFAULT_USER_ID);
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('getProgress error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
};

export const triggerAgent = async (_req: Request, res: Response): Promise<void> => {
  try {
    await runReminderCheck();
    res.json({ success: true, message: 'Agent check triggered — see server console' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Agent trigger failed' });
  }
};