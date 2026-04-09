'use client'
import { useState } from 'react'
import Image from 'next/image'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { annual, clients, serviceMix, serviceByClient, segments, MONTHS, YTD_CUTOFF } from '@/lib/data'

// ── Brand colours ─────────────────────────────
const C = {
  p1: '#B06DFF', p2: '#6B21C8', p3: '#3D0088', p4: '#220050',
  green: '#2DCC7F', red: '#FF4D6D', gold: '#FFD166',
  surface2: '#190038', surface3: '#220050',
  border: 'rgba(176,109,255,0.18)', borderStrong: 'rgba(176,109,255,0.42)',
  textSec: 'rgba(255,255,255,0.62)', textMuted: 'rgba(255,255,255,0.36)',
}

// ── Helpers ────────────────────────────────────
const fmt  = v => v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v}`
const fmtFull = v => '$' + Math.round(v).toLocaleString()
const pct  = (a, b) => b ? ((a - b) / b * 100).toFixed(1) : null
const arrow = v => v > 0 ? '▲' : '▼'

// ── Tooltip ────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.surface2, border:`1px solid ${C.borderStrong}`, borderRadius:10, padding:'10px 14px', fontSize:12, color:'#fff' }}>
      <p style={{ color: C.textSec, marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight:600 }}>
          {p.name}: {fmtFull(p.value)}
        </p>
      ))}
    </div>
  )
}

// ── Shared card wrapper ────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(45,0,102,0.35)',
    border: `1px solid ${C.border}`,
    borderRadius: 16, padding: 24,
    backdropFilter: 'blur(12px)', ...style
  }}>
    {children}
  </div>
)

const SectionLabel = ({ children }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
    <div style={{ width:20, height:2, background: C.p1 }} />
    <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color: C.p1 }}>
      {children}
    </span>
  </div>
)

const CardTitle = ({ title, sub }) => (
  <div style={{ marginBottom:20 }}>
    <div style={{ fontSize:14, fontWeight:700 }}>{title}</div>
    {sub && <div style={{ fontSize:11, color: C.textSec, marginTop:3 }}>{sub}</div>}
  </div>
)

// ── KPI Card ───────────────────────────────────
const KPICard = ({ icon, label, value, sub, subColor, highlight }) => (
  <div style={{
    background: highlight
      ? 'linear-gradient(135deg,rgba(61,0,136,0.6),rgba(107,33,200,0.4))'
      : 'rgba(45,0,102,0.35)',
    border: `1px solid ${highlight ? C.borderStrong : C.border}`,
    borderRadius:16, padding:24, position:'relative', overflow:'hidden',
    backdropFilter:'blur(12px)', transition:'transform 0.2s',
    cursor:'default'
  }}
    onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
  >
    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#6B21C8,#B06DFF)', borderRadius:'16px 16px 0 0' }} />
    <div style={{ fontSize:20, marginBottom:10 }}>{icon}</div>
    <div style={{ fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em', color: C.textSec, marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:800, lineHeight:1, marginBottom:8 }}>{value}</div>
    {sub && <div style={{ fontSize:12, fontWeight:500, color: subColor || C.textMuted }}>{sub}</div>}
  </div>
)

// ── TABS ───────────────────────────────────────
const TABS = ['Overview', 'Revenue', 'Clients', 'Services', 'Monthly']

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('Overview')

  const data2026 = annual.find(a => a.year === 2026)
  const data2025 = annual.find(a => a.year === 2025)

  // YTD values (Jan-Apr actual)
  const ytdTotal    = data2026.totalYTD
  const ytdFenomena = data2026.fenomenaYTD
  const ytdBudget   = data2026.total
  const ytdPct      = (ytdTotal / ytdBudget * 100).toFixed(0)

  // 2026 monthly — split actual vs projected
  const monthly26 = data2026.monthly.map((v, i) => ({
    month: MONTHS[i], value: v,
    projected: data2026.projected[i]
  }))

  // Annual comparison data for chart
  const annualChartData = annual.slice(1).map((d, i) => {
    const prev = annual[i]
    return {
      year: String(d.year),
      total: d.year === 2026 ? d.totalYTD : d.total,
      fenomena: d.year === 2026 ? d.fenomenaYTD : d.fenomena,
      label: d.year === 2026 ? 'YTD' : String(d.year)
    }
  })

  // Service mix for donut
  const svcYTD = serviceMix['2026-YTD']
  const svcColors = { 'Producción': C.p1, 'Medios & Reporting': C.p2, 'Comisión': C.gold, 'Costos Reembolsables': C.p3 }
  const svcData = Object.entries(svcYTD).map(([name, value]) => ({ name, value }))

  // Segment data
  const segData = [
    { name: 'Grandes\n(+$70K)', '2025': segments[2025].Grandes, '2026': segments[2026].Grandes },
    { name: 'Medianos\n($30–70K)', '2025': segments[2025].Medianos, '2026': segments[2026].Medianos },
    { name: 'Pequeños\n(-$30K)', '2025': segments[2025].Pequeños, '2026': segments[2026].Pequeños },
  ]

  const total26 = clients.reduce((s, c) => s + c.rev26, 0)

  return (
    <div style={{ minHeight:'100vh', background:'var(--surface)', position:'relative', overflow:'hidden' }}>
      {/* Background orbs */}
      <div style={{ position:'fixed', width:600, height:600, borderRadius:'50%', background:'rgba(61,0,136,0.35)', filter:'blur(80px)', top:-200, right:-100, pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'rgba(45,0,102,0.28)', filter:'blur(70px)', bottom:100, left:-100, pointerEvents:'none', zIndex:0 }} />

      {/* Ticker */}
      <div style={{ overflow:'hidden', background: C.surface2, borderBottom:`1px solid ${C.border}`, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', gap:0, whiteSpace:'nowrap', animation:'ticker 28s linear infinite', padding:'9px 0' }}>
          {[
            `2026 YTD Total · $${Math.round(ytdTotal/1000)}K`,
            `2026 Budget · $${Math.round(ytdBudget/1000)}K`,
            `YTD Progress · ${ytdPct}% of budget`,
            'Top Client · ASSA $170K',
            'ISHOP 🆕 · +1,037% YoY',
            'Fenomena Digital · A real click',
          ].concat([
            `2026 YTD Total · $${Math.round(ytdTotal/1000)}K`,
            `2026 Budget · $${Math.round(ytdBudget/1000)}K`,
            `YTD Progress · ${ytdPct}% of budget`,
            'Top Client · ASSA $170K',
            'ISHOP 🆕 · +1,037% YoY',
            'Fenomena Digital · A real click',
          ]).map((txt, i) => (
            <span key={i} style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color: C.p1, padding:'0 28px' }}>
              {txt} <span style={{ color: C.textMuted }}>·</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
      </div>

      <div style={{ position:'relative', zIndex:1, maxWidth:1380, margin:'0 auto', padding:'0 24px 48px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 0 28px', borderBottom:`1px solid ${C.border}`, marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <Image src="/logo.png" alt="Fenomena" width={160} height={36} style={{ filter:'brightness(0) invert(1)', objectFit:'contain' }} />
            <div style={{ width:1, height:30, background: C.borderStrong }} />
            <span style={{ fontSize:13, fontWeight:500, color: C.textSec, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Financial Dashboard
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:11, padding:'5px 12px', borderRadius:20, background: C.surface3, color: C.gold, border:`1px solid rgba(255,209,102,0.3)`, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              ⚡ 2026 YTD · Jan–Apr actual
            </span>
            <span style={{ fontSize:11, color: C.textMuted }}>{user?.email}</span>
            <button onClick={onLogout} style={{ fontSize:11, padding:'6px 14px', borderRadius:8, background:'transparent', border:`1px solid ${C.border}`, color: C.textSec, cursor:'pointer', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:28 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'8px 20px', borderRadius:8, fontSize:12, fontWeight:600,
              cursor:'pointer', border:`1px solid ${tab===t ? C.borderStrong : 'transparent'}`,
              background: tab===t ? C.surface3 : 'transparent',
              color: tab===t ? '#fff' : C.textSec, transition:'all 0.15s'
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === 'Overview' && <OverviewTab
          ytdTotal={ytdTotal} ytdFenomena={ytdFenomena} ytdBudget={ytdBudget}
          ytdPct={ytdPct} data2025={data2025} data2026={data2026}
          annualChartData={annualChartData} svcData={svcData} svcColors={svcColors}
          segData={segData} clients={clients} total26={total26}
        />}

        {/* ══ REVENUE ══ */}
        {tab === 'Revenue' && <RevenueTab
          annual={annual} annualChartData={annualChartData} monthly26={monthly26}
        />}

        {/* ══ CLIENTS ══ */}
        {tab === 'Clients' && <ClientsTab clients={clients} total26={total26} segData={segData} segments={segments} />}

        {/* ══ SERVICES ══ */}
        {tab === 'Services' && <ServicesTab svcData={svcData} svcColors={svcColors} serviceMix={serviceMix} serviceByClient={serviceByClient} />}

        {/* ══ MONTHLY ══ */}
        {tab === 'Monthly' && <MonthlyTab annual={annual} monthly26={monthly26} />}

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════
function OverviewTab({ ytdTotal, ytdFenomena, ytdBudget, ytdPct, data2025, data2026, annualChartData, svcData, svcColors, segData, clients, total26 }) {
  const yoy = pct(ytdFenomena, data2025.fenomena)
  return (
    <>
      <SectionLabel>Key Metrics · 2026 Year-to-Date (Jan – Apr)</SectionLabel>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <KPICard highlight icon="💰" label="2026 Agency Revenue YTD"
          value={fmt(ytdFenomena)}
          sub={`${ytdPct}% of $${Math.round(ytdBudget/1000)}K budget`} subColor={C.gold} />
        <KPICard icon="📋" label="2026 Total Billed YTD"
          value={fmt(ytdTotal)}
          sub="Jan–Apr actuals only" subColor={C.textMuted} />
        <KPICard icon="📈" label="YoY vs 2025 Budget"
          value={`${pct(data2026.fenomena, data2025.fenomena) > 0 ? '+' : ''}${pct(data2026.fenomena, data2025.fenomena)}%`}
          sub="Full-year budget vs 2025" subColor={C.textMuted} />
        <KPICard icon="👥" label="Active Clients 2026"
          value="18"
          sub="1 new (ISHOP) · 1 lost (Banco Aliado)" subColor={C.green} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <CardTitle title="Annual Revenue Trend 2021–2026" sub="Total billed vs. Fenomena agency revenue — 2026 shows YTD only" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={annualChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v=>`$${v/1000}K`} tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total Billed" fill={C.p3} radius={[4,4,0,0]} />
              <Bar dataKey="fenomena" name="Agency Revenue" fill={C.p1} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Service Mix 2026 YTD" sub="Jan–Apr agency revenue by service type" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={svcData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {svcData.map((entry) => <Cell key={entry.name} fill={svcColors[entry.name]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ background: C.surface2, border:`1px solid ${C.borderStrong}`, borderRadius:8, fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
            {svcData.map(d => (
              <div key={d.name} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                <span style={{ color: C.textSec }}><span style={{ color: svcColors[d.name], marginRight:6 }}>●</span>{d.name}</span>
                <span style={{ fontWeight:700 }}>{fmtFull(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top clients mini */}
      <Card>
        <CardTitle title="Top 5 Clients · 2026 Budget" sub="Fenomena agency revenue — full year budget" />
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {clients.slice(0,5).map((c, i) => {
            const chg = c.rev26 - c.rev25; const isUp = chg >= 0
            return (
              <div key={c.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i < 4 ? `1px solid rgba(176,109,255,0.08)` : 'none' }}>
                <span style={{ fontSize:12, fontWeight:700, color: C.p1, width:24 }}>#{i+1}</span>
                <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{c.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color: C.p1 }}>{fmtFull(c.rev26)}</span>
                <span style={{ fontSize:12, fontWeight:600, color: isUp ? C.green : C.red, minWidth:80, textAlign:'right' }}>
                  {arrow(chg)} {isUp?'+':''}{fmtFull(Math.abs(chg))}
                </span>
                <div style={{ width:80, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                  <div style={{ width:`${c.rev26/170395*100}%`, height:4, borderRadius:2, background:`linear-gradient(90deg,${C.p2},${C.p1})` }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </>
  )
}

// ═══════════════════════════════════════════════
// REVENUE TAB
// ═══════════════════════════════════════════════
function RevenueTab({ annual, annualChartData, monthly26 }) {
  const yoyRows = annual.slice(1).map((d, i) => {
    const prev = annual[i]
    const growth = ((d.fenomena - prev.fenomena) / prev.fenomena * 100).toFixed(1)
    const isUp = growth > 0
    return {
      year: d.year,
      total: d.year === 2026 ? d.totalYTD : d.total,
      fenomena: d.year === 2026 ? d.fenomenaYTD : d.fenomena,
      growth, isUp,
      note: d.year === 2026 ? '⚡ YTD Jan–Apr' : ''
    }
  })

  return (
    <>
      <SectionLabel>Year-over-Year Revenue</SectionLabel>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <CardTitle title="Revenue 2021–2026" sub="2026 = YTD Jan–Apr · May–Dec are projections" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={annualChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:11, color:'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="total" name="Total Billed" fill={C.p3} radius={[4,4,0,0]} />
              <Bar dataKey="fenomena" name="Agency Revenue" fill={C.p1} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="YoY Summary Table" sub="Fenomena agency revenue" />
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {yoyRows.map((r, i) => (
              <div key={r.year} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom: i < yoyRows.length-1 ? `1px solid rgba(176,109,255,0.08)` : 'none' }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:700, color: C.p1, marginRight:8 }}>{r.year}</span>
                  {r.note && <span style={{ fontSize:10, color: C.gold, fontWeight:600 }}>{r.note}</span>}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{fmt(r.fenomena)}</div>
                  {r.growth && (
                    <div style={{ fontSize:11, color: r.isUp ? C.green : C.red, fontWeight:600 }}>
                      {r.isUp?'▲ +':'▼ '}{Math.abs(r.growth)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 2026 monthly with projected bands */}
      <Card>
        <CardTitle title="2026 Monthly Revenue" sub="Jan–Apr = actual invoiced · May–Dec = projected (budget)" />
        <div style={{ marginBottom:12, display:'flex', gap:16, alignItems:'center' }}>
          <span style={{ fontSize:11, display:'flex', alignItems:'center', gap:5, color: C.textSec }}>
            <span style={{ display:'inline-block', width:12, height:3, background: C.p1, borderRadius:2 }} /> Actual
          </span>
          <span style={{ fontSize:11, display:'flex', alignItems:'center', gap:5, color: C.textSec }}>
            <span style={{ display:'inline-block', width:12, height:3, background: C.p3, borderRadius:2, opacity:0.7 }} /> Projected
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthly26}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Revenue" radius={[4,4,0,0]}>
              {monthly26.map((entry, i) => (
                <Cell key={i} fill={entry.projected ? C.p3 : C.p1} fillOpacity={entry.projected ? 0.55 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, padding:'10px 14px', background:'rgba(255,209,102,0.07)', border:'1px solid rgba(255,209,102,0.2)', borderRadius:8 }}>
          <span style={{ fontSize:12, color: C.gold }}>⚡ YTD Jan–Apr actual total</span>
          <span style={{ fontSize:13, fontWeight:700, color: C.gold }}>{fmtFull(monthly26.slice(0,4).reduce((s,m)=>s+m.value,0))}</span>
        </div>
      </Card>
    </>
  )
}

// ═══════════════════════════════════════════════
// CLIENTS TAB
// ═══════════════════════════════════════════════
function ClientsTab({ clients, total26, segData, segments }) {
  const movements = [...clients].sort((a,b) => Math.abs((b.rev26-b.rev25)/b.rev25) - Math.abs((a.rev26-a.rev25)/a.rev25)).slice(0,5)

  return (
    <>
      <SectionLabel>Client Analysis</SectionLabel>

      {/* Segment cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        {[
          { label:'Grandes · +$70K/yr', color: C.p1, rev26: segments[2026].Grandes, rev25: segments[2025].Grandes, clients:'ASSA · ISHOP · MOLSON · FEDURO' },
          { label:'Medianos · $30–70K/yr', color: C.p2, rev26: segments[2026].Medianos, rev25: segments[2025].Medianos, clients:'LA HIP · VALOR · RELOJIN · BELLA · ATTENZA' },
          { label:'Pequeños · -$30K/yr', color: C.p3, rev26: segments[2026].Pequeños, rev25: segments[2025].Pequeños, clients:'SIMONA · AMERICAN · WHITE CLAW · WESSON' },
        ].map(seg => {
          const chg = pct(seg.rev26, seg.rev25); const isUp = chg > 0
          return (
            <Card key={seg.label} style={{ borderColor: seg.color + '66' }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color: seg.color, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: seg.color, display:'inline-block' }} />{seg.label}
              </div>
              <div style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>{fmt(seg.rev26)}</div>
              <div style={{ fontSize:12, color: isUp ? C.green : C.red, fontWeight:600, marginBottom:10 }}>
                {isUp?'▲ +':'▼ '}{Math.abs(chg)}% vs 2025
              </div>
              <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:3, marginBottom:10 }}>
                <div style={{ width:`${seg.rev26/(segments[2026].Grandes)*100}%`, height:5, borderRadius:3, background: seg.color, maxWidth:'100%' }} />
              </div>
              <div style={{ fontSize:11, color: C.textMuted, lineHeight:1.6 }}>{seg.clients}</div>
            </Card>
          )
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Segment comparison bar */}
        <Card>
          <CardTitle title="Client Tier Revenue · 2025 vs 2026" sub="Fenomena agency revenue by tier" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:10, whiteSpace:'pre' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="2025" name="2025" fill={C.p3} radius={[4,4,0,0]} />
              <Bar dataKey="2026" name="2026" fill={C.p1} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top movers */}
        <Card>
          <CardTitle title="Biggest YoY Movements" sub="Largest % change in client revenue vs 2025" />
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {movements.map(c => {
              const chg = c.rev26 - c.rev25; const isUp = chg >= 0
              const pctChg = c.rev25 > 0 ? (chg/c.rev25*100).toFixed(0) : null
              return (
                <div key={c.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:`1px solid rgba(176,109,255,0.1)` }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>{c.name}</span>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:11, color: C.textSec }}>{fmt(c.rev25)}</span>
                    <span style={{ fontSize:13, fontWeight:700, color: isUp ? C.green : C.red }}>
                      {c.rev25 === 0 ? '🆕 New' : `${isUp?'▲ +':'▼ '}${Math.abs(pctChg)}%`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Full roster table */}
      <Card>
        <CardTitle title="Full Client Roster · 2026 Budget" sub="All 18 active clients ranked by annual agency revenue" />
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['#','Client','Tier','2026 Revenue','2025 Revenue','Change','% Portfolio','Share'].map(h => (
                <th key={h} style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color: C.textMuted, padding:'0 0 12px', textAlign: h==='Client'||h==='#'||h==='Tier' ? 'left':'right', borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => {
              const chg = c.rev26 - c.rev25; const isUp = chg >= 0
              const pctChg = c.rev25 > 0 ? (chg/c.rev25*100).toFixed(0) : null
              const share = (c.rev26 / total26 * 100).toFixed(1)
              const tierColors = { 1: C.gold, 2: C.green, 3: C.p1, 4: C.textMuted }
              const tierLabels = { 1:'T1', 2:'T2', 3:'T3', 4:'T4' }
              return (
                <tr key={c.name} style={{ borderBottom:`1px solid rgba(176,109,255,0.07)` }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(176,109,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'11px 0', fontSize:12, fontWeight:700, color: C.p1 }}>#{i+1}</td>
                  <td style={{ fontSize:13, fontWeight:600 }}>{c.name}</td>
                  <td>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:10, background: tierColors[c.tier]+'22', color: tierColors[c.tier] }}>
                      {tierLabels[c.tier]}
                    </span>
                  </td>
                  <td style={{ textAlign:'right', fontSize:13, fontWeight:700, color: C.p1 }}>{fmtFull(c.rev26)}</td>
                  <td style={{ textAlign:'right', fontSize:12, color: C.textSec }}>{c.rev25 > 0 ? fmtFull(c.rev25) : '—'}</td>
                  <td style={{ textAlign:'right', fontSize:12, fontWeight:700, color: isUp ? C.green : C.red }}>
                    {c.rev25 === 0 ? <span style={{color:C.green}}>New</span> : `${isUp?'+':''}${fmtFull(chg)}`}
                  </td>
                  <td style={{ textAlign:'right', fontSize:12, color: C.textSec }}>{share}%</td>
                  <td style={{ textAlign:'right' }}>
                    <div style={{ width:60, height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, marginLeft:'auto' }}>
                      <div style={{ width:`${c.rev26/170395*100}%`, height:4, borderRadius:2, background:`linear-gradient(90deg,${C.p2},${C.p1})` }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}

// ═══════════════════════════════════════════════
// SERVICES TAB
// ═══════════════════════════════════════════════
function ServicesTab({ svcData, svcColors, serviceMix, serviceByClient }) {
  const svc25 = serviceMix[2025]
  const svc26 = serviceMix[2026]
  const svcYTD = serviceMix['2026-YTD']

  const svcCompare = Object.keys(svc25).map(svc => ({
    name: svc,
    '2025': svc25[svc],
    '2026 Budget': svc26[svc],
    '2026 YTD': svcYTD[svc],
  }))

  const stackData = serviceByClient.slice(0, 8).map(c => ({
    name: c.client.length > 14 ? c.client.slice(0,13)+'…' : c.client,
    Producción: c.produccion,
    'Medios & Rep.': c.medios,
  }))

  return (
    <>
      <SectionLabel>Revenue by Service Type</SectionLabel>

      {/* Service KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {[
          { name:'Producción', icon:'🎨', desc:'Content, design & community', ytd: svcYTD['Producción'], full: svc26['Producción'] },
          { name:'Medios & Reporting', icon:'📡', desc:'Media buying & reporting', ytd: svcYTD['Medios & Reporting'], full: svc26['Medios & Reporting'] },
          { name:'Comisión', icon:'💼', desc:'Agency commissions', ytd: svcYTD['Comisión'], full: svc26['Comisión'] },
          { name:'Costos Reembolsables', icon:'🔁', desc:'Pass-through media & vendors', ytd: svcYTD['Costos Reembolsables'], full: svc26['Costos Reembolsables'] },
        ].map(s => (
          <Card key={s.name}>
            <div style={{ fontSize:20, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color: svcColors[s.name], marginBottom:4 }}>{s.name}</div>
            <div style={{ fontSize:11, color: C.textMuted, marginBottom:12 }}>{s.desc}</div>
            <div style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>{fmt(s.ytd)}</div>
            <div style={{ fontSize:11, color: C.textMuted }}>YTD (Jan–Apr)</div>
            <div style={{ fontSize:12, color: C.textSec, marginTop:4 }}>Full year budget: {fmt(s.full)}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Donut */}
        <Card>
          <CardTitle title="Service Mix · 2026 YTD" sub="Revenue share by service type (Jan–Apr actual)" />
          <div style={{ display:'flex', gap:24, alignItems:'center' }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={svcData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {svcData.map(e => <Cell key={e.name} fill={svcColors[e.name]} />)}
                </Pie>
                <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: C.surface2, border:`1px solid ${C.borderStrong}`, borderRadius:8, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
              {svcData.map(d => {
                const total = svcData.reduce((s,x)=>s+x.value,0)
                const p = (d.value/total*100).toFixed(0)
                return (
                  <div key={d.name}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12, color: C.textSec }}><span style={{ color: svcColors[d.name], marginRight:6 }}>●</span>{d.name}</span>
                      <span style={{ fontSize:12, fontWeight:700 }}>{p}%</span>
                    </div>
                    <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                      <div style={{ width:`${p}%`, height:4, borderRadius:2, background: svcColors[d.name] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Service 2025 vs 2026 */}
        <Card>
          <CardTitle title="Service Revenue · 2025 vs 2026 Budget" sub="Annual totals by service type" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={svcCompare} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{ fill:'rgba(255,255,255,0.5)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:10 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="2025" name="2025" fill={C.p3} radius={[0,4,4,0]} />
              <Bar dataKey="2026 Budget" name="2026 Budget" fill={C.p1} radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Producción vs Medios by client */}
      <Card>
        <CardTitle title="Producción vs Medios & Reporting · By Client" sub="2026 budget — top 8 clients" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stackData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize:11, color:'rgba(255,255,255,0.5)' }} />
            <Bar dataKey="Producción" fill={C.p1} radius={[0,0,0,0]} stackId="a" />
            <Bar dataKey="Medios & Rep." fill={C.p2} radius={[4,4,0,0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  )
}

// ═══════════════════════════════════════════════
// MONTHLY TAB
// ═══════════════════════════════════════════════
function MonthlyTab({ annual, monthly26 }) {
  const multiYearData = MONTHS.map((m, i) => {
    const row = { month: m }
    ;[2023, 2024, 2025].forEach(yr => {
      const d = annual.find(a => a.year === yr)
      row[String(yr)] = d?.monthly[i] || 0
    })
    row['2026 Actual'] = monthly26[i].projected ? null : monthly26[i].value
    row['2026 Projected'] = monthly26[i].projected ? monthly26[i].value : null
    return row
  })

  const lineColors = { '2023': C.p4+'cc', '2024': C.p3, '2025': C.p2, '2026 Actual': C.p1, '2026 Projected': C.p1 }

  // Heatmap
  const heatYears = [2021, 2022, 2023, 2024, 2025, 2026]

  return (
    <>
      <SectionLabel>Monthly Revenue Analysis</SectionLabel>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        <KPICard icon="📅" label="2025 Monthly Avg" value="$100K" sub="$100,484 average" />
        <KPICard icon="🏆" label="2025 Peak" value="$146K" sub="June 2025" subColor={C.gold} />
        <KPICard icon="📉" label="2025 Lowest" value="$78K" sub="February 2025" />
        <KPICard icon="⚡" label="2026 YTD Avg" value="$120K" sub="Jan–Apr avg (actuals only)" subColor={C.green} />
      </div>

      <Card style={{ marginBottom:20 }}>
        <CardTitle title="Monthly Revenue by Year" sub="2026 solid = actual · 2026 dashed = projected" />
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={multiYearData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}K`} tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {['2023','2024','2025'].map(yr => (
              <Line key={yr} type="monotone" dataKey={yr} stroke={lineColors[yr]} strokeWidth={yr==='2025'?3:2} dot={false} />
            ))}
            <Line type="monotone" dataKey="2026 Actual" stroke={C.p1} strokeWidth={3} dot={{ fill: C.p1, r:4 }} connectNulls={false} />
            <Line type="monotone" dataKey="2026 Projected" stroke={C.p1} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} opacity={0.55} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardTitle title="Revenue Heatmap · 2021–2026" sub="Intensity = revenue level per month (darker = higher)" />
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:3 }}>
            <thead>
              <tr>
                <th style={{ width:50 }} />
                {MONTHS.map(m => <th key={m} style={{ textAlign:'center', fontSize:10, color: C.textMuted, paddingBottom:8, fontWeight:400 }}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatYears.map(yr => {
                const d = annual.find(a => a.year === yr)
                if (!d) return null
                const vals = d.monthly
                const maxV = Math.max(...vals)
                return (
                  <tr key={yr}>
                    <td style={{ fontSize:11, fontWeight:600, color: C.textSec, textAlign:'right', paddingRight:8 }}>{yr}</td>
                    {vals.map((v, i) => {
                      const intensity = v / maxV
                      const isProj = yr === 2026 && monthly26[i]?.projected
                      return (
                        <td key={i} title={`${MONTHS[i]} ${yr}: ${fmtFull(v)}`} style={{
                          height:32, borderRadius:5, textAlign:'center', verticalAlign:'middle',
                          fontSize:9, fontWeight:500,
                          background: `rgba(176,109,255,${(0.12 + intensity * 0.78).toFixed(2)})`,
                          color: intensity > 0.55 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                          border: isProj ? `1px dashed rgba(176,109,255,0.5)` : 'none',
                          opacity: isProj ? 0.6 : 1,
                          cursor:'default'
                        }}>
                          ${Math.round(v/1000)}K
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop:12, fontSize:11, color: C.textMuted }}>
          ⚡ 2026 Jan–Apr = actual · dashed cells = projected budget
        </div>
      </Card>
    </>
  )
}
