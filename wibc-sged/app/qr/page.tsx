'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'

export default function QRCodePage() {
  const [waitlistUrl, setWaitlistUrl] = useState('')

  useEffect(() => {
    // Generate the full URL dynamically based on the current origin
    if (typeof window !== 'undefined') {
      setWaitlistUrl(`${window.location.origin}/waitlist`)
    }
  }, [])

  return (
    <main className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card text-center" style={{ maxWidth: '500px', width: '100%', padding: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Register Interest</h1>
        <p className="text-muted" style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          Scan the QR code below to join the waitlist.
        </p>

        {waitlistUrl ? (
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', boxShadow: 'var(--shadow-sm)' }}>
            <QRCode
              value={waitlistUrl}
              size={250}
              level="H"
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            />
          </div>
        ) : (
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading QR Code...</p>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Made by{' '}
            <a
              href="https://www.proctorsgroup.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#000000', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Proctor + Stevenson
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
