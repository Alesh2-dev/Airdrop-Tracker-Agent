import { useEffect } from 'react';

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Props {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

const icons = { success: '✅', error: '❌', info: '📡' };

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div className={`toast ${toast.type}`} onClick={() => onRemove(toast.id)}>
      <span>{icons[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}