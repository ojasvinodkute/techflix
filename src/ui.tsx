import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './api';

export function Brain({ className = '' }: { className?: string }) {
  const nodes: [number, number][] = [[44, 40], [70, 30], [96, 42], [34, 66], [66, 58], [98, 66], [50, 88], [84, 86]];
  const links = [[0, 1], [1, 2], [0, 4], [2, 4], [3, 4], [4, 5], [4, 6], [4, 7], [3, 0], [5, 2]];
  return (
    <svg viewBox="0 0 136 120" className={`brain-glow ${className}`} fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a855f7" /><stop offset="1" stopColor="#38bdf8" /></linearGradient>
      </defs>
      <path d="M60 20C40 10 15 25 20 50C5 60 10 85 30 88C35 105 60 108 68 95C76 108 101 105 106 88C126 85 131 60 116 50C121 25 96 10 76 20C72 14 64 14 60 20Z" stroke="url(#bg)" strokeWidth="2.5" fill="rgba(139,92,246,.1)" />
      <path d="M68 22V96M36 44C46 40 50 52 42 58M100 44C90 40 86 52 94 58M40 78C52 72 58 84 66 80M96 78C84 72 78 84 70 80" stroke="url(#bg)" strokeWidth="1.5" opacity=".55" />
      {links.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#38bdf8" strokeWidth="1" opacity=".45" />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" fill="#e9d5ff" className="animate-glow" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const team = getToken('team');
  const link = (to: string, label: string) => (
    <Link to={to} className={`rounded-lg px-3 py-1.5 font-display text-xs uppercase tracking-widest transition hover:text-sky-300 ${loc.pathname === to ? 'text-sky-300' : 'text-slate-300'}`}>{label}</Link>
  );
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.28),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(14,165,233,.2),transparent_45%)]" />
        <div className="grid-bg absolute inset-0" />
      </div>
      <header className="sticky top-0 z-20 border-b border-violet-500/20 bg-[#06040d]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8" />
            <span className="neon font-display text-lg font-black tracking-[.2em] text-white">TECHFLIX</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {link('/', 'Home')}
            {link('/results', 'Results')}
            {team ? (
              <>
                {link('/play', 'Dashboard')}
                <button className="px-3 py-1.5 font-display text-xs uppercase tracking-widest text-slate-400 hover:text-rose-300" onClick={() => { clearToken('team'); nav('/'); }}>Logout</button>
              </>
            ) : (
              <>{link('/register', 'Register')}{link('/login', 'Login')}</>
            )}
            {link('/admin', 'Organizer')}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

const STATUS: Record<string, string> = {
  locked: 'border-slate-600 text-slate-400',
  live: 'border-emerald-400 text-emerald-300 shadow-[0_0_14px_-2px_rgba(52,211,153,.8)] animate-glow',
  paused: 'border-amber-400 text-amber-300',
  ended: 'border-violet-400 text-violet-300',
};
export const StatusChip = ({ status }: { status: string }) => <span className={`chip ${STATUS[status] || STATUS.locked}`}>{status}</span>;

export function Field({ label, hint, ...p }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-xs uppercase tracking-widest text-violet-300">{label}</span>
      <input className="input" {...p} />
      {hint && <span className="mt-1 block text-sm text-slate-500">{hint}</span>}
    </label>
  );
}

export const ErrorBox = ({ msg }: { msg: string }) => msg ? <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-rose-200">{msg}</div> : null;
export const fmtTime = (ms: number) => (ms / 1000).toFixed(1) + 's';
