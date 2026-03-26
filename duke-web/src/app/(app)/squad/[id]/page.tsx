'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSession, getSquadDetail, leaveSquad, getSquadAchievements } from '@/services/supabase';

export default function SquadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [squad, setSquad] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const session = await getSession();
        if (session) setCurrentUserId(session.user.id);

        const { squad: sq, members: mem, error } = await getSquadDetail(id);
        if (error) console.error('[SquadDetail] Error:', error);
        if (sq) setSquad(sq);
        setMembers(mem);

        const { achievements: ach } = await getSquadAchievements(id);
        setAchievements(ach);
      } catch (err) {
        console.error('[SquadDetail] Load failed:', err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const isLeader = squad?.leader_id === currentUserId;

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this squad?')) return;
    setLeaving(true);
    const { error } = await leaveSquad(id);
    if (error) {
      alert(error);
      setLeaving(false);
    } else {
      router.replace('/squad');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151317] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-[#151317] text-[#e7e1e6] flex flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-5xl text-[#b0a8b8] mb-4">error</span>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>SQUAD NOT FOUND</h2>
        <button onClick={() => router.push('/squad')} className="mt-4 px-6 py-3 bg-[#450084] text-[#b27ff5] rounded-sm font-bold text-sm uppercase">
          Back to Squads
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style jsx global>{`
        .glass-panel-detail { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fadeInUp">
          <button onClick={() => router.push('/squad')} className="text-[#b0a8b8] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              {squad.name}
            </h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#b0a8b8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Code: {squad.invite_code} · {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
          {isLeader && (
            <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Leader
            </span>
          )}
        </div>

        {/* Squad Info */}
        <section className="glass-panel-detail p-8 rounded-lg animate-fadeIn">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-lg bg-[#450084] flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
              <span className="material-symbols-outlined text-3xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>{squad.name}</h2>
              <span className="text-xs text-[#b0a8b8]">Created {new Date(squad.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="bg-[#1d1b1f] rounded-sm p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#b0a8b8] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Invite Code</span>
              <span className="text-2xl font-black tracking-[6px] text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{squad.invite_code}</span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(squad.invite_code); }}
              className="px-4 py-2 bg-[#211f23] text-[#b0a8b8] hover:text-[#d9b9ff] rounded-sm text-xs font-bold uppercase transition-colors"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Copy
            </button>
          </div>
        </section>

        {/* Members */}
        <section>
          <h3 className="text-[12px] text-[#b0a8b8] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Members ({members.length})
          </h3>
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="bg-[#1d1b1f] rounded-lg p-6 text-center">
                <p className="text-sm text-[#b0a8b8]">No members yet. Share your invite code!</p>
              </div>
            ) : (
              members.map((member, i) => (
                <div key={member.id || i} className="bg-[#211f23] rounded-lg p-5 flex items-center gap-4 border-l-4 border-[#450084]">
                  <div className="w-10 h-10 rounded-lg bg-[#450084] flex items-center justify-center">
                    <span className="text-sm font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                      {(member.display_name || member.name || 'C').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-sm">{member.display_name || member.name || 'Cadet'}</span>
                    <span className="text-xs text-[#b0a8b8] ml-2">{member.year_group || ''}</span>
                  </div>
                  {member.id === squad.leader_id && (
                    <span className="material-symbols-outlined text-[#dbc585] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Achievements */}
        {achievements.length > 0 && (
          <section>
            <h3 className="text-[12px] text-[#b0a8b8] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Recent Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((ach, i) => (
                <div key={ach.id || i} className="bg-[#211f23] rounded-lg p-5 flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {ach.type === 'badge_unlock' ? 'workspace_premium' : 'flag'}
                  </span>
                  <div>
                    <span className="font-bold text-sm">{ach.title}</span>
                    {ach.description && <p className="text-xs text-[#b0a8b8] mt-1">{ach.description}</p>}
                    <span className="text-[10px] text-[#b0a8b8] mt-1 block">{ach.profiles?.display_name ?? 'Cadet'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="flex gap-4">
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="flex-1 py-3 rounded-sm bg-[#211f23] text-[#ffb4ab] text-sm font-semibold hover:bg-[#2c292d] transition-colors disabled:opacity-50"
          >
            {leaving ? 'Leaving...' : 'Leave Squad'}
          </button>
        </section>
      </div>
    </div>
  );
}
