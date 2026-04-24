import { useState } from 'react';
import { Airdrop, Task } from '../types';

interface Props {
  airdrop: Airdrop;
  onClose: () => void;
  onToggleTask: (airdropId: number, taskId: number, isCompleted: boolean) => Promise<void>;
}

const formatDeadline = (deadline: string) => {
  const d = new Date(deadline);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTimeLeft = (hours: number) => {
  if (hours <= 0) return { text: 'EXPIRED', cls: 'urgent' };
  if (hours < 1) return { text: `${Math.floor(hours * 60)}m remaining`, cls: 'urgent' };
  if (hours < 24) return { text: `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m remaining`, cls: 'soon' };
  const days = Math.floor(hours / 24);
  const hrs = Math.floor(hours % 24);
  return { text: `${days}d ${hrs}h remaining`, cls: 'ok' };
};

export default function TaskModal({ airdrop, onClose, onToggleTask }: Props) {
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

  const handleTaskClick = async (task: Task) => {
    if (loadingTaskId !== null) return;
    setLoadingTaskId(task.id);
    try {
      await onToggleTask(airdrop.id, task.id, task.is_completed);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const timeLeft = getTimeLeft(airdrop.hours_until_deadline);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title-block">
            <span className="modal-title">{airdrop.name}</span>
            <div className="modal-meta">
              <span>📅 {formatDeadline(airdrop.deadline)}</span>
              <span>·</span>
              <span className={`deadline-time ${timeLeft.cls}`}>{timeLeft.text}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">{airdrop.description}</p>

          {/* Progress bar */}
          <div className="progress-section" style={{ padding: 0, marginBottom: '1.25rem' }}>
            <div className="progress-header" style={{ marginBottom: '0.5rem' }}>
              <span className="progress-label">Overall Progress</span>
              <span className={`progress-count ${airdrop.progress_percent === 100 ? 'complete' : airdrop.progress_percent > 0 ? 'partial' : 'empty'}`}>
                {airdrop.progress_percent}% — {airdrop.completed_tasks}/{airdrop.total_tasks} done
              </span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${airdrop.progress_percent === 100 ? 'complete' : airdrop.progress_percent > 0 ? 'partial' : 'empty'}`}
                style={{ width: `${airdrop.progress_percent}%` }}
              />
            </div>
          </div>

          <p className="tasks-label">Required Tasks</p>
          <div className="task-list">
            {airdrop.tasks.map((task, i) => (
              <div
                key={task.id}
                className={`task-item ${task.is_completed ? 'completed' : ''} ${loadingTaskId === task.id ? 'loading' : ''}`}
                onClick={() => handleTaskClick(task)}
                style={{ opacity: loadingTaskId === task.id ? 0.6 : 1 }}
              >
                <div className="task-checkbox">
                  {loadingTaskId === task.id ? '…' : task.is_completed ? '✓' : ''}
                </div>
                <span className="task-title">{task.title}</span>
                <span className="task-num">#{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <span className="modal-progress-text">
            <span>{airdrop.completed_tasks}</span> of {airdrop.total_tasks} tasks complete
            {airdrop.progress_percent === 100 && ' 🎉'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {airdrop.link && (
              <a className="btn btn-outline" href={airdrop.link} target="_blank" rel="noopener noreferrer">
                VISIT ↗
              </a>
            )}
            <button className="btn btn-primary" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}