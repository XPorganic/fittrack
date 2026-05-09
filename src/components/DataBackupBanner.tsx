import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function DataBackupBanner() {
  const { profile, exportData } = useStore();
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!profile) return;
    
    const stored = localStorage.getItem('fittrack-last-backup');
    if (stored) {
      setLastBackup(stored);
    } else {
      setShowReminder(true);
    }
  }, [profile]);

  const handleBackup = () => {
    if (!profile) return;
    
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const now = new Date().toLocaleString('zh-CN');
    localStorage.setItem('fittrack-last-backup', now);
    setLastBackup(now);
    setShowReminder(false);
  };

  if (!profile) return null;

  return (
    <>
      {showReminder && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">您还没有备份过数据！点击立即备份以防数据丢失</span>
            </div>
            <button
              onClick={handleBackup}
              className="flex items-center gap-2 px-4 py-1.5 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              立即备份
            </button>
          </div>
        </div>
      )}

      {!showReminder && lastBackup && (
        <div className={clsx(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
          "bg-emerald-500 text-white py-1.5 px-4"
        )}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>数据已备份 ({lastBackup})</span>
            </div>
            <button
              onClick={handleBackup}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              重新备份
            </button>
          </div>
        </div>
      )}
    </>
  );
}
