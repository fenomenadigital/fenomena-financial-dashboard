'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', background:'rgba(61,0,136,0.4)', filter:'blur(80px)', top:-150, right:-100, pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:350, height:350, borderRadius:'50%', background:'rgba(45,0,102,0.3)', filter:'blur(70px)', bottom:50, left:-80, pointerEvents:'none' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(34,0,80,0.7)',
        border: '1px solid var(--border-strong)',
        borderRadius: 24, padding: '48px 44px',
        width: '100%', maxWidth: 420,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom: 32 }}>
          <Image src="/logo.png" alt="Fenomena Digital" width={180} height={40}
            style={{ filter: 'brightness(0) invert(1)', objectFit:'contain' }} />
        </div>

        <div style={{ textAlign:'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color:'var(--text-primary)', marginBottom: 6 }}>
            Financial Dashboard
          </h1>
          <p style={{ fontSize: 13, color:'var(--text-secondary)' }}>
            Sign in to access internal financials
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap: 16 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@fenomenadigital.com"
              style={{
                width:'100%', padding:'12px 16px', borderRadius: 10,
                background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)',
                color:'var(--text-primary)', fontSize:14, outline:'none',
                transition:'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor='var(--border-strong)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width:'100%', padding:'12px 16px', borderRadius: 10,
                background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)',
                color:'var(--text-primary)', fontSize:14, outline:'none',
                transition:'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor='var(--border-strong)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          {error && (
            <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(255,77,109,0.12)', border:'1px solid rgba(255,77,109,0.3)', color:'var(--red)', fontSize:13 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 8, padding:'13px 24px', borderRadius:10, border:'none',
              background: loading ? 'rgba(107,33,200,0.5)' : 'linear-gradient(135deg, var(--brand-purple-mid), var(--brand-purple-light))',
              color:'white', fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing:'0.03em', transition:'opacity 0.2s',
              boxShadow: '0 4px 20px rgba(107,33,200,0.4)'
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:28, fontSize:11, color:'var(--text-muted)' }}>
          A real click · Fenomena Digital © 2026
        </p>
      </div>
    </div>
  )
}
