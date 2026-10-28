import { useCallback, useEffect, useRef, useState } from 'react';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}
export type Role = 'team' | 'admin';
const k = (r: Role) => 'tf_' + r;
export const getToken = (r: Role) => { try { return localStorage.getItem(k(r)); } catch { return null; } };
export const setToken = (r: Role, t: string) => { try { localStorage.setItem(k(r), t); } catch { /* private mode */ } };
export const clearToken = (r: Role) => { try { localStorage.removeItem(k(r)); } catch { /* ignore */ } };

export async function api<T>(path: string, opts: { method?: string; body?: unknown; role?: Role } = {}): Promise<T> {
  const token = opts.role ? getToken(opts.role) : null;
  let res: Response;
  try {
    res = await fetch(path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch { throw new ApiError('Cannot reach the server. Check your connection.', 0); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && opts.role) clearToken(opts.role);
    throw new ApiError(data.error || 'Something went wrong.', res.status);
  }
  return data as T;
}

/** Poll an async function every `ms` (also runs immediately). */
export function usePoll<T>(fn: () => Promise<T>, ms: number, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async () => {
    try { setData(await fnRef.current()); setErr(null); } catch (e) { setErr(e as ApiError); }
  }, []);
  useEffect(() => {
    run();
    const id = setInterval(run, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, run, ...deps]);
  return { data, err, reload: run };
}

export type RoundInfo = { n: number; name: string; tagline: string; count: number; status: 'locked' | 'live' | 'paused' | 'ended' };
export type PublicState = { serverNow: number; activeRound: number | null; leaderboardVisible: boolean; rounds: RoundInfo[] };
export type RoundProgress = { status: string; score: number; answered: number; total: number } | null;
export type Me = {
  team: { id: string; name: string; leader: string; email: string; members: string[] };
  total: number; rounds: Record<number, RoundProgress>; state: PublicState;
};
export type AdminTeam = {
  id: string; name: string; leader: string; email: string; members: string[]; createdAt: number;
  rounds: Record<number, RoundProgress>; total: number; timeMs: number; rank: number;
};
export type Overview = { state: PublicState; teams: AdminTeam[]; inProgress: Record<number, number> };
export type Current = {
  serverNow: number; round: number; name: string; roundStatus: RoundInfo['status']; active: boolean;
  attempt: 'none' | 'inprogress' | 'done'; score?: number; answered?: number; total?: number; index?: number;
  phase?: 'ready' | 'memorize' | 'answer'; phaseEndsAt?: number; phaseMs?: number;
  memorize?: { title: string; lines: string[] };
  question?: { id: string; text: string; code: string | null; options: string[] };
};
export type AnswerRes = { correct: boolean; timedOut: boolean; correctIndex: number; score: number; done: boolean };
