'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-[#151317] text-[#e7e1e6] min-h-screen selection:bg-[#450084] selection:text-[#d9b9ff]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Material Symbols font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .kinetic-grid {
          background-image: radial-gradient(circle at 2px 2px, rgba(217, 185, 255, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .glass-card {
          background: rgba(69, 0, 132, 0.1);
          backdrop-filter: blur(20px);
        }
        .glow-shadow-gold {
          box-shadow: 0 0 30px rgba(219, 197, 133, 0.15);
        }
        .glow-shadow-purple {
          box-shadow: 0 0 50px rgba(69, 0, 132, 0.3);
        }
      `}</style>

      {/* Header */}
      <header className="bg-[#151317]/60 backdrop-blur-2xl fixed top-0 w-full z-50 shadow-xl shadow-purple-900/20">
        <nav className="flex justify-between items-center w-full px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d9b9ff] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span className="text-2xl font-black text-[#d9b9ff] tracking-tighter italic uppercase" style={{ fontFamily: 'Public Sans, sans-serif' }}>VANGUARD</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="font-black uppercase tracking-tighter text-[#dbc585] border-b-2 border-[#dbc585] pb-1 transition-all duration-300" href="#mission" style={{ fontFamily: 'Public Sans, sans-serif' }}>Mission</a>
            <a className="font-black uppercase tracking-tighter text-[#968d9d] hover:text-[#dbc585] hover:bg-white/5 transition-all duration-300 pb-1" href="#features" style={{ fontFamily: 'Public Sans, sans-serif' }}>Academy</a>
            <a className="font-black uppercase tracking-tighter text-[#968d9d] hover:text-[#dbc585] hover:bg-white/5 transition-all duration-300 pb-1" href="#cta" style={{ fontFamily: 'Public Sans, sans-serif' }}>Tactical</a>
          </div>
          <Link href="/auth" className="bg-[#450084] text-[#d9b9ff] px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest active:scale-95 duration-200 hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Login
          </Link>
        </nav>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section id="mission" className="relative min-h-[795px] flex items-center justify-center overflow-hidden kinetic-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#151317]/50 to-[#151317] z-10"></div>
          <div className="container mx-auto px-8 relative z-20 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#2c292d] px-4 py-1 rounded-full border border-[#4b4452]/20">
                <span className="w-2 h-2 rounded-full bg-[#dbc585] animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#dbc585]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Operational Status: Combat Ready</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                MAXIMIZE <br />
                <span className="text-[#dbc585] italic">YOUR OML</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#cdc3d4] max-w-xl font-light leading-relaxed">
                The elite-tier performance tracker and AI mentor for <span className="text-[#d9b9ff] font-bold">JMU ROTC</span> Cadets. Command your career path with data-driven precision.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/auth" className="bg-gradient-to-br from-[#450084] to-[#343c0a] text-[#b27ff5] px-10 py-5 rounded-sm font-black text-lg uppercase tracking-tighter hover:scale-105 transition-transform duration-300 glow-shadow-purple active:scale-95" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  START MISSION BRIEFING
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="absolute w-[500px] h-[500px] bg-[#d9b9ff]/10 rounded-full blur-[120px] animate-pulse"></div>
              <div className="relative z-10 p-12 glass-card rounded-full border border-[#d9b9ff]/20 glow-shadow-purple">
                <span className="material-symbols-outlined text-[200px] text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1", fontWeight: 100 }}>shield_with_heart</span>
                <div className="absolute top-0 right-0 p-4 border-t-2 border-r-2 border-[#dbc585]/50 w-12 h-12"></div>
                <div className="absolute bottom-0 left-0 p-4 border-b-2 border-l-2 border-[#dbc585]/50 w-12 h-12"></div>
              </div>
              <div className="absolute bottom-10 right-0 glass-card p-6 rounded-xl border border-[#dbc585]/20 glow-shadow-gold translate-x-12 translate-y-12">
                <div className="text-[#dbc585] text-[10px] tracking-[0.3em] uppercase mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Current Readiness</div>
                <div className="text-3xl font-black text-[#e7e1e6]" style={{ fontFamily: 'Public Sans, sans-serif' }}>98.4%</div>
                <div className="w-full bg-[#373438] h-1 mt-2">
                  <div className="bg-[#dbc585] h-full w-[98%]" style={{ boxShadow: '0 0 10px #dbc585' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-[#1d1b1f] relative">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-xs uppercase tracking-[0.5em] text-[#968d9d] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>TRUSTED BY JMU CADETS ACROSS THE BATTALION</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="space-y-2 group">
                <div className="text-5xl md:text-6xl font-black text-[#f8e19e] group-hover:scale-110 transition-transform" style={{ fontFamily: 'Public Sans, sans-serif' }}>800+</div>
                <div className="text-sm uppercase tracking-widest text-[#cdc3d4]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>OML Points Average</div>
              </div>
              <div className="space-y-2 group">
                <div className="text-5xl md:text-6xl font-black text-[#d9b9ff] group-hover:scale-110 transition-transform" style={{ fontFamily: 'Public Sans, sans-serif' }}>100%</div>
                <div className="text-sm uppercase tracking-widest text-[#cdc3d4]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Canvas Sync</div>
              </div>
              <div className="space-y-2 group">
                <div className="text-5xl md:text-6xl font-black text-[#c3cc8c] group-hover:scale-110 transition-transform" style={{ fontFamily: 'Public Sans, sans-serif' }}>Top 10%</div>
                <div className="text-sm uppercase tracking-widest text-[#cdc3d4]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>National Rank</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-[#151317] overflow-hidden">
          <div className="container mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div className="max-w-2xl">
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#e7e1e6] leading-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  TACTICAL <span className="text-[#dbc585]">ADVANTAGE</span> THROUGH SUPERIOR DATA
                </h3>
              </div>
              <div className="text-xs text-[#968d9d] text-right uppercase tracking-widest" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                System Module: 04-B / Vanguard Core
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 - AI Mentor */}
              <div className="glass-card p-10 rounded-xl relative overflow-hidden group hover:bg-[#450084]/20 transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#450084] flex items-center justify-center mb-8 border border-[#d9b9ff]/30">
                    <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-[#eedcff] mb-4" style={{ fontFamily: 'Public Sans, sans-serif' }}>Strategic AI Mentor</h4>
                  <p className="text-[#cdc3d4] leading-relaxed">
                    Real-time tactical advice engineered to analyze your current standing and provide actionable maneuvers to boost your national ranking.
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-[#4b4452]/10">
                  <span className="text-xs uppercase tracking-widest text-[#dbc585] flex items-center gap-2 group-hover:gap-4 transition-all cursor-pointer" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Protocol Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>

              {/* Feature 2 - Canvas */}
              <div className="glass-card p-10 rounded-xl relative overflow-hidden group hover:bg-[#544511]/20 transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#544511] flex items-center justify-center mb-8 border border-[#dbc585]/30">
                    <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_sync</span>
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-[#f8e19e] mb-4" style={{ fontFamily: 'Public Sans, sans-serif' }}>Canvas LMS Integration</h4>
                  <p className="text-[#cdc3d4] leading-relaxed">
                    Seamless automated grade tracking directly from JMU&apos;s systems for high-precision OML projections without manual data entry.
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-[#4b4452]/10">
                  <span className="text-xs uppercase tracking-widest text-[#dbc585] flex items-center gap-2 group-hover:gap-4 transition-all cursor-pointer" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Protocol Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>

              {/* Feature 3 - AFT */}
              <div className="glass-card p-10 rounded-xl relative overflow-hidden group hover:bg-[#2c3303]/20 transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-[#2c3303] flex items-center justify-center mb-8 border border-[#c3cc8c]/30">
                    <span className="material-symbols-outlined text-[#c3cc8c]" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-[#dfe8a6] mb-4" style={{ fontFamily: 'Public Sans, sans-serif' }}>AFT Performance Log</h4>
                  <p className="text-[#cdc3d4] leading-relaxed">
                    Track every rep and mile with historic trajectory analysis. Visualize your growth from MS1 to Commissioning.
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-[#4b4452]/10">
                  <span className="text-xs uppercase tracking-widest text-[#dbc585] flex items-center gap-2 group-hover:gap-4 transition-all cursor-pointer" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Protocol Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="cta" className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Military training"
              className="w-full h-full object-cover opacity-10 grayscale mix-blend-luminosity"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnjrC3WFhs_BqduJLJoRxG99Kfxy5qCna5H37Vu02G5kA0nXCsrRCReYdMe9KBOuTljuVxwUCFqoGqbbjAGDcJvSbyUHIRcpuYWF3PO5iiEksfi5xgtS4bsanubwkgP3p0WV_VjzMlo9AVERYAVxAQEH-7wtMNwo5GpCgWNi0qhd91Y5sGQhg56WNQ3r9Vlf4-ISHiuVxBVtzIIDusjmQPEavLQRjOFFpxwRVYl2d_vaB8kJ6jVpcNTO5RAK2omEODkdz2-GS6yAMb"
            />
          </div>
          <div className="container mx-auto px-8 relative z-10 text-center space-y-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-6" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                READY TO <span className="text-[#d9b9ff] italic">LEAD?</span>
              </h2>
              <p className="text-xl text-[#cdc3d4] uppercase tracking-[0.2em] mb-12">
                The mission starts now. Join the ranks of the high-performers.
              </p>
              <Link href="/auth" className="inline-block bg-[#d9b9ff] text-[#460185] px-12 py-6 rounded-sm font-black text-xl uppercase tracking-tighter hover:bg-[#dbc585] hover:text-[#3c2f00] transition-all duration-300 shadow-2xl shadow-[#d9b9ff]/20 active:scale-95" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                JOIN THE VANGUARD
              </Link>
            </div>
            <div className="pt-20">
              <div className="flex flex-wrap justify-center gap-12 opacity-30">
                <span className="text-xs uppercase tracking-[0.5em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Integrity</span>
                <span className="text-xs uppercase tracking-[0.5em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Excellence</span>
                <span className="text-xs uppercase tracking-[0.5em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Service</span>
                <span className="text-xs uppercase tracking-[0.5em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Leadership</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1d1b1f] w-full py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d9b9ff] text-xl">shield</span>
            <span className="text-[#d9b9ff] font-bold uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>VANGUARD</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-[10px] uppercase tracking-widest text-[#968d9d] hover:text-white transition-colors" href="#" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Mission Briefing</a>
            <a className="text-[10px] uppercase tracking-widest text-[#968d9d] hover:text-white transition-colors" href="#" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Privacy Protocol</a>
            <a className="text-[10px] uppercase tracking-widest text-[#968d9d] hover:text-white transition-colors" href="#" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Tactical Support</a>
            <a className="text-[10px] uppercase tracking-widest text-[#968d9d] hover:text-white transition-colors" href="#" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Command Center</a>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#dbc585]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            © 2024 JMU ROTC COMMAND. ALL MISSIONS SECURED.
          </div>
        </div>
      </footer>
    </div>
  );
}
