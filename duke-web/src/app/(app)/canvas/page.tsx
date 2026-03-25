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
import { VButton } from '@/components';

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
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">CANVAS INTEGRATION</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-6">
        {/* Connection Status */}
        <section className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full border-2"
              style={{
                backgroundColor:
                  status === 'connected' ? '#4caf50'
                    : status === 'connecting' ? 'var(--color-tertiary)'
                    : status === 'error' ? 'var(--color-error)'
                    : 'var(--color-outline)',
                borderColor:
                  status === 'connected' ? '#4caf5040'
                    : status === 'connecting' ? 'var(--color-tertiary)'
                    : 'transparent',
              }}
            />
            <div className="flex-1">
              <span className="text-base font-bold text-[var(--color-on-surface)] block">Canvas LMS</span>
              <span className="text-sm text-[var(--color-on-surface-variant)] mt-0.5 block">
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
                className="py-2 px-4 rounded-md border border-[var(--color-error)] text-[var(--color-error)] text-sm font-bold cursor-pointer hover:bg-[var(--color-error-container)] transition-colors"
                aria-label="Disconnect Canvas"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="py-2 px-4 rounded-md gradient-primary text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)]"
                aria-label="Connect to Canvas"
              >
                Connect
              </button>
            )}
          </div>
        </section>

        {/* Not Connected - Features & Setup */}
        {status === 'disconnected' && (
          <>
            <section>
              <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">What Canvas Integration Does</h2>
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] divide-y divide-[var(--ghost-border)]">
                {[
                  { icon: MdSchool, title: 'Auto-Import Grades', desc: 'Pulls your current semester grades directly into your GPA tracker.' },
                  { icon: MdSync, title: 'Real-Time Sync', desc: 'Grades update automatically as instructors post them.' },
                  { icon: MdAnalytics, title: 'MSL Course Detection', desc: 'Automatically identifies Military Science courses for MSL GPA calculation.' },
                  { icon: MdCalculate, title: 'OML Impact', desc: 'See how grade changes affect your OML score in real time.' },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-4">
                      <div className="w-9 h-9 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-[var(--color-on-primary-container)]" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-[var(--color-on-surface)] block mb-0.5">{feature.title}</span>
                        <span className="text-sm text-[var(--color-on-surface-variant)]">{feature.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
              <h3 className="text-base font-bold text-[var(--color-on-surface)] mb-4 font-[family-name:var(--font-display)]">Setup Instructions</h3>
              <div className="space-y-3">
                {[
                  'Log into your university Canvas portal',
                  'Go to Account > Settings',
                  'Scroll to "Approved Integrations"',
                  'Click "+ New Access Token"',
                  'Name it "Duke Vanguard" and generate',
                  'Copy the token and paste it here',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-white">{i + 1}</span>
                    </div>
                    <span className="text-sm text-[var(--color-on-surface)] flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Connected - Course List */}
        {status === 'connected' && courses.length > 0 && (
          <>
            {/* GPA Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center py-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1.5 font-[family-name:var(--font-label)]">CUMULATIVE GPA</span>
                <span className="text-2xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">{computedGPA}</span>
              </div>
              <div className="flex flex-col items-center py-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1.5 font-[family-name:var(--font-label)]">MSL GPA</span>
                <span className="text-2xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">{mslGPA ?? '--'}</span>
              </div>
            </div>

            {/* Courses */}
            <section>
              <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">
                Current Courses ({courses.length})
              </h2>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-md bg-[var(--color-surface-container-low)] shadow-[var(--shadow-sm)] border"
                    style={{
                      borderColor: course.isMilScience ? 'var(--color-primary)' : 'var(--ghost-border)',
                      borderWidth: course.isMilScience ? 2 : 1,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 mr-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] block font-[family-name:var(--font-label)]">{course.code}</span>
                        <span className="text-sm text-[var(--color-on-surface)] block mt-0.5 truncate">{course.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-[var(--color-on-surface)] block font-[family-name:var(--font-display)]">{course.grade ?? '--'}</span>
                        <span className="text-xs text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">{course.credits} cr</span>
                      </div>
                    </div>
                    {course.isMilScience && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[var(--color-primary-container)] mt-2">
                        <MdMilitaryTech size={12} className="text-[var(--color-on-primary-container)]" />
                        <span className="text-xs font-bold text-[var(--color-on-primary-container)] font-[family-name:var(--font-label)]">Military Science</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Auto-sync toggle */}
            <button
              className="w-full flex items-center p-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)] cursor-pointer text-left hover:bg-[var(--color-surface-container)] transition-colors"
              onClick={() => setAutoSync(!autoSync)}
              aria-label={`Auto-sync is ${autoSync ? 'on' : 'off'}`}
              role="switch"
              aria-checked={autoSync}
            >
              <div className="flex-1 mr-3">
                <span className="text-base font-bold text-[var(--color-on-surface)] block">Auto-Sync Grades</span>
                <span className="text-sm text-[var(--color-on-surface-variant)] block mt-0.5">Automatically update grades when you open the app</span>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-colors ${autoSync ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-container-high)]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${autoSync ? 'translate-x-[24px]' : 'translate-x-[3px]'}`} />
              </div>
            </button>

            {/* Import Button */}
            <button
              onClick={handleImportGrades}
              className="w-full py-3 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
            >
              Import Grades to OML Engine
            </button>
          </>
        )}
      </div>
    </div>
  );
}
