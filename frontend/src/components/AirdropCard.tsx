import { Airdrop } from '../types';

interface Props {
  airdrop: Airdrop;
  onClick: () => void;
}

const getUrgencyLevel = (hours: number, progress: number): 'critical' | 'warning' | 'done' | null => {
  if (progress === 100) return 'done';
  if (hours < 6) return 'critical';
  if (hours < 24) return 'warning';
  return null;
};

const formatDeadline = (deadline: string, hoursLeft: number): string => {
  if (hoursLeft <= 0) return 'EXPIRED';
  if (hoursLeft < 1) return `${Math.floor(hoursLeft * 60)}m left`;
  if (hoursLeft < 24) return `${Math.floor(hoursLeft)}h left`;
  const days = Math.floor(hoursLeft / 24);
  const hours = Math.floor(hoursLeft % 24);
  return `${days}d ${hours}h left`;
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name: string): string => {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

const iconColors: [string, string][] = [
  ['#a855f7', '#3d9eff'],
  ['#00ff88', '#3d9eff'],
  ['#ff4757', '#a855f7'],
  ['#ffd166', '#ff4757'],
  ['#3d9eff', '#00ff88'],
];

export default function AirdropCard({ airdrop, onClick }: Props) {
  const urgency = getUrgencyLevel(airdrop.hours_until_deadline, airdrop.progress_percent);
  const progressClass =
    airdrop.progress_percent === 100 ? 'complete' :
    airdrop.progress_percent > 0 ? 'partial' : 'empty';
  const deadlineClass =
    airdrop.hours_until_deadline < 6 ? 'urgent' :
    airdrop.hours_until_deadline < 24 ? 'soon' : 'ok';

  const [c1, c2] = iconColors[airdrop.id % iconColors.length];
  const cardClass = ['airdrop-card', urgency === 'critical' ? 'urgent' : urgency === 'warning' ? 'soon' : urgency === 'done' ? 'done' : ''].join(' ').trim();

  return (
    <div className={cardClass} onClick={onClick}>
      <div className="card-header">
        <div className="card-name-row">
          <div
            className="card-icon"
            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
          >
            {getInitials(airdrop.name)}
          </div>
          <span className="card-name">{airdrop.name}</span>
        </div>

        {urgency && (
          <span className={`urgency-badge ${urgency}`}>
            {urgency === 'critical' ? '🚨 URGENT' :
             urgency === 'warning' ? '⚠️ SOON' : '✅ DONE'}
          </span>
        )}
      </div>

      <p className="card-description">{airdrop.description}</p>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Task Progress</span>
          <span className={`progress-count ${progressClass}`}>
            {airdrop.completed_tasks}/{airdrop.total_tasks} tasks
          </span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${progressClass}`}
            style={{ width: `${airdrop.progress_percent}%` }}
          />
        </div>
      </div>

      <div className="deadline-row">
        <div className="deadline-info">
          <span>⏱</span>
          <span>{formatDate(airdrop.deadline)}</span>
          <span>—</span>
          <span className={`deadline-time ${deadlineClass}`}>
            {formatDeadline(airdrop.deadline, airdrop.hours_until_deadline)}
          </span>
        </div>
        {airdrop.link && (
          <a
            className="card-link"
            href={airdrop.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            VISIT ↗
          </a>
        )}
      </div>
    </div>
  );
}