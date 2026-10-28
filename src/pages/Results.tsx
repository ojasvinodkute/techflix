import { api, usePoll } from '../api';
import { Brain, fmtTime } from '../ui';

type LB = { visible: false } | { visible: true; rows: { rank: number; name: string; total: number; timeMs: number }[] };

export default function Results() {
  const { data } = usePoll(() => api<LB>('/api/leaderboard'), 3000);
  if (!data) return <p className="text-center text-slate-400">Loading…</p>;
  if (!data.visible) {
    return (
      <div className="card mx-auto max-w-lg space-y-3 text-center">
        <Brain className="mx-auto h-28 w-28 animate-float" />
        <h1 className="neon text-2xl font-black text-white">RESULTS LOCKED</h1>
        <p className="text-slate-400">The organizers will reveal the leaderboard soon. This page updates automatically.</p>
      </div>
    );
  }
  const [w, ...rest] = data.rows;
  const medal = ['text-amber-300', 'text-slate-200', 'text-orange-400'];
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {w && (
        <div className="card animate-pop border-amber-300/60 text-center shadow-[0_0_60px_-10px_rgba(252,211,77,.5)]">
          <div className="text-5xl">👑</div>
          <div className="font-display text-xs tracking-[.4em] text-amber-300">TECHFLIX CHAMPIONS</div>
          <h1 className="neon mt-1 text-4xl font-black text-white">{w.name}</h1>
          <div className="mt-1 font-display text-xl text-sky-300">{w.total} pts · {fmtTime(w.timeMs)}</div>
        </div>
      )}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left">
          <thead className="font-display text-xs uppercase tracking-widest text-violet-300">
            <tr className="border-b border-violet-500/20"><th className="p-3">Rank</th><th className="p-3">Team</th><th className="p-3 text-right">Score</th><th className="p-3 text-right">Time</th></tr>
          </thead>
          <tbody>
            {[w, ...rest].filter(Boolean).map((r) => (
              <tr key={r.rank} className="border-b border-white/5 last:border-0">
                <td className={`p-3 font-display font-black ${medal[r.rank - 1] || 'text-slate-400'}`}>#{r.rank}</td>
                <td className="p-3 font-semibold text-white">{r.name}</td>
                <td className="p-3 text-right font-display text-sky-300">{r.total}</td>
                <td className="p-3 text-right text-slate-400">{fmtTime(r.timeMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
