'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
      <div className="flex flex-col min-h-screen bg-[#151317]">
        <div className="flex justify-center mt-16">
          <div className="w-8 h-8 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-squad-detail { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff] truncate" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            {squad?.name ?? 'SQUAD'}
          </h1>
        </div>

        {/* Squad Info */}
        <section className="glass-panel-squad-detail rounded-lg p-8" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            {squad?.name}
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Members', value: String(members.length) },
              { label: 'Created', value: squad ? new Date(squad.created_at).toLocaleDateString() : '--' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-[#968d9d]">{item.label}</span>
                <span className="text-sm font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {item.value}
                </span>
              </div>
            ))}
            {isLeader && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#968d9d]">Invite Code</span>
                <span className="text-lg font-black tracking-[6px] text-[#dbc585]" style={{ fontFamily: 'Space Grotesk, sans-serif', filter: 'drop-shadow(0 0 8px rgba(219,197,133,0.3))' }}>
                  {squad?.invite_code}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Members */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Members
          </h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-5 flex items-center transition-all border-l-4 border-[#450084]">
                <div className="w-11 h-11 rounded-lg bg-[#450084] flex items-center justify-center">
                  <span className="text-sm font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                    {member.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 ml-4">
                  <span className="text-sm font-bold text-[#e7e1e6] block">{member.display_name}</span>
                  <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    YG {member.year_group}
                  </span>
                </div>
                {member.id === squad?.leader_id && (
                  <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                )}
                {isLeader && member.id !== squad?.leader_id && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.display_name)}
                    className="text-[#ffb4ab] hover:text-[#ffb4ab]/80 transition-opacity"
                  >
                    <span className="material-symbols-outlined">person_remove</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Achievement Feed */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Achievement Feed
          </h3>
          {achievements.length === 0 ? (
            <div className="bg-[#211f23] rounded-lg p-8 text-center">
              <p className="text-sm text-[#968d9d]">
                No achievements yet. Complete missions to share with your squad!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div key={ach.id} className="bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-5 flex transition-all border-l-4 border-[#544511]">
                  <div className="mr-4 pt-0.5">
                    <span className="material-symbols-outlined" style={{ color: ach.type === 'mission_complete' ? '#dbc585' : '#d9b9ff', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#e7e1e6]">
                        {ach.profiles?.display_name ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-[#968d9d]">{timeAgo(ach.achieved_at)}</span>
                    </div>
                    {ach.profiles?.year_group && (
                      <span className="text-[10px] text-[#968d9d] block mb-1 uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        YG {ach.profiles.year_group}
                      </span>
                    )}
                    <p className="text-sm text-[#e7e1e6] mt-1">{ach.title}</p>
                    {ach.description && (
                      <p className="text-sm text-[#968d9d] mt-1">{ach.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Leave Squad */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-[#211f23] text-[#ffb4ab] text-sm font-semibold hover:bg-[#93000a]/20 transition-colors"
          onClick={handleLeave}
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Leave Squad
        </button>
      </div>
    </div>
  );
}
