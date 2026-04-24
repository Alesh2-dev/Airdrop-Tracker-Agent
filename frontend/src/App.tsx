import { useEffect, useState, useCallback } from 'react';
import { Airdrop } from './types';
import { useAirdrops } from './hooks/useAirdrops';
import AirdropCard from './components/AirdropCard';
import TaskModal from './components/TaskModal';
import ToastContainer, { ToastItem } from './components/Toast';
import './index.css';

type Filter = 'all' | 'urgent' | 'active' | 'done';

let toastCounter = 0;

export default function App() {
  const { airdrops, loading, error, fetchAirdrops, toggleTask, triggerAgent, setAirdrops } = useAirdrops();
  const [selectedAirdrop, setSelectedAirdrop] = useState<Airdrop | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [agentStatus, setAgentStatus] = useState('Idle — running every 60s');
  const [agentRunning, setAgentRunning] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    fetchAirdrops();
  }, [fetchAirdrops]);

  const handleToggleTask = async (airdropId: number, taskId: number, isCompleted: boolean) => {
    const ok = await toggleTask(airdropId, taskId, isCompleted);
    if (ok) {
      addToast(isCompleted ? 'Task marked incomplete' : 'Task completed ✓', isCompleted ? 'info' : 'success');
      // Optimistically update state
      setAirdrops(prev => prev.map(a => {
        if (a.id !== airdropId) return a;
        const updatedTasks = a.tasks.map(t =>
          t.id === taskId
            ? { ...t, is_completed: !isCompleted, completed_at: isCompleted ? undefined : new Date().toISOString() }
            : t
        );
        const completed = updatedTasks.filter(t => t.is_completed).length;
        return {
          ...a,
          tasks: updatedTasks,
          completed_tasks: completed,
          progress_percent: Math.round((completed / updatedTasks.length) * 100),
        };
      }));
      // Also update selectedAirdrop if open
      setSelectedAirdrop(prev => {
        if (!prev || prev.id !== airdropId) return prev;
        const updatedTasks = prev.tasks.map(t =>
          t.id === taskId
            ? { ...t, is_completed: !isCompleted, completed_at: isCompleted ? undefined : new Date().toISOString() }
            : t
        );
        const completed = updatedTasks.filter(t => t.is_completed).length;
        return {
          ...prev,
          tasks: updatedTasks,
          completed_tasks: completed,
          progress_percent: Math.round((completed / updatedTasks.length) * 100),
        };
      });
    } else {
      addToast('Failed to update task', 'error');
    }
  };

  const handleTriggerAgent = async () => {
    setAgentRunning(true);
    setAgentStatus('Running check...');
    const msg = await triggerAgent();
    setAgentStatus(`Last run: ${new Date().toLocaleTimeString()}`);
    addToast(msg, 'info');
    setTimeout(() => setAgentRunning(false), 1000);
  };

  const filteredAirdrops = airdrops.filter(a => {
    if (filter === 'urgent') return a.hours_until_deadline < 24 && a.progress_percent < 100;
    if (filter === 'active') return a.progress_percent < 100;
    if (filter === 'done') return a.progress_percent === 100;
    return true;
  });

  // Stats
  const totalAirdrops = airdrops.length;
  const urgentCount = airdrops.filter(a => a.hours_until_deadline < 24 && a.progress_percent < 100).length;
  const completedCount = airdrops.filter(a => a.progress_percent === 100).length;
  const totalTasks = airdrops.reduce((s, a) => s + a.total_tasks, 0);
  const doneTasks = airdrops.reduce((s, a) => s + a.completed_tasks, 0);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">🪂</div>
            <div className="logo-text">
              <span className="logo-title">Airdrop Tracker</span>
              <span className="logo-sub">Agent · Web3</span>
            </div>
          </div>
          <div className="header-right">
            <div className="agent-badge">
              <div className="agent-dot" />
              AGENT ACTIVE
            </div>
            <button className="btn btn-outline" onClick={fetchAirdrops} disabled={loading}>
              {loading ? '...' : '⟳ REFRESH'}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-cell">
            <span className="stat-label">Airdrops</span>
            <span className="stat-value blue">{totalAirdrops}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">Urgent (&lt;24h)</span>
            <span className={`stat-value ${urgentCount > 0 ? 'red' : 'green'}`}>{urgentCount}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">Tasks Done</span>
            <span className="stat-value yellow">{doneTasks}/{totalTasks}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">Completed</span>
            <span className="stat-value green">{completedCount}</span>
          </div>
        </div>

        {/* Agent Panel */}
        <div className="agent-panel">
          <div className="agent-panel-left">
            <span className="agent-icon">🤖</span>
            <div className="agent-panel-text">
              <h3>Reminder Agent</h3>
              <p>Checks deadlines every 60 seconds — logs to server console or Telegram</p>
            </div>
          </div>
          <span className="agent-status">{agentStatus}</span>
          <button
            className="btn btn-outline"
            onClick={handleTriggerAgent}
            disabled={agentRunning}
          >
            {agentRunning ? '⏳ RUNNING...' : '▶ TRIGGER NOW'}
          </button>
        </div>

        {/* Airdrop list */}
        <div className="section-header">
          <span className="section-title">Live Airdrops</span>
          <div className="filter-tabs">
            {(['all', 'urgent', 'active', 'done'] as Filter[]).map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="loading-screen">
            <div className="spinner" />
            <span>LOADING AIRDROPS...</span>
          </div>
        )}

        {error && (
          <div className="error-box">
            <p style={{ marginBottom: '0.5rem' }}>⚠️ {error}</p>
            <p style={{ fontSize: '0.65rem', opacity: 0.7 }}>Make sure the backend is running on port 3001</p>
          </div>
        )}

        {!loading && !error && filteredAirdrops.length === 0 && (
          <div className="empty-state">
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</p>
            <p>No airdrops match this filter.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="airdrops-grid">
            {filteredAirdrops.map(airdrop => (
              <AirdropCard
                key={airdrop.id}
                airdrop={airdrop}
                onClick={() => setSelectedAirdrop(airdrop)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Modal */}
      {selectedAirdrop && (
        <TaskModal
          airdrop={selectedAirdrop}
          onClose={() => setSelectedAirdrop(null)}
          onToggleTask={handleToggleTask}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}