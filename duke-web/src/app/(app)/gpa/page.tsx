'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';

// ─── Types ──────────────────────────────────────────────────
interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  grade: string;
  isMsl: boolean;
  source: 'manual' | 'canvas';
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

function computeGPA(courses: Course[]): number {
  const graded = courses.filter((c) => GRADE_POINTS[c.grade] !== undefined);
  if (graded.length === 0) return 0;
  const totalPoints = graded.reduce((sum, c) => sum + GRADE_POINTS[c.grade] * c.credits, 0);
  const totalCredits = graded.reduce((sum, c) => sum + c.credits, 0);
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

function omlImpact(grade: string, credits: number): string {
  const gp = GRADE_POINTS[grade] ?? 0;
  const impact = (gp / 4.0) * credits * 0.8; // rough OML impact
  return `+${impact.toFixed(1)} pts`;
}

// ─── Add Course Modal ───────────────────────────────────────
function AddCourseModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Omit<Course, 'id'>) => void }) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState('3');
  const [grade, setGrade] = useState('A');
  const [isMsl, setIsMsl] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#211f23] rounded-lg p-8 w-full max-w-md space-y-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>ADD COURSE</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="MSL 301" className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#f8e19e]/30 placeholder:text-[#968d9d]" style={{ border: 'none' }} />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Adaptive Team Leadership" className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#f8e19e]/30 placeholder:text-[#968d9d]" style={{ border: 'none' }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Credits</label>
            <input type="number" min="1" max="6" value={credits} onChange={(e) => setCredits(e.target.value)} className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#f8e19e]/30" style={{ border: 'none' }} />
          </div>
          <div>
            <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Grade</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#f8e19e]/30" style={{ border: 'none' }}>
              {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <button
              onClick={() => setIsMsl(!isMsl)}
              className={`w-full py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${isMsl ? 'bg-[#450084] text-[#d9b9ff]' : 'bg-[#151317] text-[#968d9d]'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {isMsl ? 'MSL ✓' : 'MSL?'}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-sm text-[#968d9d] hover:text-[#e7e1e6] text-sm font-bold uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Cancel</button>
          <button
            onClick={() => {
              if (code.trim() && title.trim()) {
                onAdd({ code: code.trim(), title: title.trim(), credits: parseInt(credits) || 3, grade, isMsl, source: 'manual' });
              }
            }}
            className="flex-1 py-3 rounded-sm bg-[#544511] text-[#f8e19e] font-bold uppercase tracking-wider text-sm hover:scale-[1.02] transition-all"
            style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 15px rgba(84,69,17,0.3)' }}
          >
            Add Course
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main GPA Page ──────────────────────────────────────────
export default function GPAPage() {
  const router = useRouter();
  const scores = useScoresStore();
  const latest = scores.scoreHistory[0];

  const [courses, setCourses] = useState<Course[]>(() => {
    // Load from localStorage or use defaults
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duke_courses');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingGrade, setEditingGrade] = useState<string | null>(null);

  const saveCourses = (updated: Course[]) => {
    setCourses(updated);
    if (typeof window !== 'undefined') localStorage.setItem('duke_courses', JSON.stringify(updated));
  };

  const cumulativeGPA = useMemo(() => {
    if (courses.length > 0) return computeGPA(courses);
    return latest?.gpa ?? 0;
  }, [courses, latest]);

  const mslGPA = useMemo(() => {
    const mslCourses = courses.filter((c) => c.isMsl);
    if (mslCourses.length > 0) return computeGPA(mslCourses);
    return latest?.msl_gpa ?? null;
  }, [courses, latest]);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const goalGPA = 3.85;
  const progressToGoal = cumulativeGPA > 0 ? Math.min((cumulativeGPA / goalGPA) * 100, 100) : 0;

  function handleAddCourse(c: Omit<Course, 'id'>) {
    const newCourse: Course = { ...c, id: `c-${Date.now()}` };
    saveCourses([...courses, newCourse]);
    setShowAddCourse(false);

    // Also update the score store with the new GPA
    const updated = [...courses, newCourse];
    const newGPA = computeGPA(updated);
    const newMslGPA = computeGPA(updated.filter((x) => x.isMsl));
    scores.addScoreEntry({
      gpa: newGPA,
      msl_gpa: newMslGPA > 0 ? newMslGPA : null,
      acft_total: latest?.acft_total ?? null,
      leadership_eval: latest?.leadership_eval ?? null,
      cst_score: latest?.cst_score ?? null,
      clc_score: latest?.clc_score ?? null,
      total_oml: latest?.total_oml ?? null,
    });
  }

  function handleGradeChange(courseId: string, newGrade: string) {
    const updated = courses.map((c) => c.id === courseId ? { ...c, grade: newGrade } : c);
    saveCourses(updated);
    setEditingGrade(null);

    // Update score store
    const newGPA = computeGPA(updated);
    const newMslGPA = computeGPA(updated.filter((x) => x.isMsl));
    scores.addScoreEntry({
      gpa: newGPA,
      msl_gpa: newMslGPA > 0 ? newMslGPA : null,
      acft_total: latest?.acft_total ?? null,
      leadership_eval: latest?.leadership_eval ?? null,
      cst_score: latest?.cst_score ?? null,
      clc_score: latest?.clc_score ?? null,
      total_oml: latest?.total_oml ?? null,
    });
  }

  function handleRemoveCourse(courseId: string) {
    saveCourses(courses.filter((c) => c.id !== courseId));
  }

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style jsx global>{`
        .glass-panel-gpa { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Academic Pillar</span>
              <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>GPA & ACADEMICS</h1>
            </div>
          </div>
          <button
            onClick={() => router.push('/canvas')}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-[#211f23] text-[#968d9d] hover:text-[#d9b9ff] hover:bg-[#2c292d] transition-all text-xs font-bold uppercase tracking-wider"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            Canvas Sync
          </button>
        </div>

        {/* Hero: GPA Visualization + Insight Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* GPA Display */}
          <div className="lg:col-span-8 glass-panel-gpa p-10 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[144px]">school</span>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] block mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Academic Standing</span>
                  <div className="flex items-baseline gap-4">
                    <span className="text-7xl font-black tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif', color: '#f8e19e', filter: 'drop-shadow(0 0 15px rgba(248,225,158,0.3))' }}>
                      {cumulativeGPA > 0 ? cumulativeGPA.toFixed(2) : '--'}
                    </span>
                    <span className="text-2xl font-bold text-[#968d9d]">/ 4.00</span>
                  </div>
                  {mslGPA != null && mslGPA > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MSL GPA: </span>
                      <span className="text-lg font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{mslGPA.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {courses.some((c) => c.source === 'canvas') && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#c3cc8c] bg-[#2c3303] px-2 py-1 rounded-sm">
                      <span className="material-symbols-outlined text-xs animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                      LIVE DATA
                    </div>
                  )}
                </div>
              </div>

              {/* Progress to goal */}
              <div className="mt-8 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Semester Target: {goalGPA}</span>
                  <span className="text-[10px] font-bold text-[#dbc585]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{progressToGoal.toFixed(1)}% TO GOAL</span>
                </div>
                <div className="h-2 w-full bg-[#373438] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progressToGoal}%`, background: 'linear-gradient(90deg, #dbc585, #f8e19e)', boxShadow: '0 0 8px rgba(219,197,133,0.3)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Insight Panel */}
          <div className="lg:col-span-4 bg-[#450084] p-8 rounded-lg flex flex-col justify-between" style={{ boxShadow: '0 0 30px rgba(69,0,132,0.2)' }}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#dbc585]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Academic Intel</span>
              </div>
              <p className="text-lg italic text-[#e7e1e6]/90 leading-relaxed" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {cumulativeGPA >= 3.5
                  ? `"Strong academic performance at ${cumulativeGPA.toFixed(2)}. Consider adding MSL courses to maximize both GPA and leadership pillars."`
                  : cumulativeGPA > 0
                  ? `"Focus on raising GPA above 3.5 — academic pillar is 40% of OML. Every 0.1 GPA point matters."`
                  : `"Add your courses below to start tracking your academic pillar. GPA contributes 40% of your total OML score."`}
              </p>
            </div>
            <button
              onClick={() => router.push('/what-if')}
              className="mt-6 w-full py-3 bg-[#d9b9ff]/10 text-[#d9b9ff] rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-[#d9b9ff]/20 transition-all text-sm uppercase tracking-wider"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Simulate GPA
            </button>
          </div>
        </section>

        {/* Course List */}
        <section className="space-y-5">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>Current Courses</h3>
              <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {courses.length} courses · {totalCredits} credits
              </span>
            </div>
            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-sm bg-[#544511] text-[#f8e19e] text-xs font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 15px rgba(84,69,17,0.3)' }}
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Add Course
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="glass-panel-gpa p-12 rounded-lg text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-[#968d9d]">menu_book</span>
              <h4 className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>No Courses Yet</h4>
              <p className="text-sm text-[#968d9d] max-w-md mx-auto">Add your courses manually or sync from Canvas LMS. Your GPA will auto-calculate and feed into your OML score.</p>
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={() => setShowAddCourse(true)} className="px-5 py-2.5 rounded-sm bg-[#544511] text-[#f8e19e] text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Add Manually
                </button>
                <button onClick={() => router.push('/canvas')} className="px-5 py-2.5 rounded-sm bg-[#211f23] text-[#968d9d] hover:text-[#d9b9ff] text-xs font-bold uppercase tracking-wider transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Connect Canvas
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1d1b1f] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#211f23]">
                <span className="col-span-2 text-[10px] text-[#968d9d] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Code</span>
                <span className="col-span-4 text-[10px] text-[#968d9d] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Title</span>
                <span className="col-span-2 text-[10px] text-[#968d9d] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Grade</span>
                <span className="col-span-2 text-[10px] text-[#968d9d] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>OML Impact</span>
                <span className="col-span-2 text-[10px] text-[#968d9d] uppercase tracking-[0.2em] font-bold text-right" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Actions</span>
              </div>

              {/* Course Rows */}
              <div className="divide-y divide-[#373438]/30">
                {courses.map((course) => (
                  <div key={course.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#211f23] transition-colors group">
                    <div className="col-span-2">
                      <span className="px-2 py-1 bg-[#544511] text-[#dbc585] text-[10px] font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{course.code}</span>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ fontFamily: 'Public Sans, sans-serif' }}>{course.title}</span>
                        {course.isMsl && (
                          <span className="text-[9px] font-bold text-[#d9b9ff] bg-[#450084] px-1.5 py-0.5 rounded-sm">MSL</span>
                        )}
                        {course.source === 'canvas' && (
                          <span className="text-[9px] font-bold text-[#c3cc8c] bg-[#2c3303] px-1.5 py-0.5 rounded-sm">SYNCED</span>
                        )}
                      </div>
                      <span className="text-xs text-[#968d9d]">{course.credits} Credits</span>
                    </div>
                    <div className="col-span-2">
                      {editingGrade === course.id ? (
                        <select
                          value={course.grade}
                          onChange={(e) => handleGradeChange(course.id, e.target.value)}
                          onBlur={() => setEditingGrade(null)}
                          autoFocus
                          className="bg-[#151317] text-[#e7e1e6] rounded-sm px-2 py-1 text-sm outline-none"
                          style={{ border: 'none' }}
                        >
                          {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => setEditingGrade(course.id)} className="flex items-center gap-2 group/grade">
                          <span className="text-xl font-black" style={{ fontFamily: 'Public Sans, sans-serif', color: GRADE_POINTS[course.grade] >= 3.7 ? '#f8e19e' : GRADE_POINTS[course.grade] >= 3.0 ? '#dbc585' : '#968d9d' }}>
                            {course.grade}
                          </span>
                          <span className="material-symbols-outlined text-xs text-[#968d9d] opacity-0 group-hover/grade:opacity-100 transition-opacity">edit</span>
                        </button>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#dbc585] flex items-center gap-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                        {omlImpact(course.grade, course.credits)}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-[#968d9d] hover:text-[#ffb4ab] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1d1b1f] p-6 rounded-lg">
            <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Total Credits</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{totalCredits}</span>
              <span className="text-xs text-[#968d9d]">/ 120 REQ</span>
            </div>
          </div>
          <div className="bg-[#1d1b1f] p-6 rounded-lg">
            <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MSL Courses</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{courses.filter((c) => c.isMsl).length}</span>
              <span className="text-xs text-[#968d9d]">TRACKED</span>
            </div>
          </div>
          <div className="bg-[#1d1b1f] p-6 rounded-lg">
            <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>OML Weight</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>40%</span>
              <span className="text-xs text-[#968d9d]">OF TOTAL</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/canvas')}
            className="bg-[#450084]/10 p-6 rounded-lg flex flex-col items-center justify-center hover:bg-[#450084]/20 transition-all cursor-pointer group"
            style={{ boxShadow: '0 0 20px rgba(69,0,132,0.1)' }}
          >
            <span className="material-symbols-outlined text-3xl text-[#d9b9ff] mb-2">sync</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#d9b9ff]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Sync Canvas</span>
            <span className="text-[9px] text-[#968d9d] mt-1">MANAGE LMS</span>
          </button>
        </section>
      </div>

      {showAddCourse && <AddCourseModal onClose={() => setShowAddCourse(false)} onAdd={handleAddCourse} />}
    </div>
  );
}
