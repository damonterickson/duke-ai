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
    // In production, fetch from Supabase
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
      <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
        <div className="flex justify-center mt-16">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-container)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[var(--color-on-surface)] cursor-pointer">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--color-on-surface)] flex-1 text-center truncate">
          {squad?.name ?? 'Squad'}
        </h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-16">
        {/* Squad Info */}
        <div className="rounded-xl p-4 mb-4 bg-[var(--color-surface-container)]">
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-3">{squad?.name}</h2>
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-[var(--color-outline)]">Members</span>
            <span className="text-sm text-[var(--color-on-surface)]">{members.length}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-[var(--color-outline)]">Created</span>
            <span className="text-sm text-[var(--color-on-surface)]">
              {squad ? new Date(squad.created_at).toLocaleDateString() : '--'}
            </span>
          </div>
          {isLeader && (
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-[var(--color-outline)]">Invite Code</span>
              <span className="text-base font-semibold tracking-[3px] text-[var(--color-primary)]">{squad?.invite_code}</span>
            </div>
          )}
        </div>

        {/* Members */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Members</h2>
        {members.map((member) => (
          <div key={member.id} className="flex items-center rounded-lg p-3 mb-2 bg-[var(--color-surface-container)]">
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-sm font-semibold text-[var(--color-on-primary)]">
                {member.display_name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="flex-1 ml-3">
              <span className="text-sm font-semibold text-[var(--color-on-surface)] block">{member.display_name}</span>
              <span className="text-xs text-[var(--color-outline)]">YG {member.year_group}</span>
            </div>
            {member.id === squad?.leader_id && (
              <MdStar size={18} className="text-[var(--color-primary)]" />
            )}
            {isLeader && member.id !== squad?.leader_id && (
              <button
                onClick={() => handleRemoveMember(member.id, member.display_name)}
                className="cursor-pointer"
              >
                <MdPersonRemove size={20} className="text-[var(--color-error)]" />
              </button>
            )}
          </div>
        ))}

        {/* Achievement Feed */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Achievement Feed</h2>
        {achievements.length === 0 ? (
          <p className="text-sm text-[var(--color-outline)] text-center py-4">
            No achievements yet. Complete missions to share with your squad!
          </p>
        ) : (
          achievements.map((ach) => (
            <div key={ach.id} className="flex rounded-lg p-3 mb-2 bg-[var(--color-surface-container)]">
              <div className="mr-3 pt-0.5">
                <MdEmojiEvents
                  size={24}
                  className={ach.type === 'mission_complete' ? 'text-[#FFB300]' : 'text-[var(--color-primary)]'}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[var(--color-on-surface)]">
                    {ach.profiles?.display_name ?? 'Unknown'}
                  </span>
                  <span className="text-xs text-[var(--color-outline)]">{timeAgo(ach.achieved_at)}</span>
                </div>
                {ach.profiles?.year_group && (
                  <span className="text-xs text-[var(--color-outline)] block mb-1">YG {ach.profiles.year_group}</span>
                )}
                <p className="text-sm text-[var(--color-on-surface)] mt-1">{ach.title}</p>
                {ach.description && (
                  <p className="text-sm text-[var(--color-outline)] mt-1">{ach.description}</p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Leave Squad */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[var(--color-error)] mt-6 cursor-pointer"
          onClick={handleLeave}
        >
          <MdLogout size={18} className="text-[var(--color-error)]" />
          <span className="text-sm font-semibold text-[var(--color-error)]">Leave Squad</span>
        </button>
      </div>
    </div>
  );
}
