import { Link } from 'react-router-dom';
import { api, PublicState, usePoll } from '../api';
import { Brain, StatusChip } from '../ui';

const RULES = [
  'Register your team once and save the Team ID + Access Code you get — that is your login.',
  'Three rounds, unlocked one at a time by the organizers. Stay on your dashboard.',
  'Every question has a 30-second timer. No answer = no points.',
  'Memory questions show a pattern for 5 seconds, then hide it forever. Look sharp.',
  '10 points per correct answer. One submission per question — no take-backs.',
  'Ties are broken by total answering time. Scores are calculated on the server.',
];

export default function Home() {
  const { data: st } = usePoll(() => api<PublicState>('/api/state'), 4000);
  const live = st?.rounds.find((r) => r.status === 'live' || r.status === 'paused');
  return (
    <div className="space-y-12">
      <section className="flex flex-col items-center gap-5 pt-4 text-center">
        <Brain className="h-40 w-40 animate-float" />
        <h1 className="neon text-5xl font-black tracking-[.18em] text-white sm:text-7xl">TECHFLIX</h1>
        <p className="font-display text-sm uppercase tracking-[.35em] text-sky-300 sm:text-lg">Inside Out : Debug the Mind</p>
        <p className="max-w-xl text-slate-300">A three-round coding showdown of memory, logic and nerve. Remember it. Trace it. Beat the clock.</p>
        {live && (
          <div className="flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-400/5 px-4 py-1.5">
            <StatusChip status={live.status} /> <span className="font-display text-sm tracking-wider">ROUND {live.n} · {live.name}</span>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn btn-primary">Register team</Link>
          <Link to="/login" className="btn btn-ghost">Team login</Link>
          <Link to="/results" className="btn btn-ghost">Results</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {(st?.rounds || [
          { n: 1, name: 'Memory Protocol', tagline: 'Lock it in. Recall it under pressure.', count: 3, status: 'locked' },
          { n: 2, name: 'Logic Lab', tagline: 'Trace the code. Beat the clock.', count: 5, status: 'locked' },
          { n: 3, name: 'Core Memory', tagline: 'Remember it, then reason with it.', count: 5, status: 'locked' },
        ] as const).map((r) => (
          <div key={r.n} className="card">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-xs tracking-widest text-violet-300">ROUND 0{r.n}</span>
              <StatusChip status={r.status} />
            </div>
            <h3 className="text-xl font-bold text-white">{r.name}</h3>
            <p className="mt-1 text-slate-400">{r.tagline}</p>
            <p className="mt-3 font-display text-xs tracking-widest text-sky-300">{r.count} QUESTIONS · 30s EACH</p>
          </div>
        ))}
      </section>

      <section className="card mx-auto max-w-3xl">
        <h2 className="mb-4 text-xl font-bold tracking-widest text-white">RULES OF THE GAME</h2>
        <ol className="space-y-2">
          {RULES.map((r, i) => (
            <li key={i} className="flex gap-3"><span className="font-display text-sky-400">{String(i + 1).padStart(2, '0')}</span><span>{r}</span></li>
          ))}
        </ol>
      </section>
    </div>
  );
}
