'use client';

import { useState, useEffect } from 'react';

export default function DonutCounter() {
  const [address, setAddress] = useState(null);
  const [count, setCount] = useState(0);
  const [ethAmount, setEthAmount] = useState("0.001");
  const [loading, setLoading] = useState(false);

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
    } catch (e) {
      console.error("Gagal load count:", e);
    }
  };

  const increment = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const valueWei = BigInt(Math.floor(parseFloat(ethAmount) * 1e18)).toString(16);
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
      loadCount(address);
    } catch (e) {
      alert("❌ Gagal: " + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2em', color: '#f59e0b' }}>🍩 Donut Counter</h1>
      
      {!address ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={connect} style={{ padding: '12px 24px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontSize: '1.1em' }}>
            Connect Wallet (Base)
          </button>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: 10 }}>
            Pastikan jaringan Base aktif di MetaMask
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p><b>Alamat:</b> {address.slice(0,6)}...{address.slice(-4)}</p>
          <p style={{ fontSize: '2.5em', margin: '20px 0', color: '#f59e0b' }}>🍩 {count}</p>
          
          <div style={{ margin: '20px 0' }}>
            <label>ETH untuk kirim (≈1 Donut): </label>
            <input
              type="number"
              step="0.0001"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              style={{ padding: '8px', margin: '0 10px', width: '100px' }}
            />
          </div>
          
          <button 
            onClick={increment} 
            disabled={loading}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: loading ? '#ccc' : '#f59e0b', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              fontSize: '1.1em',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Mengirim...' : '+1 Donut (Swap)'}
          </button>
          
          <p style={{ fontSize: '0.85em', color: '#666', marginTop: 20 }}>
            Setiap klik akan menukar ETH ke Donut token via Uniswap.<br/>
            Pastikan kamu punya <b>ETH di jaringan Base</b>.
          </p>
        </div>
      )}
    </div>
  );
}
