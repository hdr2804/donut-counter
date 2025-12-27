'use client';

import { useState, useEffect } from 'react';

export default function DonutCounter() {
  const [count, setCount] = useState(0);
  const [fid, setFid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const farcasterFid = params.get('fid') || '99999';
    setFid(farcasterFid);
    loadCount(farcasterFid);
  }, []);

  const loadCount = async (userFid: string) => {
    try {
      const res = await fetch(`/api/count?fid=${userFid}`);
      const data = await res.json();
      setCount(data.count || 0);
    } catch (e) {
      // gagal? biarkan tetap 0
    } finally {
      setLoading(false);
    }
  };

  const increment = async () => {
    if (!fid) return;
    await fetch('/api/count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fid }),
    });
    setCount(count + 1);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading donuts...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-amber-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🍩</div>
      <h1 className="text-3xl font-bold text-pink-700 mb-2">Donut Counter</h1>
      <p className="text-5xl font-extrabold text-amber-600 mb-6">{count}</p>
      <button
        onClick={increment}
        className="px-8 py-4 bg-pink-500 text-white font-bold rounded-full shadow-lg"
      >
        +1 Donut!
      </button>
      <p className="mt-6 text-xs text-gray-500">Count per Farcaster account</p>
    </div>
  );
}
