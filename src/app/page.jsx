'use client';

import { useState, useEffect } from 'react';

export default function DonutCounter() {
  const [address, setAddress] = useState(null);
  const [count, setCount] = useState(0);
  const [youIncremented, setYouIncremented] = useState(0);
  const [lastIncrement, setLastIncrement] = useState("Never");
  const [cooldown, setCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // GANTI DENGAN ALAMAT CONTRACT-MU
  const CONTRACT_ADDRESS = "0xd66C7e7600EDC0386457495D069DB9d3F91dcfaF";

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          loadCount(accounts[0]);
        }
      });
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask di HP-mu");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAddress(accounts[0]);
    loadCount(accounts[0]);
  };

  const loadCount = async (addr) => {
    const data = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{
        to: CONTRACT_ADDRESS,
        data: "0xa3506a0d" + addr.slice(2).padStart(64, '0')
      }, "latest"],
      id: 1
    };
    try {
      const res = await fetch("https://mainnet.base.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      const count = parseInt(json.result || "0x0", 16);
      setCount(count);
      setYouIncremented(count); // asumsi user hanya bisa increment sekali per address
      setLastIncrement(new Date().toLocaleString()); // ganti ini dengan data dari event log jika ada
    } catch (e) {
      console.error("Gagal load count:", e);
    }
  };

  const increment = async () => {
    if (!address || cooldown) return;
    setCooldown(true);
    try {
      const valueWei = BigInt(Math.floor(0.001 * 1e18)).toString(16); // ganti 0.001 dengan estimasi harga Donut
      const tx = {
        from: address,
        to: CONTRACT_ADDRESS,
        value: "0x" + valueWei,
        data: "0x66a2e555" // signature fungsi increment()
      };
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      });
      alert(`✅ Sukses! Tx: ${txHash.substring(0,8)}...`);
      setYouIncremented(youIncremented + 1);
      setLastIncrement(new Date().toLocaleString());
      
      // Set cooldown 5 jam
      const cooldownMs = 5 * 60 * 60 * 1000;
      const endTime = Date.now() + cooldownMs;
      localStorage.setItem(`cooldown_${address}`, endTime.toString());

      // Update timer
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        if (remaining <= 0) {
          clearInterval(timer);
          setCooldown(false);
          setTimeLeft('');
        } else {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      }, 1000);

    } catch (e) {
      alert("❌ Gagal: " + (e.message || e.toString()));
      setCooldown(false);
    }
  };

  // Cek cooldown dari localStorage saat load
  useEffect(() => {
    if (!address) return;
    const cooldownEnd = localStorage.getItem(`cooldown_${address}`);
    if (cooldownEnd) {
      const now = Date.now();
      const end = parseInt(cooldownEnd);
      if (now < end) {
        setCooldown(true);
        const remaining = end - now;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }
  }, [address]);

  if (!address) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '2em', color: '#f59e0b' }}>🍩 Donut Counter</h1>
        <button onClick={connect} style={{ padding: '12px 24px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontSize: '1.1em' }}>
          Connect Wallet (Base)
        </button>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: 10 }}>
          Pastikan jaringan Base aktif di MetaMask
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px 10px', 
      maxWidth: 600, 
      margin: '0 auto', 
      fontFamily: 'sans-serif', 
      backgroundColor: '#fafafa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', margin: 0 }}>DONUT Counter</h1>
          <p style={{ fontSize: '0.8em', color: '#666', margin: 0 }}>by {address.slice(0,6)}...{address.slice(-4)}</p>
        </div>
        <button 
          style={{ 
            padding: '6px 12px', 
            backgroundColor: '#fff', 
            border: '2px solid #007aff', 
            borderRadius: '20px', 
            fontSize: '0.9em', 
            fontWeight: 'bold', 
            color: '#007aff', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px'
          }}
        >
          <span style={{ fontSize: '1.2em' }}>💖</span> Tip
        </button>
      </div>

      {/* Avatar Donut */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#ffeb3b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          boxShadow: '0 0 20px rgba(255, 235, 59, 0.5)',
          position: 'relative'
        }}>
          <span style={{ fontSize: '60px' }}>🍩</span>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          flex: 1
        }}>
          <p style={{ fontSize: '0.8em', color: '#666', margin: 0 }}>YOU INCREMENTED</p>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#f59e0b', margin: '10px 0' }}>{youIncremented}</p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          flex: 1
        }}>
          <p style={{ fontSize: '0.8em', color: '#666', margin: 0 }}>LAST INCREMENT</p>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '10px 0' }}>{lastIncrement}</p>
        </div>
      </div>

      {/* Total Count */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ fontSize: '0.8em', color: '#666', margin: 0 }}>TOTAL INCREMENTED</p>
        <p style={{ fontSize: '4em', fontWeight: 'bold', color: '#f59e0b', margin: '10px 0', textShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}>
          {count.toLocaleString()}
        </p>
      </div>

      {/* Button */}
      <div style={{ padding: '0 10px' }}>
        <button 
          onClick={increment}
          disabled={cooldown}
          style={{ 
            width: '100%', 
            padding: '15px', 
            backgroundColor: cooldown ? '#e0e0e0' : '#f59e0b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '20px', 
            fontSize: '1.1em', 
            fontWeight: 'bold', 
            cursor: cooldown ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {cooldown ? `Wait ${timeLeft}` : '+1 Donut (Swap ETH → Donut)'}
        </button>
        {cooldown && (
          <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px', textAlign: 'center' }}>
            Cooldown: You can increment again in {timeLeft}
          </p>
        )}
      </div>
    </div>
  );
}
