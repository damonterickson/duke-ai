'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-canvas { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            CANVAS INTEGRATION
          </h1>
        </div>

        {/* Connection Status */}
        <section className="glass-panel-canvas rounded-lg p-8" style={{ boxShadow: '0 0 20px rgba(219,197,133,0.12)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor:
                  status === 'connected' ? '#c3cc8c'
                    : status === 'connecting' ? '#dbc585'
                    : status === 'error' ? '#ffb4ab'
                    : '#968d9d',
                boxShadow: status === 'connected' ? '0 0 10px #c3cc8c' : 'none',
              }}
            />
            <div className="flex-1">
              <span className="text-lg font-black uppercase tracking-tight block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                Canvas LMS
              </span>
              <span className="text-sm text-[#968d9d] mt-0.5 block">
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
                className="py-2.5 px-5 rounded-sm text-[#ffb4ab] text-sm font-bold bg-[#211f23] hover:bg-[#93000a]/20 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="py-2.5 px-5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold hover:scale-[1.02] transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
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
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                What Canvas Integration Does
              </h3>
              <div className="space-y-4">
                {[
                  { icon: 'school', title: 'Auto-Import Grades', desc: 'Pulls your current semester grades directly into your GPA tracker.', color: '#f8e19e', bg: '#544511' },
                  { icon: 'sync', title: 'Real-Time Sync', desc: 'Grades update automatically as instructors post them.', color: '#d9b9ff', bg: '#450084' },
                  { icon: 'analytics', title: 'MSL Course Detection', desc: 'Automatically identifies Military Science courses for MSL GPA calculation.', color: '#c3cc8c', bg: '#2c3303' },
                  { icon: 'calculate', title: 'OML Impact', desc: 'See how grade changes affect your OML score in real time.', color: '#dbc585', bg: '#544511' },
                ].map((feature) => (
                  <div key={feature.title} className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 flex items-start gap-4 border-l-4" style={{ borderLeftColor: feature.bg }}>
                    <div className="p-3 rounded-sm" style={{ backgroundColor: feature.bg }}>
                      <span className="material-symbols-outlined" style={{ color: feature.color, fontVariationSettings: "'FILL' 1" }}>{feature.icon}</span>
                    </div>
                    <div>
                      <span className="text-sm font-black uppercase tracking-tight block mb-0.5" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                        {feature.title}
                      </span>
                      <span className="text-sm text-[#968d9d]">{feature.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel-canvas rounded-lg p-8">
              <h3 className="text-lg font-black uppercase tracking-tight mb-6" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                SETUP INSTRUCTIONS
              </h3>
              <div className="space-y-4">
                {[
                  'Log into your university Canvas portal',
                  'Go to Account > Settings',
                  'Scroll to "Approved Integrations"',
                  'Click "+ New Access Token"',
                  'Name it "Duke Vanguard" and generate',
                  'Copy the token and paste it here',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-sm bg-[#450084] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#d9b9ff]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-sm text-[#e7e1e6]">{step}</span>
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
            <section className="grid grid-cols-2 gap-4">
              <div className="glass-panel-canvas rounded-lg flex flex-col items-center py-6" style={{ boxShadow: '0 0 20px rgba(219,197,133,0.12)' }}>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Cumulative GPA
                </span>
                <span className="text-4xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {computedGPA}
                </span>
              </div>
              <div className="glass-panel-canvas rounded-lg flex flex-col items-center py-6" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  MSL GPA
                </span>
                <span className="text-4xl font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {mslGPA ?? '--'}
                </span>
              </div>
            </section>

            {/* Courses */}
            <section>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Current Courses ({courses.length})
              </h3>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-6 transition-all border-l-4 ${course.isMilScience ? 'border-[#450084]' : 'border-[#373438]'}`}
                    style={course.isMilScience ? { boxShadow: '0 0 15px rgba(69,0,132,0.15)' } : undefined}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 mr-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#d9b9ff] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {course.code}
                        </span>
                        <span className="text-sm text-[#e7e1e6] block mt-0.5 truncate">{course.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#f8e19e] block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                          {course.grade ?? '--'}
                        </span>
                        <span className="text-[10px] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {course.credits} cr
                        </span>
                      </div>
                    </div>
                    {course.isMilScience && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#450084] mt-3">
                        <span className="material-symbols-outlined text-xs text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                        <span className="text-[10px] font-bold text-[#d9b9ff]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
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
              className="w-full bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-6 flex items-center text-left transition-all"
              onClick={() => setAutoSync(!autoSync)}
              role="switch"
              aria-checked={autoSync}
            >
              <div className="flex-1 mr-4">
                <span className="text-base font-black uppercase tracking-tight block" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  Auto-Sync Grades
                </span>
                <span className="text-sm text-[#968d9d] block mt-0.5">Automatically update grades when you open the app</span>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-colors ${autoSync ? 'bg-[#d9b9ff]' : 'bg-[#373438]'}`}>
                <div className={`w-5 h-5 rounded-full absolute top-1 transition-transform shadow-sm ${autoSync ? 'bg-[#450084] translate-x-[24px]' : 'bg-[#968d9d] translate-x-[3px]'}`} />
              </div>
            </button>

            {/* Import Button */}
            <button
              onClick={handleImportGrades}
              className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            >
              Import Grades to OML Engine
            </button>
          </>
        )}
      </div>
    </div>
  );
}
