'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, CalendarClock, Link as LinkIcon, 
  FileBarChart, LayoutTemplate, ArrowRight, CheckCircle2,
  ChevronRight, Laptop, Users, BookOpen, GraduationCap
} from 'lucide-react';
import Logo from '@/components/Logo';

const features = [
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'Copy-protection, time-locks, and server-side answer hiding keep your assessments completely tamper-proof.',
  },
  {
    icon: Activity,
    title: 'Real-Time Telemetry',
    desc: 'Live observation dashboards with live ranking, activity charts, and granular per-question insights.',
  },
  {
    icon: CalendarClock,
    title: 'Precision Scheduling',
    desc: 'Set exact start times and strict durations. Exams automatically lock the moment time expires.',
  },
  {
    icon: LinkIcon,
    title: 'Frictionless Access',
    desc: 'Auto-generated short links per exam. Share securely with students without complex onboarding.',
  },
  {
    icon: FileBarChart,
    title: 'Advanced Reporting',
    desc: 'Export comprehensive results as formatted Excel or PDF files, complete with performance charts.',
  },
  {
    icon: LayoutTemplate,
    title: 'White-Label Branding',
    desc: 'Upload your own institute logo, customize headers, and maintain your brand identity on every test.',
  },
];

const steps = [
  { num: '01', title: 'Author', desc: 'Create your assessment with our intuitive question builder.' },
  { num: '02', title: 'Distribute', desc: 'Share the unique encrypted link with your candidates.' },
  { num: '03', title: 'Monitor', desc: 'Watch live as candidates progress through the secure environment.' },
  { num: '04', title: 'Analyze', desc: 'Instantly review automated grading and performance metrics.' },
];

const stats = [
  { label: 'Exams Delivered', value: '10K+', icon: Laptop },
  { label: 'Candidates Assessed', value: '250K+', icon: Users },
  { label: 'Questions Curated', value: '500K+', icon: BookOpen },
  { label: 'Institutes Trusting Us', value: '1.2K+', icon: GraduationCap },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-[#0A0A0B]/80 backdrop-blur-lg border-white/10 shadow-lg' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-xl font-bold tracking-tight text-white">ExamVault</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">Workflow</a>
            <a href="#stats" className="hover:text-white transition-colors">Scale</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/login" className="bg-white text-black hover:bg-slate-200 transition-colors text-sm font-medium py-2.5 px-5 rounded-full flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Next-Generation Assessment Platform
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8">
            Assess with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
              Absolute Precision.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            A meticulously engineered platform for modern educators. Deliver secure, scalable, and insightful examinations without the technical overhead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="bg-violet-600 hover:bg-violet-700 text-white transition-all text-base font-medium px-8 py-4 rounded-full flex items-center gap-2 shadow-lg shadow-violet-600/20">
              Access Workspace <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-base font-medium px-8 py-4 rounded-full flex items-center gap-2">
              Explore Workflow
            </a>
          </div>

          {/* Clean Dashboard Preview */}
          <div className="mt-20 relative max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-[2rem] blur opacity-20" />
            <div className="relative bg-[#111113] border border-white/10 rounded-3xl p-2 shadow-2xl overflow-hidden">
              <div className="bg-[#18181B] rounded-2xl border border-white/5 overflow-hidden">
                {/* Mac OS Style Header */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-[#1A1A1E]">
                  <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  <div className="flex-1 flex justify-center">
                    <div className="h-6 w-64 bg-black/20 rounded-md border border-white/5 flex items-center justify-center">
                      <span className="text-[10px] text-slate-500 font-medium tracking-wide">examvault.app / monitor</span>
                    </div>
                  </div>
                </div>
                {/* Mockup Body */}
                <div className="p-6 md:p-10 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-8 w-48 bg-white/10 rounded-lg mb-2" />
                      <div className="h-4 w-32 bg-white/5 rounded-md" />
                    </div>
                    <div className="h-10 w-24 bg-violet-500/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-violet-400 text-sm font-semibold">LIVE</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                  </div>
                  <div className="h-48 bg-white/5 rounded-xl border border-white/5 mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 bg-[#0A0A0B] relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 md:w-2/3">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Architected for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                Uncompromising Quality.
              </span>
            </h2>
            <p className="text-lg text-slate-400 font-light max-w-2xl">
              We stripped away the noise to build a platform that focuses entirely on reliability, security, and actionable intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {features.map((f, idx) => (
              <div key={idx} className="group relative">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-colors">
                  <f.icon className="w-6 h-6 text-slate-300 group-hover:text-violet-400 transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="how" className="py-32 px-6 border-y border-white/5 bg-[#111113]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Streamlined Workflow</h2>
            <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto">
              From conception to analytics in four seamless phases.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                <div className="p-8 rounded-3xl bg-[#18181B] border border-white/5 h-full hover:border-white/10 transition-colors">
                  <div className="text-sm font-bold text-violet-500 mb-6 font-mono tracking-widest">{s.num}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10 -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-[#0A0A0B] to-[#0A0A0B] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6">
                  <s.icon className="w-8 h-8 text-slate-300" strokeWidth={1} />
                </div>
                <p className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{s.value}</p>
                <p className="text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[3rem] bg-gradient-to-b from-violet-600/20 to-transparent border border-violet-500/20 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-violet-600/30 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Ready to elevate your <br/> assessments?
              </h2>
              <p className="text-xl text-violet-200/70 mb-10 max-w-2xl mx-auto font-light">
                Join elite institutions leveraging ExamVault for secure, scalable examinations.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white text-black hover:bg-slate-200 transition-all text-lg font-medium px-10 py-5 rounded-full">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-bold tracking-tight text-white">ExamVault</span>
          </div>
          <p className="text-slate-500 text-sm font-light">
            © {new Date().getFullYear()} ExamVault Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link href="/login" className="hover:text-white transition-colors">Admin Portal</Link>
            <Link href="/login" className="hover:text-white transition-colors">Educator Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
