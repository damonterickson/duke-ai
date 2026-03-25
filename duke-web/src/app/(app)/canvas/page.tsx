'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack,
  MdSchool,
  MdSync,
  MdAnalytics,
  MdCalculate,
  MdMilitaryTech,
} from 'react-icons/md';
import { VGlassPanel, VButton } from '@/components';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface CanvasCourse {
  id: string;
  name: string;
  code: string;
  grade: string | null;
  credits: number;
  isMilScience: boolean;
}

const DEMO_COURSES: CanvasCourse[] = [
  { id: '1', name: 'Military Science III', code: 'MSL 301', grade: 'A', credits: 3, isMilScience: true },
  { id: '2', name: 'Advanced Leadership Lab', code: 'MSL 302', grade: 'A-', credits: 1, isMilScience: true },
  { id: '3', name: 'Introduction to Engineering', code: 'EGR 101', grade: 'B+', credits: 4, isMilScience: false },
  { id: '4', name: 'American History', code: 'HIST 201', grade: 'A-', credits: 3, isMilScience: false },
  { id: '5', name: 'Calculus II', code: 'MATH 202', grade: 'B', credits: 4, isMilScience: false },
];

export default function CanvasPage() {
  const router = useRouter();

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [autoSync, setAutoSync] = useState(false);

  const handleConnect = useCallback(() => {
    if (!window.confirm('Connect to Canvas LMS? You\'ll need your Canvas API token.')) return;
    setStatus('connecting');
    setTimeout(() => {
      setStatus('connected');
      setCourses(DEMO_COURSES);
    }, 2500);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (!window.confirm('Disconnect Canvas? Your imported grades will be kept.')) return;
    setStatus('disconnected');
    setCourses([]);
    setAutoSync(false);
  }, []);

  const handleImportGrades = useCallback(() => {
    if (window.confirm(`Import grades from ${courses.length} courses? This will update your GPA calculation.`)) {
      window.alert('Grades Imported. Your academic data has been updated.');
    }
  }, [courses.length]);

  const gradePoints: Record<string, number> = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0,
  };

  const computedGPA = courses.length > 0
    ? (courses.reduce((sum, c) => sum + (gradePoints[c.grade ?? ''] ?? 0) * c.credits, 0) / courses.reduce((sum, c) => sum + c.credits, 0)).toFixed(2)
    : null;

  const mslCourses = courses.filter((c) => c.isMilScience);
  const mslGPA = mslCourses.length > 0
    ? (mslCourses.reduce((sum, c) => sum + (gradePoints[c.grade ?? ''] ?? 0) * c.credits, 0) / mslCourses.reduce((sum, c) => sum + c.credits, 0)).toFixed(2)
    : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white cursor-pointer">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-base font-bold tracking-[2px] text-white">CANVAS INTEGRATION</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] p-4 pb-16">
        {/* Connection Status */}
        <VGlassPanel className="mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  status === 'connected' ? '#4caf50'
                    : status === 'connecting' ? 'var(--color-tertiary)'
                    : status === 'error' ? 'var(--color-error)'
                    : 'var(--color-outline)',
              }}
            />
            <div className="flex-1">
              <span className="text-base font-semibold text-[var(--color-on-surface)] block">Canvas LMS</span>
              <span className="text-sm text-[var(--color-outline)] mt-0.5 block">
                {status === 'connected' ? 'Connected - Duke University'
                  : status === 'connecting' ? 'Connecting...'
                  : status === 'error' ? 'Connection failed'
                  : 'Not connected'}
              </span>
            </div>
            {status === 'connecting' ? (
              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            ) : status === 'connected' ? (
              <button
                onClick={handleDisconnect}
                className="py-2 px-3 rounded-lg border border-[var(--color-error)] text-[var(--color-error)] text-sm font-semibold cursor-pointer"
                aria-label="Disconnect Canvas"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="py-2 px-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold cursor-pointer"
                aria-label="Connect to Canvas"
              >
                Connect
              </button>
            )}
          </div>
        </VGlassPanel>

        {/* Not Connected - Features & Setup */}
        {status === 'disconnected' && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3">What Canvas Integration Does</h2>
              {[
                { icon: MdSchool, title: 'Auto-Import Grades', desc: 'Pulls your current semester grades directly into your GPA tracker.' },
                { icon: MdSync, title: 'Real-Time Sync', desc: 'Grades update automatically as instructors post them.' },
                { icon: MdAnalytics, title: 'MSL Course Detection', desc: 'Automatically identifies Military Science courses for MSL GPA calculation.' },
                { icon: MdCalculate, title: 'OML Impact', desc: 'See how grade changes affect your OML score in real time.' },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-[var(--color-outline-variant)]/50">
                    <Icon size={24} className="text-[var(--color-primary)] shrink-0" />
                    <div className="flex-1">
                      <span className="text-base font-semibold text-[var(--color-on-surface)] block mb-0.5">{feature.title}</span>
                      <span className="text-sm text-[var(--color-outline)]">{feature.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <VGlassPanel className="mb-4">
              <h3 className="text-base font-semibold text-[var(--color-on-surface)] mb-3">Setup Instructions</h3>
              {[
                'Log into your university Canvas portal',
                'Go to Account > Settings',
                'Scroll to "Approved Integrations"',
                'Click "+ New Access Token"',
                'Name it "Duke Vanguard" and generate',
                'Copy the token and paste it here',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[var(--color-on-primary-container)]">{i + 1}</span>
                  </div>
                  <span className="text-sm text-[var(--color-on-surface)] flex-1">{step}</span>
                </div>
              ))}
            </VGlassPanel>
          </>
        )}

        {/* Connected - Course List */}
        {status === 'connected' && courses.length > 0 && (
          <>
            {/* GPA Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col items-center py-3 rounded-xl bg-[var(--color-surface-container)]">
                <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-outline)] mb-1">CUMULATIVE GPA</span>
                <span className="text-xl font-semibold text-[var(--color-on-surface)]">{computedGPA}</span>
              </div>
              <div className="flex flex-col items-center py-3 rounded-xl bg-[var(--color-surface-container)]">
                <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-outline)] mb-1">MSL GPA</span>
                <span className="text-xl font-semibold text-[var(--color-on-surface)]">{mslGPA ?? '--'}</span>
              </div>
            </div>

            {/* Courses */}
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3">
              Current Courses ({courses.length})
            </h2>
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-3 rounded-xl mb-2 bg-[var(--glass-overlay)] border"
                style={{
                  borderColor: course.isMilScience ? 'var(--color-primary)' : 'var(--ghost-border-color)',
                  borderWidth: course.isMilScience ? 1.5 : 1,
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 mr-3">
                    <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-primary)] block">{course.code}</span>
                    <span className="text-sm text-[var(--color-on-surface)] block mt-0.5 truncate">{course.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-[var(--color-on-surface)] block">{course.grade ?? '--'}</span>
                    <span className="text-xs text-[var(--color-outline)]">{course.credits} cr</span>
                  </div>
                </div>
                {course.isMilScience && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-primary-container)] mt-2">
                    <MdMilitaryTech size={12} className="text-[var(--color-on-primary-container)]" />
                    <span className="text-xs font-medium text-[var(--color-on-primary-container)]">Military Science</span>
                  </div>
                )}
              </div>
            ))}

            {/* Auto-sync toggle */}
            <button
              className="w-full flex items-center p-4 rounded-xl mt-3 mb-3 bg-[var(--color-surface-container)] cursor-pointer text-left"
              onClick={() => setAutoSync(!autoSync)}
              aria-label={`Auto-sync is ${autoSync ? 'on' : 'off'}`}
              role="switch"
              aria-checked={autoSync}
            >
              <div className="flex-1 mr-3">
                <span className="text-base font-semibold text-[var(--color-on-surface)] block">Auto-Sync Grades</span>
                <span className="text-sm text-[var(--color-outline)] block mt-0.5">Automatically update grades when you open the app</span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors ${autoSync ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-outline-variant)]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${autoSync ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </div>
            </button>

            {/* Import Button */}
            <VButton
              label="Import Grades to OML Engine"
              onPress={handleImportGrades}
              className="w-full mt-2"
            />
          </>
        )}
      </div>
    </div>
  );
}
