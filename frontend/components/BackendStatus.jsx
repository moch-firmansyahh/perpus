'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { api } from '@/lib/api';

export function BackendStatus() {
  const [status, setStatus] = useState('checking');
  const [instance, setInstance] = useState('');

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const res = await api.health();
        if (!active) return;
        setStatus(res?.status === 'ok' ? 'online' : 'offline');
        setInstance(res?.instance || '');
      } catch {
        if (!active) return;
        setStatus('offline');
        setInstance('');
      }
    };

    check();
    const timer = setInterval(check, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const isOnline = status === 'online';
  const isChecking = status === 'checking';

  return (
    <div
      title={instance ? `Instance: ${instance}` : 'Status server backend'}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-xs font-medium ${
        isChecking
          ? 'bg-navy-700 text-gray-200'
          : isOnline
            ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
            : 'bg-brand/20 text-red-200 ring-1 ring-red-400/40'
      }`}
    >
      <Activity className="h-3.5 w-3.5" />
      <span>
        {isChecking
          ? 'Memeriksa...'
          : isOnline
            ? 'Backend: Online (Port 8000)'
            : 'Backend: Offline'}
      </span>
    </div>
  );
}
