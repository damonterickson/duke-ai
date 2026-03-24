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
import { VGlassPanel } from '@/components';
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
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white cursor-pointer">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-base font-bold tracking-[2px] text-white">UPLOAD & SYNC</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] p-4 pb-16">
        {/* Sync Status Card */}
        <VGlassPanel className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <span className="text-xs font-medium uppercase tracking-[1.5px] text-[var(--color-outline)] mb-1 block">DATA SYNC STATUS</span>
              <span className="text-sm text-[var(--color-on-surface)]">Last sync: {lastSync}</span>
            </div>
            <button
              className={`flex items-center gap-1 py-2 px-3 rounded-lg text-[var(--color-on-primary)] text-sm font-semibold cursor-pointer ${syncStatus === 'synced' ? 'bg-[#4caf50]' : 'bg-[var(--color-primary)]'}`}
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
              <span className="text-lg font-semibold text-[var(--color-on-surface)] block">{scores.scoreHistory.length}</span>
              <span className="text-xs text-[var(--color-outline)]">Score Entries</span>
            </div>
            <div className="w-[1px] h-8 bg-[var(--color-outline-variant)]" />
            <div className="flex-1 text-center">
              <span className="text-lg font-semibold text-[var(--color-on-surface)] block">{profile.name ? '1' : '0'}</span>
              <span className="text-xs text-[var(--color-outline)]">Profile</span>
            </div>
            <div className="w-[1px] h-8 bg-[var(--color-outline-variant)]" />
            <div className="flex-1 text-center">
              <span className="text-lg font-semibold text-[var(--color-on-surface)] block">0</span>
              <span className="text-xs text-[var(--color-outline)]">Documents</span>
            </div>
          </div>
        </VGlassPanel>

        {/* Upload Section */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-1">Upload Documents</h2>
        <p className="text-sm text-[var(--color-outline)] mb-4">
          Upload your military documents to auto-populate scores and profile data. AI will extract relevant information automatically.
        </p>

        {items.map((item) => {
          const statusInfo = getStatusIcon(item.status);
          const Icon = item.icon;
          const StatusIcon = statusInfo.Icon;
          return (
            <button
              key={item.type}
              className="w-full flex gap-3 p-4 rounded-2xl mb-3 text-left bg-[var(--glass-overlay)] border border-[var(--ghost-border-color)] cursor-pointer hover:opacity-90 disabled:opacity-60"
              onClick={() => handleUpload(item.type)}
              disabled={item.status === 'uploading'}
              style={{ borderColor: item.status === 'success' ? '#4caf50' : undefined }}
              aria-label={`Upload ${item.title}`}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
                <Icon size={24} className="text-[var(--color-on-primary-container)]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-base font-semibold text-[var(--color-on-surface)]">{item.title}</span>
                  {item.status === 'uploading' ? (
                    <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <StatusIcon size={20} style={{ color: statusInfo.color }} />
                  )}
                </div>
                <p className="text-sm text-[var(--color-outline)] mb-1">{item.description}</p>
                <span className="text-xs text-[var(--color-outline-variant)]">Accepts: {item.accepted}</span>
              </div>
            </button>
          );
        })}

        {/* Manual Entry */}
        <VGlassPanel className="flex items-center gap-3 mt-2">
          <MdEditNote size={28} className="text-[var(--color-primary)]" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[var(--color-on-surface)] mb-1">Prefer manual entry?</h3>
            <p className="text-sm text-[var(--color-outline)]">
              You can always enter scores directly on the Profile or individual tracker screens.
            </p>
          </div>
        </VGlassPanel>
      </div>
    </div>
  );
}
