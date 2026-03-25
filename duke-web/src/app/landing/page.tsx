'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MdShield, MdPsychology, MdSchool, MdFitnessCenter } from 'react-icons/md';

/* ─── Fade-in on scroll hook ─── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('landing-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className={`landing-fade ${className}`}>
      {children}
    </div>
  );
}

/* ─── Color tokens (Kinetic Command / dark) ─── */
const C = {
  bg: '#0f0d11',
  surface: '#1d1b1f',
  surfaceHigh: '#272329',
  primary: '#d9b9ff',
  gold: '#dbc585',
  text: '#e7e1e6',
  textSecondary: '#cdc3d4',
  outline: '#4a4453',
  gradientFrom: '#450084',
  gradientTo: '#d9b9ff',
} as const;

export default function LandingPage() {
  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="min-h-screen font-[family-name:var(--font-body)]"
    >
      {/* ────────── Inline styles for animations ────────── */}
      <style jsx global>{`
        .landing-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .landing-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .landing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(217, 185, 255, 0.12);
        }
        .landing-cta:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
      `}</style>

      {/* ════════════════ NAV ════════════════ */}
      <nav
        style={{ backgroundColor: `${C.bg}ee`, borderBottom: `1px solid ${C.outline}33` }}
        className="sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <MdShield size={28} style={{ color: C.primary }} />
            <span
              style={{ color: C.text }}
              className="text-lg font-bold tracking-[3px] uppercase font-[family-name:var(--font-display)]"
            >
              VANGUARD
            </span>
          </div>

          {/* Links */}
          <div className="hidden sm:flex items-center gap-8">
            <a href="#features" style={{ color: C.textSecondary }} className="text-sm font-medium hover:opacity-80 transition-opacity">
              Mission
            </a>
            <a href="#stats" style={{ color: C.textSecondary }} className="text-sm font-medium hover:opacity-80 transition-opacity">
              Academy
            </a>
            <a href="#cta" style={{ color: C.textSecondary }} className="text-sm font-medium hover:opacity-80 transition-opacity">
              Tactical
            </a>
          </div>

          {/* Login */}
          <Link
            href="/auth"
            style={{ border: `1px solid ${C.primary}`, color: C.primary }}
            className="px-5 py-2 rounded-md text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity font-[family-name:var(--font-label)]"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <FadeSection>
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ backgroundColor: C.surfaceHigh, border: `1px solid ${C.outline}` }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4ade80' }} />
            <span className="text-xs font-bold tracking-wider uppercase font-[family-name:var(--font-label)]" style={{ color: C.gold }}>
              Operational Status: Combat Ready
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-none mb-6 font-[family-name:var(--font-display)]"
            style={{ color: C.text }}
          >
            MAXIMIZE YOUR{' '}
            <span style={{ color: C.primary }}>OML</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl font-medium mb-3" style={{ color: C.textSecondary }}>
            Elite-tier performance tracker and AI mentor for Army ROTC Cadets
          </p>
          <p className="text-sm sm:text-base mb-10" style={{ color: C.textSecondary }}>
            Command your career path with data-driven precision
          </p>

          <Link
            href="/auth"
            className="landing-cta inline-block px-10 py-4 rounded-md text-sm font-bold uppercase tracking-widest transition-all font-[family-name:var(--font-label)]"
            style={{
              background: `linear-gradient(135deg, ${C.gradientFrom}, ${C.gradientTo})`,
              color: '#ffffff',
              boxShadow: '0 4px 24px rgba(69,0,132,0.4)',
            }}
          >
            START MISSION BRIEFING
          </Link>
        </FadeSection>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section id="stats" className="py-20" style={{ backgroundColor: C.surface }}>
        <div className="max-w-5xl mx-auto px-6">
          <FadeSection>
            <p
              className="text-xs font-bold tracking-[4px] uppercase text-center mb-12 font-[family-name:var(--font-label)]"
              style={{ color: C.gold }}
            >
              TRUSTED BY CADETS ACROSS THE BATTALION
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { value: '800+', label: 'OML Points Average' },
                { value: '100%', label: 'Canvas Sync' },
                { value: 'Top 10%', label: 'National Rank' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="landing-card rounded-xl p-8 text-center transition-all duration-300"
                  style={{ backgroundColor: C.surfaceHigh, border: `1px solid ${C.outline}44` }}
                >
                  <span
                    className="block text-4xl font-black mb-2 font-[family-name:var(--font-display)]"
                    style={{ color: C.primary }}
                  >
                    {s.value}
                  </span>
                  <span className="text-sm font-medium" style={{ color: C.textSecondary }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <FadeSection>
            <p
              className="text-xs font-bold tracking-[4px] uppercase text-center mb-2 font-[family-name:var(--font-label)]"
              style={{ color: C.gold }}
            >
              System Module: 04-B / Vanguard Core
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black uppercase text-center mb-16 font-[family-name:var(--font-display)]"
              style={{ color: C.text }}
            >
              TACTICAL ADVANTAGE THROUGH{' '}
              <span style={{ color: C.primary }}>SUPERIOR DATA</span>
            </h2>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MdPsychology size={32} style={{ color: C.primary }} />,
                title: 'Strategic AI Mentor',
                desc: 'Real-time tactical advice for ranking improvement. Personal AI advisor analyzing your OML trajectory.',
              },
              {
                icon: <MdSchool size={32} style={{ color: C.primary }} />,
                title: 'Canvas LMS Integration',
                desc: 'Automated grade tracking from your university systems. Sync your academic performance effortlessly.',
              },
              {
                icon: <MdFitnessCenter size={32} style={{ color: C.primary }} />,
                title: 'ACFT Performance Log',
                desc: 'Rep and mile tracking with trajectory analysis. Log every ACFT attempt and see OML impact.',
              },
            ].map((f) => (
              <FadeSection key={f.title}>
                <div
                  className="landing-card rounded-xl p-8 h-full transition-all duration-300"
                  style={{ backgroundColor: C.surface, border: `1px solid ${C.outline}44` }}
                >
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${C.primary}15` }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    className="text-lg font-bold mb-3 font-[family-name:var(--font-display)]"
                    style={{ color: C.text }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                    {f.desc}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section id="cta" className="py-24" style={{ backgroundColor: C.surface }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeSection>
            <h2
              className="text-4xl sm:text-5xl font-black uppercase mb-4 font-[family-name:var(--font-display)]"
              style={{ color: C.text }}
            >
              READY TO <span style={{ color: C.primary }}>LEAD</span>?
            </h2>
            <p className="text-base sm:text-lg mb-10" style={{ color: C.textSecondary }}>
              The mission starts now. Join the ranks of the high-performers.
            </p>
            <Link
              href="/auth"
              className="landing-cta inline-block px-10 py-4 rounded-md text-sm font-bold uppercase tracking-widest transition-all font-[family-name:var(--font-label)]"
              style={{
                background: `linear-gradient(135deg, ${C.gradientFrom}, ${C.gradientTo})`,
                color: '#ffffff',
                boxShadow: '0 4px 24px rgba(69,0,132,0.4)',
              }}
            >
              JOIN THE VANGUARD
            </Link>
          </FadeSection>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer style={{ borderTop: `1px solid ${C.outline}33` }} className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          {/* Values bar */}
          <p
            className="text-xs font-bold tracking-[3px] uppercase text-center mb-10 font-[family-name:var(--font-label)]"
            style={{ color: C.gold }}
          >
            Integrity &middot; Excellence &middot; Service &middot; Leadership
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <MdShield size={22} style={{ color: C.primary }} />
              <span className="text-sm font-bold tracking-[3px] uppercase font-[family-name:var(--font-display)]" style={{ color: C.text }}>
                VANGUARD
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['Mission Briefing', 'Privacy Protocol', 'Tactical Support', 'Command Center'].map((l) => (
                <span key={l} className="text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ color: C.textSecondary }}>
                  {l}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-center mt-10" style={{ color: C.outline }}>
            &copy; 2024 Duke Vanguard. All missions secured.
          </p>
        </div>
      </footer>
    </div>
  );
}
