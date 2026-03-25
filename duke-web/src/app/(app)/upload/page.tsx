'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack,
  MdDescription,
  MdSchool,
  MdFitnessCenter,
  MdAssessment,
  MdCloudUpload,
  MdCheckCircle,
  MdHourglassTop,
  MdError,
  MdSync,
  MdCheck,
  MdEditNote,
} from 'react-icons/md';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';

type UploadType = 'accession' | 'transcript' | 'acft' | 'oml';

interface UploadItem {
  type: UploadType;
  icon: React.ElementType;
  title: string;
  description: string;
  accepted: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

export default function UploadSyncPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();

  const [items, setItems] = useState<UploadItem[]>([
    { type: 'accession', icon: MdDescription, title: 'Accession Sheet', description: 'Upload your DA Form 597 or accession packet to auto-populate profile data.', accepted: 'PDF, JPG, PNG', status: 'idle' },
    { type: 'transcript', icon: MdSchool, title: 'Academic Transcript', description: 'Import your unofficial or official transcript to sync GPA and credit hours.', accepted: 'PDF', status: 'idle' },
    { type: 'acft', icon: MdFitnessCenter, title: 'ACFT Scorecard', description: 'Upload your ACFT scorecard to automatically log event scores.', accepted: 'PDF, JPG, PNG', status: 'idle' },
    { type: 'oml', icon: MdAssessment, title: 'OML Worksheet', description: 'Import a cadre-provided OML worksheet to validate your calculated score.', accepted: 'PDF, XLSX', status: 'idle' },
  ]);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const lastSync = profile.name ? 'Today, 14:32' : 'Never';

  const handleUpload = useCallback((type: UploadType) => {
    if (!window.confirm('Document upload will use your device file picker to scan and import data automatically. Continue?')) return;
    setItems((prev) => prev.map((item) => (item.type === type ? { ...item, status: 'uploading' as const } : item)));
    setTimeout(() => {
      setItems((prev) => prev.map((item) => (item.type === type ? { ...item, status: 'success' as const } : item)));
    }, 2000);
  }, []);

  const handleSync = useCallback(() => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  }, []);

  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'uploading': return { Icon: MdHourglassTop, color: 'var(--color-tertiary)' };
      case 'success': return { Icon: MdCheckCircle, color: '#4caf50' };
      case 'error': return { Icon: MdError, color: 'var(--color-error)' };
      default: return { Icon: MdCloudUpload, color: 'var(--color-primary)' };
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">UPLOAD & SYNC</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-6">
        {/* Sync Status Card */}
        <section className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1 block font-[family-name:var(--font-label)]">DATA SYNC STATUS</span>
              <span className="text-sm text-[var(--color-on-surface)]">Last sync: {lastSync}</span>
            </div>
            <button
              className={`flex items-center gap-1.5 py-2 px-4 rounded-md text-white text-sm font-bold cursor-pointer transition-all shadow-[var(--shadow-sm)] ${syncStatus === 'synced' ? 'bg-[#4caf50]' : 'gradient-primary'}`}
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              aria-label="Sync data"
            >
              {syncStatus === 'syncing' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {syncStatus === 'synced' ? <MdCheck size={18} /> : <MdSync size={18} />}
                  <span>{syncStatus === 'synced' ? 'Synced' : 'Sync Now'}</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center">
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-[var(--color-on-surface)] block font-[family-name:var(--font-display)]">{scores.scoreHistory.length}</span>
              <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Score Entries</span>
            </div>
            <div className="w-[1px] h-8 bg-[var(--ghost-border)]" />
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-[var(--color-on-surface)] block font-[family-name:var(--font-display)]">{profile.name ? '1' : '0'}</span>
              <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Profile</span>
            </div>
            <div className="w-[1px] h-8 bg-[var(--ghost-border)]" />
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-[var(--color-on-surface)] block font-[family-name:var(--font-display)]">0</span>
              <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Documents</span>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-1 font-[family-name:var(--font-label)]">Upload Documents</h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-4 leading-relaxed">
            Upload your military documents to auto-populate scores and profile data. AI will extract relevant information automatically.
          </p>

          <div className="space-y-3">
            {items.map((item) => {
              const statusInfo = getStatusIcon(item.status);
              const Icon = item.icon;
              const StatusIcon = statusInfo.Icon;
              return (
                <button
                  key={item.type}
                  className="w-full flex gap-4 p-4 rounded-md text-left bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors disabled:opacity-60"
                  onClick={() => handleUpload(item.type)}
                  disabled={item.status === 'uploading'}
                  style={{ borderColor: item.status === 'success' ? '#4caf50' : undefined }}
                  aria-label={`Upload ${item.title}`}
                >
                  <div className="w-12 h-12 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-[var(--color-on-primary-container)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-base font-bold text-[var(--color-on-surface)]">{item.title}</span>
                      {item.status === 'uploading' ? (
                        <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <StatusIcon size={20} style={{ color: statusInfo.color }} />
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">{item.description}</p>
                    <span className="text-xs font-semibold text-[var(--color-outline)] font-[family-name:var(--font-label)]">Accepts: {item.accepted}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Manual Entry */}
        <section className="glass-panel rounded-md p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
            <MdEditNote size={24} className="text-[var(--color-on-primary-container)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[var(--color-on-surface)] mb-0.5">Prefer manual entry?</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              You can always enter scores directly on the Profile or individual tracker screens.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
