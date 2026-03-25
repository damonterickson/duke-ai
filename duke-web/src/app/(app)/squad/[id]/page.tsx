'use client';

import React, { useEffect, useState } from 'react';
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
      <div className="flex flex-col min-h-full bg-[#151317]">
        <div className="flex justify-center mt-16">
          <div className="w-8 h-8 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff] flex-1 truncate"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          {squad?.name ?? 'SQUAD'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-8">
        {/* Squad Info */}
        <section className="glass-card ghost-border rounded-sm p-5 glow-shadow-purple">
          <h2
            className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-4"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            {squad?.name}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>Members</span>
              <span
                className="text-sm font-black text-[#f8e19e]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {members.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>Created</span>
              <span
                className="text-sm font-black text-[#f8e19e]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {squad ? new Date(squad.created_at).toLocaleDateString() : '--'}
              </span>
            </div>
            {isLeader && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>Invite Code</span>
                <span
                  className="text-base font-black tracking-[4px] text-[#d9b9ff]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {squad?.invite_code}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Members */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            MEMBERS
          </h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center rounded-sm p-3 glass-card ghost-border">
                <div className="w-10 h-10 rounded-sm bg-[#450084] flex items-center justify-center">
                  <span
                    className="text-sm font-black text-[#d9b9ff]"
                    style={{ fontFamily: 'Public Sans, sans-serif' }}
                  >
                    {member.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 ml-3">
                  <span className="text-sm font-bold text-[#e7e1e6] block" style={{ fontFamily: 'Inter, sans-serif' }}>{member.display_name}</span>
                  <span
                    className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    YG {member.year_group}
                  </span>
                </div>
                {member.id === squad?.leader_id && (
                  <MdStar size={18} className="text-[#dbc585]" />
                )}
                {isLeader && member.id !== squad?.leader_id && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.display_name)}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <MdPersonRemove size={20} className="text-[#ffb4ab]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Achievement Feed */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ACHIEVEMENT FEED
          </h2>
          {achievements.length === 0 ? (
            <div className="glass-card ghost-border rounded-sm p-5">
              <p className="text-sm text-[#cdc3d4] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                No achievements yet. Complete missions to share with your squad!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div key={ach.id} className="flex rounded-sm p-3 glass-card ghost-border">
                  <div className="mr-3 pt-0.5">
                    <MdEmojiEvents
                      size={24}
                      className={ach.type === 'mission_complete' ? 'text-[#dbc585]' : 'text-[#d9b9ff]'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#e7e1e6]">
                        {ach.profiles?.display_name ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-[#968d9d]">{timeAgo(ach.achieved_at)}</span>
                    </div>
                    {ach.profiles?.year_group && (
                      <span
                        className="text-[10px] text-[#968d9d] block mb-1 uppercase tracking-[0.2em]"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        YG {ach.profiles.year_group}
                      </span>
                    )}
                    <p className="text-sm text-[#e7e1e6] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{ach.title}</p>
                    {ach.description && (
                      <p className="text-sm text-[#cdc3d4] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{ach.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Leave Squad */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm glass-card ghost-border cursor-pointer hover:bg-[#93000a]/20 transition-colors"
          onClick={handleLeave}
        >
          <MdLogout size={18} className="text-[#ffb4ab]" />
          <span className="text-sm font-bold text-[#ffb4ab]">Leave Squad</span>
        </button>
      </div>
    </div>
  );
}
