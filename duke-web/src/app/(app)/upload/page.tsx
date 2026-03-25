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
      case 'uploading': return { Icon: MdHourglassTop, color: '#c3cc8c' };
      case 'success': return { Icon: MdCheckCircle, color: '#c3cc8c' };
      case 'error': return { Icon: MdError, color: '#ffb4ab' };
      default: return { Icon: MdCloudUpload, color: '#d9b9ff' };
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          UPLOAD & SYNC
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-8">
        {/* Sync Status Card */}
        <section className="glass-card ghost-border rounded-sm p-5 glow-shadow-purple">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <span
                className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-1 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                DATA SYNC STATUS
              </span>
              <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>Last sync: {lastSync}</span>
            </div>
            <button
              className={`flex items-center gap-1.5 py-2 px-4 rounded-sm text-sm font-bold cursor-pointer transition-all shadow-lg ${syncStatus === 'synced' ? 'bg-[#2c3303] text-[#c3cc8c]' : 'bg-[#450084] text-[#b27ff5] shadow-[#450084]/20'}`}
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              aria-label="Sync data"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {syncStatus === 'syncing' ? (
                <div className="w-4 h-4 border-2 border-[#b27ff5] border-t-transparent rounded-full animate-spin" />
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
              <span
                className="text-xl font-black text-[#f8e19e] block"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {scores.scoreHistory.length}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Score Entries
              </span>
            </div>
            <div className="w-[1px] h-8 bg-[rgba(75,68,82,0.15)]" />
            <div className="flex-1 text-center">
              <span
                className="text-xl font-black text-[#d9b9ff] block"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {profile.name ? '1' : '0'}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Profile
              </span>
            </div>
            <div className="w-[1px] h-8 bg-[rgba(75,68,82,0.15)]" />
            <div className="flex-1 text-center">
              <span
                className="text-xl font-black text-[#c3cc8c] block"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                0
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Documents
              </span>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="bg-[#1d1b1f] rounded-sm p-6">
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-1"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            UPLOAD DOCUMENTS
          </h2>
          <p className="text-sm text-[#cdc3d4] mb-5 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                  className="w-full flex gap-4 p-4 rounded-sm text-left glass-card ghost-border cursor-pointer hover:bg-[#450084]/10 transition-all disabled:opacity-60"
                  onClick={() => handleUpload(item.type)}
                  disabled={item.status === 'uploading'}
                  aria-label={`Upload ${item.title}`}
                >
                  <div className="w-12 h-12 rounded-sm bg-[#450084] flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-[#b27ff5]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-base font-black text-[#e7e1e6] uppercase tracking-tight"
                        style={{ fontFamily: 'Public Sans, sans-serif' }}
                      >
                        {item.title}
                      </span>
                      {item.status === 'uploading' ? (
                        <div className="w-5 h-5 border-2 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <StatusIcon size={20} style={{ color: statusInfo.color }} />
                      )}
                    </div>
                    <p className="text-sm text-[#cdc3d4] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{item.description}</p>
                    <span
                      className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Accepts: {item.accepted}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Manual Entry */}
        <section className="glass-card ghost-border rounded-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#450084] flex items-center justify-center shrink-0">
            <MdEditNote size={24} className="text-[#b27ff5]" />
          </div>
          <div className="flex-1">
            <h3
              className="text-base font-black uppercase tracking-tight text-[#e7e1e6] mb-0.5"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              Prefer manual entry?
            </h3>
            <p className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>
              You can always enter scores directly on the Profile or individual tracker screens.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
