export interface User {
  id: number;
  username: string;
  telegram_chat_id?: string;
  created_at: Date;
}

export interface Airdrop {
  id: number;
  name: string;
  description: string;
  link: string;
  deadline: Date;
  status: 'active' | 'expired' | 'completed';
  created_at: Date;
}

export interface Task {
  id: number;
  airdrop_id: number;
  title: string;
  description?: string;
  task_order: number;
}

export interface UserTask {
  id: number;
  user_id: number;
  task_id: number;
  airdrop_id: number;
  completed_at: Date;
}

export interface AirdropWithProgress extends Airdrop {
  tasks: TaskWithStatus[];
  total_tasks: number;
  completed_tasks: number;
  progress_percent: number;
  hours_until_deadline: number;
}

export interface TaskWithStatus extends Task {
  is_completed: boolean;
  completed_at?: Date;
}