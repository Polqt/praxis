import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Praxis — Proof of work for developers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines — horizontal */}
        {[160, 320, 470].map((y) => (
          <div
            key={y}
            style={{
              position: 'absolute',
              left: 0,
              top: y,
              width: '100%',
              height: 1,
              background: 'rgba(255,255,255,0.04)',
            }}
          />
        ))}

        {/* Grid lines — vertical */}
        {[240, 480, 720, 960].map((x) => (
          <div
            key={x}
            style={{
              position: 'absolute',
              top: 0,
              left: x,
              width: 1,
              height: '100%',
              background: 'rgba(255,255,255,0.04)',
            }}
          />
        ))}

        {/* Accent glow — top left */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -80,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Accent glow — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 96px',
            height: '100%',
          }}
        >
          {/* Top: wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mark */}
            <div
              style={{
                width: 10,
                height: 13,
                background: '#ffffff',
                borderRadius: 1,
              }}
            />
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Praxis
            </span>
          </div>

          {/* Middle: headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Proof of work for developers
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                maxWidth: 740,
              }}
            >
              Build real things.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>Prove it.</span>
            </div>
          </div>

          {/* Bottom: stat pills */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Deterministic', value: 'Analysis' },
              { label: 'Repository', value: 'Evidence' },
              { label: 'Shareable', value: 'Proof' },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {label}
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: score card mockup */}
        <div
          style={{
            position: 'absolute',
            right: 96,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: 260,
          }}
        >
          {[
            { label: 'API Design', score: 9, width: '90%' },
            { label: 'Testing', score: 7, width: '70%' },
            { label: 'Deployment', score: 8, width: '80%' },
            { label: 'Database', score: 9, width: '90%' },
          ].map(({ label, score, width }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{score}/10</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ height: '100%', width, background: '#ffffff', borderRadius: 2, opacity: 0.6 }} />
              </div>
            </div>
          ))}

          {/* Verified badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Verified
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
