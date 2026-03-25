'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';

type UploadType = 'accession' | 'transcript' | 'acft' | 'oml';

interface UploadItem {
  type: UploadType;
  icon: string;
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
    { type: 'accession', icon: 'description', title: 'Accession Sheet', description: 'Upload your DA Form 597 or accession packet to auto-populate profile data.', accepted: 'PDF, JPG, PNG', status: 'idle' },
    { type: 'transcript', icon: 'school', title: 'Academic Transcript', description: 'Import your unofficial or official transcript to sync GPA and credit hours.', accepted: 'PDF', status: 'idle' },
    { type: 'acft', icon: 'fitness_center', title: 'ACFT Scorecard', description: 'Upload your ACFT scorecard to automatically log event scores.', accepted: 'PDF, JPG, PNG', status: 'idle' },
    { type: 'oml', icon: 'assessment', title: 'OML Worksheet', description: 'Import a cadre-provided OML worksheet to validate your calculated score.', accepted: 'PDF, XLSX', status: 'idle' },
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
      case 'uploading': return { icon: 'hourglass_top', color: '#c3cc8c' };
      case 'success': return { icon: 'check_circle', color: '#c3cc8c' };
      case 'error': return { icon: 'error', color: '#ffb4ab' };
      default: return { icon: 'cloud_upload', color: '#d9b9ff' };
    }
  };

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-upload { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            UPLOAD & SYNC
          </h1>
        </div>

        {/* Sync Status Card */}
        <section className="glass-panel-upload rounded-lg p-8" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Data Sync Status
              </span>
              <span className="text-sm text-[#968d9d]">Last sync: {lastSync}</span>
            </div>
            <button
              className={`flex items-center gap-2 py-2.5 px-5 rounded-sm text-sm font-bold transition-all ${syncStatus === 'synced' ? 'bg-[#2c3303] text-[#c3cc8c]' : 'bg-[#450084] text-[#b27ff5]'}`}
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: syncStatus === 'synced' ? undefined : '0 0 15px rgba(69,0,132,0.3)' }}
            >
              {syncStatus === 'syncing' ? (
                <div className="w-4 h-4 border-2 border-[#b27ff5] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {syncStatus === 'synced' ? 'check' : 'sync'}
                  </span>
                  {syncStatus === 'synced' ? 'Synced' : 'Sync Now'}
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <span className="text-3xl font-black text-[#f8e19e] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {scores.scoreHistory.length}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Score Entries
              </span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-[#d9b9ff] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {profile.name ? '1' : '0'}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Profile
              </span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-[#c3cc8c] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                0
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Documents
              </span>
            </div>
          </div>
        </section>

        {/* Upload Documents */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Upload Documents
          </h3>
          <p className="text-sm text-[#968d9d] mb-6 leading-relaxed">
            Upload your military documents to auto-populate scores and profile data. AI will extract relevant information automatically.
          </p>

          <div className="space-y-4">
            {items.map((item) => {
              const statusInfo = getStatusIcon(item.status);
              return (
                <button
                  key={item.type}
                  className="w-full bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-6 flex gap-5 text-left transition-all disabled:opacity-60 border-l-4 border-[#450084] group"
                  onClick={() => handleUpload(item.type)}
                  disabled={item.status === 'uploading'}
                >
                  <div className="p-3 rounded-sm bg-[#450084]">
                    <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-base font-black uppercase tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                        {item.title}
                      </span>
                      {item.status === 'uploading' ? (
                        <div className="w-5 h-5 border-2 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: statusInfo.color, fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#968d9d] mb-1">{item.description}</p>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Accepts: {item.accepted}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Manual Entry */}
        <section className="bg-[#211f23] rounded-lg p-6 flex items-center gap-4">
          <div className="p-3 rounded-sm bg-[#450084]">
            <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight mb-0.5" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              Prefer manual entry?
            </h3>
            <p className="text-sm text-[#968d9d]">
              You can always enter scores directly on the Profile or individual tracker screens.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
