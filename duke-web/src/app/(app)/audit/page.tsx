'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadAuditState,
  saveAuditState,
  computeAllSummaries,
  computeTotalUnclaimed,
  computeTotalClaimed,
  getMissingItems,
  getEvidenceNeeded,
  CATEGORY_META,
  type AuditItem,
  type AuditStatus,
  type AuditCategory,
  type AuditState,
} from '@/services/auditData';

// ─── Three-state toggle ─────────────────────────────────────
function StatusToggle({
  status,
  onChange,
}: {
  status: AuditStatus;
  onChange: (s: AuditStatus) => void;
}) {
  const options: { key: AuditStatus; label: string; bg: string; text: string }[] = [
    { key: 'unclaimed', label: "Don't Have", bg: 'bg-[#151317]', text: 'text-[#968d9d]' },
    { key: 'claimed', label: 'Have It', bg: 'bg-[#544511]', text: 'text-[#dbc585]' },
    { key: 'evidenced', label: 'Have Evidence', bg: 'bg-[#2c3303]', text: 'text-[#c3cc8c]' },
  ];

  return (
    <div className="flex gap-1 rounded-sm overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
            status === opt.key ? `${opt.bg} ${opt.text}` : 'bg-[#1d1b1f] text-[#968d9d]/50 hover:text-[#968d9d]'
          }`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Audit Item Card ─────────────────────────────────────────
function AuditItemCard({
  item,
  onUpdate,
}: {
  item: AuditItem;
  onUpdate: (updated: AuditItem) => void;
}) {
  const handleStatusChange = (status: AuditStatus) => {
    const newValue = status === 'unclaimed' ? 0 : item.value || item.maxPoints;
    onUpdate({ ...item, status, value: newValue });
  };

  return (
    <div className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h5
            className="text-sm font-black uppercase tracking-tight"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            {item.label}
          </h5>
          <p className="text-xs text-[#968d9d] mt-1">{item.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {item.evidenceTypes.map((ev) => (
              <span
                key={ev}
                className="px-2 py-0.5 bg-[#151317] text-[#968d9d] text-[9px] rounded-sm uppercase tracking-wider"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {ev}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className="text-lg font-black text-[#dbc585]"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            {item.maxPoints} pts
          </span>
        </div>
      </div>

      <StatusToggle status={item.status} onChange={handleStatusChange} />

      {item.status !== 'unclaimed' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="text-[9px] text-[#968d9d] uppercase tracking-[0.2em] block mb-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Points Claimed
            </label>
            <input
              type="number"
              min="0"
              max={item.maxPoints}
              value={item.value}
              onChange={(e) =>
                onUpdate({ ...item, value: Math.min(parseFloat(e.target.value) || 0, item.maxPoints) })
              }
              className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#dbc585]/30"
              style={{ border: 'none' }}
            />
          </div>
          <div>
            <label
              className="text-[9px] text-[#968d9d] uppercase tracking-[0.2em] block mb-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Evidence Note
            </label>
            <input
              value={item.evidenceNote}
              onChange={(e) => onUpdate({ ...item, evidenceNote: e.target.value })}
              placeholder="e.g., filed with S1"
              className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#dbc585]/30 placeholder:text-[#968d9d]/50"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Category Section ────────────────────────────────────────
function CategorySection({
  category,
  items,
  onUpdateItem,
}: {
  category: AuditCategory;
  items: AuditItem[];
  onUpdateItem: (updated: AuditItem) => void;
}) {
  const meta = CATEGORY_META[category];
  const catItems = items.filter((i) => i.category === category);
  const claimed = catItems.filter((i) => i.status !== 'unclaimed');
  const claimedValue = claimed.reduce((s, i) => s + i.value, 0);

  let displayOMS: number;
  if (category === 'training') {
    displayOMS = Math.min(claimedValue, 100) / 100 * 5;
  } else if (category === 'athletics') {
    displayOMS = Math.min(claimedValue, 3);
  } else {
    displayOMS = Math.min(claimedValue, meta.maxOMS);
  }
  displayOMS = Math.round(displayOMS * 100) / 100;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm" style={{ backgroundColor: meta.bgColor }}>
            <span
              className="material-symbols-outlined"
              style={{ color: meta.color, fontVariationSettings: "'FILL' 1" }}
            >
              {meta.icon}
            </span>
          </div>
          <div>
            <h3
              className="text-xl font-black uppercase tracking-tighter"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {meta.label}
            </h3>
            <p className="text-xs text-[#968d9d]">{meta.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span
            className="text-2xl font-black"
            style={{ fontFamily: 'Public Sans, sans-serif', color: meta.color }}
          >
            {displayOMS}
          </span>
          <span className="text-sm text-[#968d9d]"> / {meta.maxOMS} OMS</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#373438] rounded-full mb-5">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min((displayOMS / meta.maxOMS) * 100, 100)}%`,
            backgroundColor: meta.color,
            boxShadow: `0 0 8px ${meta.color}60`,
          }}
        />
      </div>

      <div className="space-y-3">
        {catItems.map((item) => (
          <AuditItemCard key={item.id} item={item} onUpdate={onUpdateItem} />
        ))}
      </div>
    </section>
  );
}

// ─── Main Audit Page ─────────────────────────────────────────
export default function AuditPage() {
  const router = useRouter();
  const [state, setState] = useState<AuditState | null>(null);

  useEffect(() => {
    setState(loadAuditState());
  }, []);

  const handleUpdateItem = useCallback(
    (updated: AuditItem) => {
      if (!state) return;
      const newItems = state.items.map((i) => (i.id === updated.id ? updated : i));
      const newState: AuditState = { ...state, items: newItems };
      setState(newState);
      saveAuditState(newState);
    },
    [state],
  );

  const summaries = useMemo(() => (state ? computeAllSummaries(state.items) : []), [state]);
  const totalUnclaimed = useMemo(() => (state ? computeTotalUnclaimed(state.items) : 0), [state]);
  const totalClaimed = useMemo(() => (state ? computeTotalClaimed(state.items) : 0), [state]);
  const missingItems = useMemo(() => (state ? getMissingItems(state.items) : []), [state]);
  const evidenceNeeded = useMemo(() => (state ? getEvidenceNeeded(state.items) : []), [state]);
  const quickWin = missingItems[0] ?? null;

  if (!state) return null;

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style jsx global>{`
        .glass-panel-audit {
          background: rgba(55, 52, 56, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-3xl text-[#dbc585]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  OMS Optimizer
                </span>
                <h1
                  className="text-3xl font-black uppercase tracking-tighter"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  HIDDEN POINTS AUDIT
                </h1>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Unclaimed OMS
            </span>
            <span
              className="text-4xl font-black text-[#dbc585]"
              style={{
                fontFamily: 'Public Sans, sans-serif',
                filter: 'drop-shadow(0 0 10px rgba(219,197,133,0.3))',
              }}
            >
              {totalUnclaimed.toFixed(1)}
            </span>
          </div>
        </div>

        {/* OMS Impact Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaries.map((s) => (
            <div
              key={s.category}
              className="glass-panel-audit p-5 rounded-lg"
              style={{ borderLeft: `3px solid ${s.color}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {s.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-black"
                  style={{ fontFamily: 'Public Sans, sans-serif', color: s.color }}
                >
                  {s.claimedOMS.toFixed(1)}
                </span>
                <span className="text-xs text-[#968d9d]">/ {s.maxOMS}</span>
              </div>
              <div className="w-full h-1 bg-[#373438] rounded-full mt-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((s.claimedOMS / s.maxOMS) * 100, 100)}%`,
                    backgroundColor: s.color,
                  }}
                />
              </div>
              <span
                className="text-[9px] text-[#968d9d] mt-2 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {s.itemsClaimed} / {s.itemsTotal} items claimed
              </span>
            </div>
          ))}
        </section>

        {/* Category Sections */}
        <div className="space-y-12">
          {(['language', 'training', 'maturity', 'athletics'] as AuditCategory[]).map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              items={state.items}
              onUpdateItem={handleUpdateItem}
            />
          ))}
        </div>

        {/* Missing Points Packet */}
        <section className="glass-panel-audit p-8 rounded-lg space-y-6">
          <h3
            className="text-xl font-black uppercase tracking-tighter"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            MISSING POINTS PACKET
          </h3>

          {/* Quick Win */}
          {quickWin && (
            <div
              className="bg-[#544511] p-5 rounded-lg flex items-start gap-4"
              style={{ boxShadow: '0 0 20px rgba(84,69,17,0.2)' }}
            >
              <span
                className="material-symbols-outlined text-[#f8e19e]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#f8e19e] font-bold block mb-1"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Quick Win
                </span>
                <p className="text-sm text-[#e7e1e6]">
                  <strong>{quickWin.label}</strong> ({quickWin.maxPoints} pts) is your
                  highest-impact unclaimed item.{' '}
                  {quickWin.evidenceTypes.length > 0 &&
                    `Evidence needed: ${quickWin.evidenceTypes.join(', ')}.`}
                </p>
              </div>
            </div>
          )}

          {/* Evidence Needed */}
          {evidenceNeeded.length > 0 && (
            <div>
              <h4
                className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-3"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Evidence Needed ({evidenceNeeded.length} items)
              </h4>
              <div className="space-y-2">
                {evidenceNeeded.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#211f23] p-4 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-bold text-[#e7e1e6]">{item.label}</span>
                      <span className="text-xs text-[#968d9d] ml-2">
                        Needs: {item.evidenceTypes.join(', ')}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold text-[#dbc585]"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {item.value} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Potential Gain */}
          <div className="flex items-center justify-between bg-[#1d1b1f] p-5 rounded-lg">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Total Potential OMS Gain
              </span>
              <span className="text-sm text-[#968d9d]">
                Currently claiming {totalClaimed.toFixed(1)} of 18 possible hidden OMS
              </span>
            </div>
            <span
              className="text-4xl font-black text-[#dbc585]"
              style={{
                fontFamily: 'Public Sans, sans-serif',
                filter: 'drop-shadow(0 0 10px rgba(219,197,133,0.3))',
              }}
            >
              +{totalUnclaimed.toFixed(1)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
