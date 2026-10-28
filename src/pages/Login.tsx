import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../api';
import { ErrorBox, Field } from '../ui';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await api<{ token: string }>('/api/login', { method: 'POST', body: { email, accessCode: code } });
      setToken('team', r.token);
      nav('/play');
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4">
      <h1 className="neon text-2xl font-black text-white">TEAM LOGIN</h1>
      <ErrorBox msg={err} />
      <Field label="Leader email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Access code" required maxLength={12} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input font-mono tracking-[.3em]" />
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Checking…' : 'Enter the arena'}</button>
      <p className="text-center text-slate-400">No team yet? <Link to="/register" className="text-sky-300 underline">Register</Link></p>
    </form>
  );
}
