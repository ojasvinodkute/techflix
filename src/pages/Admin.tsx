import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api, AdminTeam, clearToken, getToken, Overview, setToken, usePoll } from '../api';
import { Brain, ErrorBox, Field, fmtTime, StatusChip } from '../ui';

function AdminLogin({ onDone }: { onDone: () => void }) {
  const [u, setU] = useState('admin');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr('');
    try { const r = await api<{ token: string }>('/api/admin/login', { method: 'POST', body: { username: u, password: p } }); setToken('admin', r.token); onDone(); }
    catch (x) { setErr((x as Error).message); }
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4">
      <Brain className="mx-auto h-16 w-16" />
      <h1 className="neon text-center text-2xl font-black text-white">ORGANIZER ACCESS</h1>
      <ErrorBox msg={err} />
      <Field label="Username" required value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
      <Field label="Password" type="password" required value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
      <button className="btn btn-primary w-full">Unlock console</button>
    </form>
  );
}

function Console({ onLogout }: { onLogout: () => void }) {
  const { data, err, reload } = usePoll(() => api<Overview>('/api/admin/overview', { role: 'admin' }), 2000);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState('');
  useEffect(() => { if (err?.status === 401) onLogout(); }, [err, onLogout]);

  const teams = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data?.teams || []).filter((t) => !s || [t.name, t.leader, t.email, t.id, ...t.members].some((x) => x.toLowerCase().includes(s)));
  }, [data, q]);

  async function run(fn: () => Promise<unknown>) {
    setMsg('');
    try { await fn(); await reload(); } catch (e) { setMsg((e as Error).message); }
  }
  const act = (action: string, round: number) => run(() => api('/api/admin/round', { method: 'POST', role: 'admin', body: { action, round } }));

  async function exportCsv() {
    try {
      const res = await fetch('/api/admin/export.csv', { headers: { Authorization: 'Bearer ' + getToken('admin') } });
      if (!res.ok) throw new Error('Export failed');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = 'techflix-results.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setMsg((e as Error).message); }
  }

  if (!data) return <p className="text-center text-slate-400">{err ? <ErrorBox msg={err.message} /> : 'Loading console…'}</p>;
  const { state, inProgress } = data;
  const cell = (t: AdminTeam, n: number) => {
    const p = t.rounds[n];
    return p ? <span><b className="text-sky-300">{p.score}</b> <span className="text-slate-500">· {p.answered}/{p.total}{p.status === 'inprogress' ? ' ▶' : ''}</span></span> : <span className="text-slate-600">—</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-xs tracking-[.3em] text-violet-300">CORE COMMITTEE</div>
          <h1 className="neon text-3xl font-black text-white">ORGANIZER CONSOLE</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="card px-4 py-1.5 text-center"><span className="font-display text-xs text-slate-400">TEAMS </span><span className="font-display text-xl font-black text-sky-300">{data.teams.length}</span></div>
          <button className="btn btn-ghost" onClick={exportCsv}>⬇ Export CSV</button>
          <button className={`btn ${state.leaderboardVisible ? 'btn-primary' : 'btn-ghost'}`} onClick={() => run(() => api('/api/admin/leaderboard', { method: 'POST', role: 'admin', body: { visible: !state.leaderboardVisible } }))}>
            🏆 Leaderboard: {state.leaderboardVisible ? 'VISIBLE' : 'HIDDEN'}
          </button>
          <button className="btn btn-danger" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <ErrorBox msg={msg} />

      <div className="grid gap-4 md:grid-cols-3">
        {state.rounds.map((r) => {
          const active = state.activeRound === r.n;
          return (
            <div key={r.n} className={`card space-y-3 ${active ? 'border-sky-400/80' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-display text-xs tracking-widest text-violet-300">ROUND 0{r.n}{active ? ' · ACTIVE' : ''}</span>
                <StatusChip status={r.status} />
              </div>
              <h3 className="text-lg font-bold text-white">{r.name}</h3>
              <div className="text-slate-400">{inProgress[r.n] || 0} team(s) playing now</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-ghost" disabled={active} onClick={() => act('select', r.n)}>{active ? 'Selected' : 'Select'}</button>
                <button className="btn btn-primary" disabled={!active || !['locked', 'ended'].includes(r.status)} onClick={() => act('start', r.n)}>{r.status === 'ended' ? 'Reopen' : 'Start'}</button>
                <button className="btn btn-ghost" disabled={r.status !== 'live'} onClick={() => act('pause', r.n)}>Pause</button>
                <button className="btn btn-ghost" disabled={r.status !== 'paused'} onClick={() => act('resume', r.n)}>Resume</button>
                <button className="btn btn-danger col-span-2" disabled={!['live', 'paused'].includes(r.status)} onClick={() => window.confirm(`End Round ${r.n}? Unanswered questions score 0.`) && act('end', r.n)}>End round</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card space-y-3 p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-0">
          <h2 className="text-lg font-bold tracking-widest text-white">TEAMS &amp; SCORES <span className="text-sm text-slate-500">(live)</span></h2>
          <input className="input max-w-xs" placeholder="Search team, leader, email, ID…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="font-display text-xs uppercase tracking-widest text-violet-300">
              <tr className="border-b border-violet-500/20"><th className="p-3">#</th><th className="p-3">Team</th><th className="p-3">R1</th><th className="p-3">R2</th><th className="p-3">R3</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Time</th></tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <FragmentRow key={t.id} t={t} open={open === t.id} toggle={() => setOpen(open === t.id ? null : t.id)} cell={cell} />
              ))}
              {teams.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">{data.teams.length ? 'No team matches your search.' : 'No teams registered yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="px-4 pb-3 text-sm text-slate-500">Cell format: score · answered/total (▶ = playing). Tie-break: lower total answering time. Click a row for details.</p>
      </div>

      <details className="card">
        <summary className="cursor-pointer font-display text-sm tracking-widest text-rose-300">DANGER ZONE</summary>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-slate-400">Wipe ALL teams and scores (use after test runs). Type RESET:</span>
          <input className="input max-w-[10rem]" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className="btn btn-danger" disabled={confirm !== 'RESET'} onClick={() => run(async () => { await api('/api/admin/reset', { method: 'POST', role: 'admin', body: { confirm } }); setConfirm(''); })}>Reset everything</button>
        </div>
      </details>
    </div>
  );
}

function FragmentRow({ t, open, toggle, cell }: { t: AdminTeam; open: boolean; toggle: () => void; cell: (t: AdminTeam, n: number) => JSX.Element }) {
  return (
    <>
      <tr onClick={toggle} className="cursor-pointer border-b border-white/5 hover:bg-violet-500/5">
        <td className="p-3 font-display font-black text-violet-300">{t.rank}</td>
        <td className="p-3"><div className="font-semibold text-white">{t.name}</div><div className="font-mono text-xs text-slate-500">{t.id}</div></td>
        <td className="p-3">{cell(t, 1)}</td><td className="p-3">{cell(t, 2)}</td><td className="p-3">{cell(t, 3)}</td>
        <td className="p-3 text-right font-display text-xl font-black text-sky-300">{t.total}</td>
        <td className="p-3 text-right text-slate-400">{fmtTime(t.timeMs)}</td>
      </tr>
      {open && (
        <tr className="border-b border-white/5 bg-black/30"><td colSpan={7} className="p-3 text-slate-300">
          <b className="text-slate-500">Leader:</b> {t.leader} · <b className="text-slate-500">Email:</b> {t.email}
          {t.members.length > 0 && <> · <b className="text-slate-500">Members:</b> {t.members.join(', ')}</>} · <b className="text-slate-500">Registered:</b> {new Date(t.createdAt).toLocaleString()}
        </td></tr>
      )}
    </>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(!!getToken('admin'));
  const logout = () => { clearToken('admin'); setAuthed(false); };
  return authed ? <Console onLogout={logout} /> : <AdminLogin onDone={() => setAuthed(true)} />;
}
