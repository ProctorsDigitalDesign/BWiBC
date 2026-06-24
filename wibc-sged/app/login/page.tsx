'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('from') || '/';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      // On success, redirect to the requested page
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 73px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url("/background-waitlist.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Card */}
      <div className="card" style={{
        maxWidth: '420px', width: '100%',
        padding: '2.75rem 2.5rem',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        transform: 'translateY(-10%)',
      }}>
        {/* Icon */}
        <div style={{
          display: 'inline-flex', padding: '1.1rem', borderRadius: '50%',
          background: 'var(--color-primary-alpha)', color: 'var(--color-primary)',
          marginBottom: '1.5rem',
        }}>
          <Lock size={36} strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.1rem', marginBottom: '0.5rem', color: '#000',
        }}>
          Access Required
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          This tool is for authorised users only. Please enter the access password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Error banner */}
          {error && (
            <div className="error-banner" style={{
              marginBottom: '1.25rem', borderRadius: 'var(--radius-sm)',
              justifyContent: 'center', gap: '0.5rem',
            }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          {/* Password input */}
          <div className="form-group" style={{ textAlign: 'left', position: 'relative' }}>
            <label htmlFor="tool-password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="tool-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{
                  paddingRight: '3rem',
                  fontSize: '1rem',
                  letterSpacing: !showPassword && password.length > 0 ? '0.2em' : 'normal',
                  background: 'var(--color-surface-2)',
                  border: error ? '1px solid var(--color-error)' : '1px solid var(--color-border)',
                  transition: 'border-color 0.2s',
                }}
                placeholder="Enter access password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '1rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                  padding: 0, transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !password}
            style={{
              width: '100%', padding: '0.9rem 1.5rem',
              fontSize: '1rem', marginTop: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              borderRadius: 'var(--radius-md)',
              opacity: !password ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
            ) : (
              <>Access Tool</>
            )}
          </button>
        </form>

        <p style={{ marginTop: '1.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
          Don&apos;t have access? Please contact the Charter to request access, or{' '}
          <a
            href="/waitlist"
            style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            join the waitlist
          </a>
          .
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
