import { db } from '../config/database';
import { AirdropWithProgress, TaskWithStatus } from '../models/types';
import { RowDataPacket } from 'mysql2';

const DEFAULT_USER_ID = Number(process.env.DEFAULT_USER_ID) || 1;

export const getAllAirdrops = async (userId: number = DEFAULT_USER_ID): Promise<AirdropWithProgress[]> => {
  const [airdrops] = await db.query<RowDataPacket[]>(
    `SELECT * FROM airdrops ORDER BY deadline ASC`
  );

  const result: AirdropWithProgress[] = [];

  for (const airdrop of airdrops) {
    const [tasks] = await db.query<RowDataPacket[]>(
      `SELECT t.*, 
        CASE WHEN ut.id IS NOT NULL THEN 1 ELSE 0 END as is_completed,
        ut.completed_at
       FROM tasks t
       LEFT JOIN user_tasks ut ON ut.task_id = t.id AND ut.user_id = ?
       WHERE t.airdrop_id = ?
       ORDER BY t.task_order ASC`,
      [userId, airdrop.id]
    );

    const typedTasks = tasks as TaskWithStatus[];
    const completedCount = typedTasks.filter(t => t.is_completed).length;
    const deadline = new Date(airdrop.deadline);
    const now = new Date();
    const hoursUntilDeadline = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    result.push({
      ...airdrop,
      deadline: airdrop.deadline,
      tasks: typedTasks,
      total_tasks: typedTasks.length,
      completed_tasks: completedCount,
      progress_percent: typedTasks.length > 0 ? Math.round((completedCount / typedTasks.length) * 100) : 0,
      hours_until_deadline: Math.round(hoursUntilDeadline * 10) / 10,
    } as AirdropWithProgress);
  }

  return result;
};

export const completeTask = async (
  airdropId: number,
  taskId: number,
  userId: number = DEFAULT_USER_ID
): Promise<{ success: boolean; message: string }> => {
  // Verify task belongs to airdrop
  const [tasks] = await db.query<RowDataPacket[]>(
    `SELECT id FROM tasks WHERE id = ? AND airdrop_id = ?`,
    [taskId, airdropId]
  );

  if (tasks.length === 0) {
    return { success: false, message: 'Task not found for this airdrop' };
  }

  // Insert or ignore if already completed
  await db.query(
    `INSERT IGNORE INTO user_tasks (user_id, task_id, airdrop_id) VALUES (?, ?, ?)`,
    [userId, taskId, airdropId]
  );

  return { success: true, message: 'Task marked as complete' };
};

export const uncompleteTask = async (
  airdropId: number,
  taskId: number,
  userId: number = DEFAULT_USER_ID
): Promise<{ success: boolean; message: string }> => {
  await db.query(
    `DELETE FROM user_tasks WHERE user_id = ? AND task_id = ? AND airdrop_id = ?`,
    [userId, taskId, airdropId]
  );

  return { success: true, message: 'Task marked as incomplete' };
};

export const getUserProgress = async (userId: number = DEFAULT_USER_ID) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT 
      a.id as airdrop_id,
      a.name as airdrop_name,
      a.deadline,
      COUNT(DISTINCT t.id) as total_tasks,
      COUNT(DISTINCT ut.task_id) as completed_tasks
     FROM airdrops a
     LEFT JOIN tasks t ON t.airdrop_id = a.id
     LEFT JOIN user_tasks ut ON ut.airdrop_id = a.id AND ut.user_id = ?
     GROUP BY a.id
     ORDER BY a.deadline ASC`,
    [userId]
  );

  return rows.map(row => ({
    ...row,
    progress_percent: row.total_tasks > 0
      ? Math.round((row.completed_tasks / row.total_tasks) * 100)
      : 0,
  }));
};

// Used by the agent job
export const getUpcomingDeadlines = async (withinHours: number = 24) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT 
      a.*,
      COUNT(DISTINCT t.id) as total_tasks,
      COUNT(DISTINCT ut.task_id) as completed_tasks
     FROM airdrops a
     LEFT JOIN tasks t ON t.airdrop_id = a.id
     LEFT JOIN user_tasks ut ON ut.airdrop_id = a.id AND ut.user_id = ?
     WHERE a.status = 'active'
       AND a.deadline > NOW()
       AND a.deadline <= DATE_ADD(NOW(), INTERVAL ? HOUR)
     GROUP BY a.id
     ORDER BY a.deadline ASC`,
    [DEFAULT_USER_ID, withinHours]
  );

  return rows;
};