import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ErrorBox, Field } from '../ui';

export default function Register() {
  const [f, setF] = useState({ teamName: '', leaderName: '', email: '' });
  const [members, setMembers] = useState(['', '', '']);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ teamId: string; teamName: string; accessCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { setDone(await api('/api/register', { method: 'POST', body: { ...f, members: members.filter((m) => m.trim()) } })); }
    catch (x) { setErr((x as Error).message); }
    setBusy(false);
  }

  if (done) {
    const text = `TECHFLIX login\nTeam: ${done.teamName}\nTeam ID: ${done.teamId}\nAccess code: ${done.accessCode}`;
    return (
      <div className="card mx-auto max-w-xl animate-pop space-y-4 text-center">
        <h1 className="neon text-2xl font-black text-emerald-300">TEAM REGISTERED ✔</h1>
        <p>Welcome, <b className="text-white">{done.teamName}</b>. Save these — the access code is shown only once.</p>
        <div className="rounded-xl border border-sky-400/40 bg-black/50 p-4 font-mono">
          <div className="text-slate-400">TEAM ID</div><div className="text-2xl text-sky-300">{done.teamId}</div>
          <div className="mt-3 text-slate-400">ACCESS CODE</div><div className="text-3xl tracking-[.3em] text-violet-300">{done.accessCode}</div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn btn-ghost" onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); } catch { /* ignore */ } }}>{copied ? 'Copied ✔' : 'Copy details'}</button>
          <Link to="/login" className="btn btn-primary">Go to login</Link>
        </div>
        <p className="text-sm text-slate-500">Log in with your registered email + this access code.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl space-y-4">
      <h1 className="neon text-2xl font-black text-white">REGISTER YOUR TEAM</h1>
      <ErrorBox msg={err} />
      <Field label="Team name" required minLength={2} maxLength={40} value={f.teamName} onChange={(e) => setF({ ...f, teamName: e.target.value })} placeholder="e.g. Null Pointers" />
      <Field label="Leader name" required minLength={2} maxLength={60} value={f.leaderName} onChange={(e) => setF({ ...f, leaderName: e.target.value })} />
      <Field label="Leader email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} hint="Used to log in. One team per email." />
      <div className="space-y-2">
        <span className="block font-display text-xs uppercase tracking-widest text-violet-300">Other members (optional)</span>
        {members.map((m, i) => (
          <input key={i} className="input" maxLength={60} placeholder={`Member ${i + 2}`} value={m} onChange={(e) => setMembers(members.map((x, j) => (j === i ? e.target.value : x)))} />
        ))}
      </div>
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Registering…' : 'Register team'}</button>
      <p className="text-center text-slate-400">Already registered? <Link to="/login" className="text-sky-300 underline">Log in</Link></p>
    </form>
  );
}
