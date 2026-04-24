export interface Task {
  id: number;
  airdrop_id: number;
  title: string;
  description?: string;
  task_order: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface Airdrop {
  id: number;
  name: string;
  description: string;
  link: string;
  deadline: string;
  status: 'active' | 'expired' | 'completed';
  tasks: Task[];
  total_tasks: number;
  completed_tasks: number;
  progress_percent: number;
  hours_until_deadline: number;
}