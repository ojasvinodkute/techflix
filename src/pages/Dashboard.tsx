import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Me, usePoll } from '../api';
import { ErrorBox, StatusChip } from '../ui';

export default function Dashboard() {
  const nav = useNavigate();
  const { data, err } = usePoll(() => api<Me>('/api/me', { role: 'team' }), 2000);
  useEffect(() => { if (err?.status === 401) nav('/login', { replace: true }); }, [err, nav]);
  if (!data) return <p className="text-center text-slate-400">{err ? <ErrorBox msg={err.message} /> : 'Loading your team…'}</p>;
  const { team, rounds, state, total } = data;
  const maxTotal = state.rounds.reduce((s, r) => s + r.count * 10, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-2">
          <div className="font-display text-xs tracking-widest text-violet-300">YOUR TEAM</div>
          <h1 className="neon mt-1 text-3xl font-black text-white">{team.name}</h1>
          <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <div><span className="text-slate-500">Team ID </span><span className="font-mono text-sky-300">{team.id}</span></div>
            <div><span className="text-slate-500">Leader </span>{team.leader}</div>
            <div className="sm:col-span-2"><span className="text-slate-500">Email </span>{team.email}</div>
            {team.members.length > 0 && <div className="sm:col-span-2"><span className="text-slate-500">Members </span>{team.members.join(', ')}</div>}
          </div>
        </div>
        <div className="card flex flex-col items-center justify-center text-center">
          <div className="font-display text-xs tracking-widest text-violet-300">TOTAL SCORE</div>
          <div className="neon font-display text-6xl font-black text-white">{total}</div>
          <div className="text-slate-500">of {maxTotal}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {state.rounds.map((r) => {
          const p = rounds[r.n];
          const isActive = state.activeRound === r.n;
          const canPlay = isActive && (r.status === 'live' || r.status === 'paused') && p?.status !== 'done';
          return (
            <div key={r.n} className={`card ${isActive ? 'border-sky-400/70' : ''}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-xs tracking-widest text-violet-300">ROUND 0{r.n}{isActive ? ' · ACTIVE' : ''}</span>
                <StatusChip status={r.status} />
              </div>
              <h3 className="text-xl font-bold text-white">{r.name}</h3>
              <div className="my-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all" style={{ width: `${p ? (p.answered / p.total) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{p ? `${p.answered}/${p.total} answered` : 'Not started'}</span>
                <span className="font-display text-sky-300">{p ? p.score : 0} pts</span>
              </div>
              <div className="mt-4">
                {canPlay ? (
                  <Link to={`/play/${r.n}`} className="btn btn-primary w-full">{p ? 'Resume round' : 'Enter round'}</Link>
                ) : p?.status === 'done' ? (
                  <div className="text-center font-display text-sm text-emerald-300">ROUND COMPLETE ✔</div>
                ) : (
                  <div className="text-center font-display text-xs tracking-widest text-slate-500">{r.status === 'ended' ? 'ROUND ENDED' : 'WAITING FOR ORGANIZERS'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {state.leaderboardVisible && <div className="text-center"><Link to="/results" className="btn btn-ghost">🏆 Leaderboard is live</Link></div>}
    </div>
  );
}
