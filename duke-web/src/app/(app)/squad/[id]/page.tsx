'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  MdArrowBack,
  MdStar,
  MdPersonRemove,
  MdEmojiEvents,
  MdLogout,
} from 'react-icons/md';

interface Member {
  id: string;
  display_name: string;
  year_group: string;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  achieved_at: string;
  profiles?: { display_name: string; year_group: string };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function SquadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [squad, setSquad] = useState<{ name: string; leader_id: string; invite_code: string; created_at: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState<string | null>(null);

  const isLeader = squad?.leader_id === currentUserId;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSquad({
        name: 'Bravo Company',
        leader_id: 'user-1',
        invite_code: 'ABC123',
        created_at: new Date().toISOString(),
      });
      setMembers([
        { id: 'user-1', display_name: 'CDT Smith', year_group: 'MSIII' },
        { id: 'user-2', display_name: 'CDT Jones', year_group: 'MSII' },
      ]);
      setAchievements([]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleRemoveMember = (userId: string, name: string) => {
    if (window.confirm(`Remove ${name} from this squad?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    }
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this squad?')) {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-full bg-[var(--color-background)]">
        <div className="flex justify-center mt-16">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)] flex-1 truncate">
          {squad?.name ?? 'SQUAD'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-6">
        {/* Squad Info */}
        <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5">
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-4 font-[family-name:var(--font-display)]">{squad?.name}</h2>
          <div className="divide-y divide-[var(--ghost-border)]">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Members</span>
              <span className="text-sm font-bold text-[var(--color-on-surface)]">{members.length}</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Created</span>
              <span className="text-sm font-bold text-[var(--color-on-surface)]">
                {squad ? new Date(squad.created_at).toLocaleDateString() : '--'}
              </span>
            </div>
            {isLeader && (
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-[var(--color-on-surface-variant)]">Invite Code</span>
                <span className="text-base font-bold tracking-[4px] text-[var(--color-primary)] font-[family-name:var(--font-label)]">{squad?.invite_code}</span>
              </div>
            )}
          </div>
        </section>

        {/* Members */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Members</h2>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center rounded-md p-3 bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
                <div className="w-10 h-10 rounded-md gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {member.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 ml-3">
                  <span className="text-sm font-bold text-[var(--color-on-surface)] block">{member.display_name}</span>
                  <span className="text-xs text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">YG {member.year_group}</span>
                </div>
                {member.id === squad?.leader_id && (
                  <MdStar size={18} className="text-[var(--color-primary)]" />
                )}
                {isLeader && member.id !== squad?.leader_id && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.display_name)}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <MdPersonRemove size={20} className="text-[var(--color-error)]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Achievement Feed */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Achievement Feed</h2>
          {achievements.length === 0 ? (
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5">
              <p className="text-sm text-[var(--color-on-surface-variant)] text-center">
                No achievements yet. Complete missions to share with your squad!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {achievements.map((ach) => (
                <div key={ach.id} className="flex rounded-md p-3 bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
                  <div className="mr-3 pt-0.5">
                    <MdEmojiEvents
                      size={24}
                      className={ach.type === 'mission_complete' ? 'text-[#FFB300]' : 'text-[var(--color-primary)]'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[var(--color-on-surface)]">
                        {ach.profiles?.display_name ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-[var(--color-on-surface-variant)]">{timeAgo(ach.achieved_at)}</span>
                    </div>
                    {ach.profiles?.year_group && (
                      <span className="text-xs text-[var(--color-on-surface-variant)] block mb-1 font-[family-name:var(--font-label)]">YG {ach.profiles.year_group}</span>
                    )}
                    <p className="text-sm text-[var(--color-on-surface)] mt-1">{ach.title}</p>
                    {ach.description && (
                      <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">{ach.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Leave Squad */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-md border border-[var(--color-error)] cursor-pointer hover:bg-[var(--color-error-container)] transition-colors"
          onClick={handleLeave}
        >
          <MdLogout size={18} className="text-[var(--color-error)]" />
          <span className="text-sm font-bold text-[var(--color-error)]">Leave Squad</span>
        </button>
      </div>
    </div>
  );
}
