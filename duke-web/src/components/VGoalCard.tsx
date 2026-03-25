'use client';

import React from 'react';
import { VCard } from './VCard';
import { VProgressBar } from './VProgressBar';
import { VRankBadge } from './VRankBadge';

export interface VGoalCardProps {
  title: string;
  category: 'gpa' | 'acft' | 'leadership' | 'oml';
  currentValue: number;
  targetValue: number;
  deadline: string;
  omlImpact?: number;
  createdBy: 'user' | 'ai';
  status: 'active' | 'completed' | 'expired' | 'paused';
  onPress?: () => void;
  className?: string;
}

const categoryIcons: Record<VGoalCardProps['category'], string> = {
  acft: '\u{1F4AA}',
  gpa: '\u{1F4DA}',
  leadership: '\u{1F396}\uFE0F',
  oml: '\u{1F4CA}',
};

function formatDeadline(deadline: string): string {
  try {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return deadline;
  }
}

function formatDelta(current: number, target: number): string {
  const delta = target - current;
  if (delta <= 0) return 'Goal reached';
  if (delta < 1) return `${delta.toFixed(2)} to go`;
  return `${Math.round(delta)} to go`;
}

export const VGoalCard: React.FC<VGoalCardProps> = ({
  title,
  category,
  currentValue,
  targetValue,
  deadline,
  omlImpact,
  createdBy,
  status,
  onPress,
  className = '',
}) => {
  const progress = targetValue > 0 ? Math.min(1, currentValue / targetValue) : 0;
  const isCompleted = status === 'completed';
  const icon = categoryIcons[category];

  const currentDisplay =
    currentValue % 1 === 0 ? String(Math.round(currentValue)) : currentValue.toFixed(2);
  const targetDisplay =
    targetValue % 1 === 0 ? String(Math.round(targetValue)) : targetValue.toFixed(2);

  const Wrapper = onPress ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onPress}
      className={`${onPress ? 'cursor-pointer hover:opacity-90 active:scale-[0.98] w-full text-left transition-all' : ''} ${className}`}
    >
      <VCard tier="lowest">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-bold text-[var(--color-on-surface)] truncate font-[family-name:var(--font-display)]">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {createdBy === 'ai' && <VRankBadge rank="AI" />}
            {isCompleted && <span className="text-lg">{'\u{1F3C6}'}</span>}
          </div>
        </div>

        {/* Progress bar */}
        <div className="my-3">
          <VProgressBar progress={progress} height={6} />
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[var(--color-on-surface)] font-[family-name:var(--font-body)]">
            {currentDisplay}/{targetDisplay} — {formatDelta(currentValue, targetValue)}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">
              Due {formatDeadline(deadline)}
            </span>
            {omlImpact != null && omlImpact > 0 && (
              <span className="text-xs font-bold text-[var(--color-primary)] font-[family-name:var(--font-label)]">
                +{omlImpact} OML pts
              </span>
            )}
          </div>
        </div>
      </VCard>
    </Wrapper>
  );
};
