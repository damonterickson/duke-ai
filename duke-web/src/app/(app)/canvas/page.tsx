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
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#dbc585]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          CANVAS INTEGRATION
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-8">
        {/* Connection Status */}
        <section className="glass-card ghost-border rounded-sm p-5 glow-shadow-gold">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{
                backgroundColor:
                  status === 'connected' ? '#c3cc8c'
                    : status === 'connecting' ? '#dbc585'
                    : status === 'error' ? '#ffb4ab'
                    : '#968d9d',
                boxShadow:
                  status === 'connected' ? '0 0 10px #c3cc8c' : 'none',
              }}
            />
            <div className="flex-1">
              <span
                className="text-base font-black text-[#e7e1e6] block uppercase tracking-tight"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                Canvas LMS
              </span>
              <span className="text-sm text-[#cdc3d4] mt-0.5 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                {status === 'connected' ? 'Connected - Duke University'
                  : status === 'connecting' ? 'Connecting...'
                  : status === 'error' ? 'Connection failed'
                  : 'Not connected'}
              </span>
            </div>
            {status === 'connecting' ? (
              <div className="w-5 h-5 border-2 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
            ) : status === 'connected' ? (
              <button
                onClick={handleDisconnect}
                className="py-2 px-4 rounded-sm text-[#ffb4ab] text-sm font-bold cursor-pointer glass-card ghost-border hover:bg-[#93000a]/20 transition-colors"
                aria-label="Disconnect Canvas"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="py-2 px-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
                aria-label="Connect to Canvas"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Connect
              </button>
            )}
          </div>
        </section>

        {/* Not Connected - Features & Setup */}
        {status === 'disconnected' && (
          <>
            <section className="bg-[#1d1b1f] rounded-sm p-6">
              <h2
                className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                WHAT CANVAS INTEGRATION DOES
              </h2>
              <div className="space-y-4">
                {[
                  { icon: MdSchool, title: 'Auto-Import Grades', desc: 'Pulls your current semester grades directly into your GPA tracker.' },
                  { icon: MdSync, title: 'Real-Time Sync', desc: 'Grades update automatically as instructors post them.' },
                  { icon: MdAnalytics, title: 'MSL Course Detection', desc: 'Automatically identifies Military Science courses for MSL GPA calculation.' },
                  { icon: MdCalculate, title: 'OML Impact', desc: 'See how grade changes affect your OML score in real time.' },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-sm bg-[#450084] flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-[#b27ff5]" />
                      </div>
                      <div className="flex-1">
                        <span
                          className="text-sm font-black text-[#e7e1e6] block mb-0.5 uppercase tracking-tight"
                          style={{ fontFamily: 'Public Sans, sans-serif' }}
                        >
                          {feature.title}
                        </span>
                        <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>{feature.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass-card ghost-border rounded-sm p-5">
              <h3
                className="text-base font-black uppercase tracking-tight text-[#e7e1e6] mb-4"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                SETUP INSTRUCTIONS
              </h3>
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
                    <div className="w-7 h-7 rounded-sm bg-[#450084] flex items-center justify-center shrink-0">
                      <span
                        className="text-xs font-bold text-[#b27ff5]"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-sm text-[#e7e1e6] flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>{step}</span>
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
              <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-4 glow-shadow-gold">
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-1.5"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  CUMULATIVE GPA
                </span>
                <span
                  className="text-2xl font-black text-[#f8e19e]"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  {computedGPA}
                </span>
              </div>
              <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-4 glow-shadow-purple">
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-1.5"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  MSL GPA
                </span>
                <span
                  className="text-2xl font-black text-[#d9b9ff]"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  {mslGPA ?? '--'}
                </span>
              </div>
            </div>

            {/* Courses */}
            <section className="bg-[#1d1b1f] rounded-sm p-6">
              <h2
                className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                CURRENT COURSES ({courses.length})
              </h2>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 rounded-sm glass-card ${course.isMilScience ? 'glow-shadow-purple' : 'ghost-border'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 mr-3">
                        <span
                          className="text-[10px] uppercase tracking-[0.2em] text-[#d9b9ff] block"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {course.code}
                        </span>
                        <span className="text-sm text-[#e7e1e6] block mt-0.5 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{course.name}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-xl font-black text-[#f8e19e] block"
                          style={{ fontFamily: 'Public Sans, sans-serif' }}
                        >
                          {course.grade ?? '--'}
                        </span>
                        <span
                          className="text-[10px] text-[#968d9d]"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {course.credits} cr
                        </span>
                      </div>
                    </div>
                    {course.isMilScience && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#450084] mt-2">
                        <MdMilitaryTech size={12} className="text-[#b27ff5]" />
                        <span
                          className="text-[10px] font-bold text-[#b27ff5]"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          Military Science
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Auto-sync toggle */}
            <button
              className="w-full flex items-center p-4 rounded-sm glass-card ghost-border cursor-pointer text-left hover:bg-[#450084]/10 transition-colors"
              onClick={() => setAutoSync(!autoSync)}
              aria-label={`Auto-sync is ${autoSync ? 'on' : 'off'}`}
              role="switch"
              aria-checked={autoSync}
            >
              <div className="flex-1 mr-3">
                <span
                  className="text-base font-black text-[#e7e1e6] block uppercase tracking-tight"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  Auto-Sync Grades
                </span>
                <span className="text-sm text-[#cdc3d4] block mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Automatically update grades when you open the app</span>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-colors ${autoSync ? 'bg-[#d9b9ff]' : 'bg-[#373438]'}`}>
                <div className={`w-5 h-5 rounded-full absolute top-1 transition-transform shadow-sm ${autoSync ? 'bg-[#450084] translate-x-[24px]' : 'bg-[#968d9d] translate-x-[3px]'}`} />
              </div>
            </button>

            {/* Import Button */}
            <button
              onClick={handleImportGrades}
              className="w-full py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Import Grades to OML Engine
            </button>
          </>
        )}
      </div>
    </div>
  );
}
