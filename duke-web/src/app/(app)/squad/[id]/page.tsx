'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getSession, getSquadDetail, leaveSquad, getSquadAchievements,
  removeSquadMember, updateSquadName, deleteSquad,
  createChallenge, getSquadChallenges, updateChallengeStatus,
  completeChallenge, uncompleteChallenge, getChallengeCompletions,
  type SquadChallengeRow, type ChallengeCompletionRow,
} from '@/services/supabase';

export default function SquadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [squad, setSquad] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<SquadChallengeRow[]>([]);
  const [completions, setCompletions] = useState<Record<string, ChallengeCompletionRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  // Leader management state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Challenge creation state
  const [showCreateOp, setShowCreateOp] = useState(false);
  const [opTitle, setOpTitle] = useState('');
  const [opDesc, setOpDesc] = useState('');
  const [opPoints, setOpPoints] = useState('');
  const [opDeadline, setOpDeadline] = useState('');
  const [creatingOp, setCreatingOp] = useState(false);

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

        const { challenges: ch } = await getSquadChallenges(id);
        setChallenges(ch);

        // Load completions for all challenges
        const compMap: Record<string, ChallengeCompletionRow[]> = {};
        for (const c of ch) {
          const { completions: comps } = await getChallengeCompletions(c.id);
          compMap[c.id] = comps;
        }
        setCompletions(compMap);
      } catch (err) {
        console.error('[SquadDetail] Load failed:', err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const isLeader = squad?.leader_id === currentUserId;
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const pastChallenges = challenges.filter(c => c.status !== 'active');

  // --- Handlers ---

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this squad?')) return;
    setLeaving(true);
    const { error } = await leaveSquad(id);
    if (error) { alert(error); setLeaving(false); }
    else router.replace('/squad');
  }

  async function handleRemoveMember(memberId: string, name: string) {
    if (!confirm(`Remove ${name} from the squad?`)) return;
    const { error } = await removeSquadMember(id, memberId);
    if (error) alert(error);
    else setMembers(prev => prev.filter(m => m.id !== memberId));
  }

  async function handleSaveName() {
    if (!newName.trim()) return;
    setSavingName(true);
    const { error } = await updateSquadName(id, newName.trim());
    if (error) alert(error);
    else {
      setSquad((prev: any) => ({ ...prev, name: newName.trim() }));
      setEditingName(false);
    }
    setSavingName(false);
  }

  async function handleDeleteSquad() {
    if (!confirm('DELETE this squad? This cannot be undone. All members, ops, and achievements will be removed.')) return;
    setDeleting(true);
    const { error } = await deleteSquad(id);
    if (error) { alert(error); setDeleting(false); }
    else router.replace('/squad');
  }

  async function handleCreateOp() {
    if (!opTitle.trim()) return;
    setCreatingOp(true);
    const { challenge, error } = await createChallenge(id, {
      title: opTitle.trim(),
      description: opDesc.trim() || undefined,
      points: opPoints ? parseInt(opPoints, 10) : undefined,
      deadline: opDeadline || undefined,
    });
    if (error) alert(error);
    else if (challenge) {
      setChallenges(prev => [challenge, ...prev]);
      setCompletions(prev => ({ ...prev, [challenge.id]: [] }));
      setOpTitle(''); setOpDesc(''); setOpPoints(''); setOpDeadline('');
      setShowCreateOp(false);
    }
    setCreatingOp(false);
  }

  async function handleToggleComplete(challengeId: string) {
    const myCompletion = completions[challengeId]?.find(c => c.user_id === currentUserId);
    if (myCompletion) {
      const { error } = await uncompleteChallenge(challengeId);
      if (!error) {
        setCompletions(prev => ({
          ...prev,
          [challengeId]: prev[challengeId].filter(c => c.user_id !== currentUserId),
        }));
      }
    } else {
      const { error } = await completeChallenge(challengeId);
      if (!error) {
        setCompletions(prev => ({
          ...prev,
          [challengeId]: [...(prev[challengeId] || []), { id: '', challenge_id: challengeId, user_id: currentUserId!, completed_at: new Date().toISOString() }],
        }));
      }
    }
  }

  async function handleChallengeStatus(challengeId: string, status: 'completed' | 'cancelled') {
    const { error } = await updateChallengeStatus(challengeId, status);
    if (!error) {
      setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, status } : c));
    }
  }

  // --- Render ---

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
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  className="text-2xl font-black uppercase tracking-tighter bg-[#211f23] text-[#d9b9ff] px-3 py-1 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 flex-1"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={savingName} className="text-[#d9b9ff] hover:text-white">
                  <span className="material-symbols-outlined text-xl">check</span>
                </button>
                <button onClick={() => setEditingName(false)} className="text-[#b0a8b8] hover:text-[#ffb4ab]">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {squad.name}
                </h1>
                {isLeader && (
                  <button onClick={() => { setNewName(squad.name); setEditingName(true); }} className="text-[#b0a8b8] hover:text-[#d9b9ff] transition-colors">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                )}
              </div>
            )}
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
                  {isLeader && member.id !== squad.leader_id && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.display_name || member.name || 'Cadet')}
                      className="text-[#b0a8b8] hover:text-[#ffb4ab] transition-colors"
                      title="Remove member"
                    >
                      <span className="material-symbols-outlined text-lg">person_remove</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Squad Ops */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] text-[#b0a8b8] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Squad Ops ({activeChallenges.length})
            </h3>
            {isLeader && (
              <button
                onClick={() => setShowCreateOp(!showCreateOp)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#450084] text-[#b27ff5] rounded-sm text-xs font-bold uppercase hover:scale-[1.02] transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                New Op
              </button>
            )}
          </div>

          {/* Create Op Form */}
          {showCreateOp && (
            <div className="glass-panel-detail rounded-lg p-6 mb-4 space-y-4">
              <input
                value={opTitle}
                onChange={e => setOpTitle(e.target.value)}
                placeholder="Op title (e.g., 5-Mile Ruck March)"
                className="w-full px-4 py-3 rounded-sm bg-[#151317] text-[#e7e1e6] placeholder:text-[#b0a8b8] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 text-sm font-bold"
                style={{ border: 'none' }}
              />
              <textarea
                value={opDesc}
                onChange={e => setOpDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-4 py-3 rounded-sm bg-[#151317] text-[#e7e1e6] placeholder:text-[#b0a8b8] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 text-sm resize-none"
                style={{ border: 'none' }}
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#b0a8b8] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Points</label>
                  <input
                    type="number"
                    value={opPoints}
                    onChange={e => setOpPoints(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full px-3 py-2 rounded-sm bg-[#151317] text-[#dbc585] placeholder:text-[#b0a8b8] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 text-sm font-bold"
                    style={{ border: 'none' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#b0a8b8] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Deadline</label>
                  <input
                    type="date"
                    value={opDeadline}
                    onChange={e => setOpDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-[#151317] text-[#e7e1e6] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 text-sm"
                    style={{ border: 'none', colorScheme: 'dark' }}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateOp}
                  disabled={!opTitle.trim() || creatingOp}
                  className="flex-1 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:scale-[1.02] transition-all"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {creatingOp ? 'Creating...' : 'Create Op'}
                </button>
                <button
                  onClick={() => setShowCreateOp(false)}
                  className="py-3 px-6 rounded-sm bg-[#211f23] text-[#b0a8b8] text-sm font-semibold hover:bg-[#2c292d] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Active Ops */}
          <div className="space-y-3">
            {activeChallenges.length === 0 && !showCreateOp ? (
              <div className="bg-[#1d1b1f] rounded-lg p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-[#b0a8b8] mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                <p className="text-sm text-[#b0a8b8]">
                  {isLeader ? 'No active ops. Create one to rally the squad!' : 'No active ops from the squad leader yet.'}
                </p>
              </div>
            ) : (
              activeChallenges.map(ch => {
                const chCompletions = completions[ch.id] || [];
                const myDone = chCompletions.some(c => c.user_id === currentUserId);
                const deadlinePassed = ch.deadline && new Date(ch.deadline) < new Date();

                return (
                  <div key={ch.id} className="bg-[#211f23] rounded-lg p-5 border-l-4 border-[#450084]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm uppercase tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>{ch.title}</span>
                          {ch.points > 0 && (
                            <span className="px-2 py-0.5 bg-[#1d1b1f] text-[#dbc585] text-[10px] font-bold rounded-sm">{ch.points} pts</span>
                          )}
                        </div>
                        {ch.description && <p className="text-xs text-[#b0a8b8] mb-2">{ch.description}</p>}
                        <div className="flex items-center gap-3 text-[10px] text-[#b0a8b8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          <span>{chCompletions.length}/{members.length} completed</span>
                          {ch.deadline && (
                            <span className={deadlinePassed ? 'text-[#ffb4ab]' : ''}>
                              {deadlinePassed ? 'Overdue' : `Due ${new Date(ch.deadline).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Member: toggle complete */}
                        <button
                          onClick={() => handleToggleComplete(ch.id)}
                          className={`w-9 h-9 rounded-sm flex items-center justify-center transition-all ${
                            myDone
                              ? 'bg-[#1a3a1a] text-[#7dde7d]'
                              : 'bg-[#1d1b1f] text-[#b0a8b8] hover:text-[#d9b9ff]'
                          }`}
                          title={myDone ? 'Mark incomplete' : 'Mark complete'}
                        >
                          <span className="material-symbols-outlined text-lg" style={myDone ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {myDone ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                        </button>
                        {/* Leader: status controls */}
                        {isLeader && (
                          <>
                            <button
                              onClick={() => handleChallengeStatus(ch.id, 'completed')}
                              className="text-[#b0a8b8] hover:text-[#7dde7d] transition-colors"
                              title="Mark op complete"
                            >
                              <span className="material-symbols-outlined text-lg">done_all</span>
                            </button>
                            <button
                              onClick={() => handleChallengeStatus(ch.id, 'cancelled')}
                              className="text-[#b0a8b8] hover:text-[#ffb4ab] transition-colors"
                              title="Cancel op"
                            >
                              <span className="material-symbols-outlined text-lg">cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Past Ops */}
          {pastChallenges.length > 0 && (
            <details className="mt-4">
              <summary className="text-[10px] uppercase tracking-[0.2em] text-[#b0a8b8] cursor-pointer hover:text-[#d9b9ff] transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Past Ops ({pastChallenges.length})
              </summary>
              <div className="space-y-3 mt-3">
                {pastChallenges.map(ch => (
                  <div key={ch.id} className="bg-[#211f23] rounded-lg p-4 opacity-60">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-[#b0a8b8]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {ch.status === 'completed' ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="font-bold text-xs uppercase">{ch.title}</span>
                      {ch.points > 0 && (
                        <span className="text-[10px] text-[#dbc585]">{ch.points} pts</span>
                      )}
                      <span className="text-[10px] text-[#b0a8b8] ml-auto">{ch.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
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
          {isLeader && (
            <button
              onClick={handleDeleteSquad}
              disabled={deleting}
              className="py-3 px-6 rounded-sm bg-[#2c1518] text-[#ffb4ab] text-sm font-semibold hover:bg-[#3c1f22] transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Squad'}
            </button>
          )}
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
