'use client';

import { useState, useEffect } from 'react';

export default function DonutCounter() {
  const [address, setAddress] = useState(null);
  const [fid, setFid] = useState(null);
  const [count, setCount] = useState(0);
  const [youIncremented, setYouIncremented] = useState(0);
  const [lastIncrement, setLastIncrement] = useState("Never");
  const [cooldown, setCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const CONTRACT_ADDRESS = "0xd66C7e7600EDC0386457495D069DB9d3F91dcfaF";
  const BASE_CHAIN_ID = "0x2105"; // 8453 dalam hex

  const switchToBase = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_CHAIN_ID }]
      });
      window.location.reload(); // reload setelah ganti jaringan
    } catch (switchError) {
      // Jika Base belum ditambahkan, tambahkan manual
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_CHAIN_ID,
              chainName: 'Base',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          });
          window.location.reload();
        } catch (addError) {
          alert("Gagal menambahkan Base network");
        }
      }
    }
  };

  useEffect(() => {
    const initWallet = async () => {
      if (typeof window.ethereum === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        // Cek jaringan saat ini
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== BASE_CHAIN_ID) {
          setWrongNetwork(true);
          setLoading(false);
          return;
        }

        // Ambil akun
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const addr = accounts[0];
        setAddress(addr);

        // Ambil FID (jika tersedia)
        if (window.farcaster?.fid) {
          setFid(window.farcaster.fid);
        } else {
          setFid('unknown');
        }

        loadCount(addr);
        setWrongNetwork(false);
      } catch (e) {
        console.error("Error init wallet:", e);
      } finally {
        setLoading(false);
      }
    };

    initWallet();

    // Deteksi perubahan jaringan
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    // Cek cooldown
    const savedAddr = address || localStorage.getItem('warpcast_address');
    if (savedAddr) {
      const cooldownEnd = localStorage.getItem(`cooldown_${savedAddr}`);
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
    }
  }, []);

  const loadCount = async (addr) => {
    const data = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{
        to: CONTRACT_ADDRESS,
        "0xa3506a0d" + addr.slice(2).padStart(64, '0')
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
      setYouIncremented(count);
      setLastIncrement(new Date().toLocaleString());
      localStorage.setItem('warpcast_address', addr);
    } catch (e) {
      console.error("Gagal load count:", e);
    }
  };

  const increment = async () => {
    if (!address || cooldown) return;
    setCooldown(true);
    try {
      const ethAmount = 0.001; // ganti dengan estimasi real-time
      const valueWei = BigInt(Math.floor(ethAmount * 1e18)).toString(16);

      const tx = {
        from: address,
        to: CONTRACT_ADDRESS,
        value: "0x" + valueWei,
        "0x66a2e555"
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      });

      const newCount = youIncremented + 1;
      setYouIncremented(newCount);
      setCount(newCount);
      setLastIncrement(new Date().toLocaleString());
      localStorage.setItem(`count_${address}`, newCount.toString());

      // Set cooldown 5 jam
      const cooldownMs = 5 * 60 * 60 * 1000;
      const endTime = Date.now() + cooldownMs;
      localStorage.setItem(`cooldown_${address}`, endTime.toString());

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

      alert(`✅ Sukses! Tx: ${txHash.substring(0,8)}...`);
    } catch (e) {
      alert("❌ Gagal: " + (e.message || "Transaksi dibatalkan"));
      setCooldown(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>🍩 Donut Counter</h1>
        <p>Loading Warpcast Wallet...</p>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>🍩 Donut Counter</h1>
        <p style={{ color: 'red', marginBottom: '15px' }}>
          ❌ Kamu tidak berada di jaringan <b>Base</b>
        </p>
        <button 
          onClick={switchToBase}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#007aff', 
            color: 'white', 
            border: 'none', 
            borderRadius: 8, 
            fontSize: '1em'
          }}
        >
          Switch to Base Network
        </button>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '15px' }}>
          Donut Counter hanya berjalan di jaringan Base.
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>🍩 Donut Counter</h1>
        <p>Buka di <b>Warpcast App</b> untuk menggunakan Warpcast Wallet.</p>
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
          <p style={{ fontSize: '0.8em', color: '#666', margin: 0 }}>
            FID: {fid} • {address.slice(0,6)}...{address.slice(-4)}
          </p>
        </div>
        <div style={{ fontSize: '0.8em', color: '#007a33', fontWeight: 'bold' }}>
          ✅ Base
        </div>
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
        <p style={{ fontSize: '4em', fontWeight: 'bold', color: '#f59e0b', margin: '10px 0' }}>
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
          }}
        >
          {cooldown ? `Wait ${timeLeft}` : '+1 Donut (Swap on Base)'}
        </button>
        <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px', textAlign: 'center' }}>
          Transaksi akan dikonfirmasi di Warpcast App
        </p>
      </div>
    </div>
  );
}
