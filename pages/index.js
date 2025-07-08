import { useState } from 'react';

export default function Home() {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState(null);
  const [bin, setBin] = useState('');
  const [status, setStatus] = useState('');

  const handleLookup = async () => {
    const res = await fetch(`/api/lookup?barcode=${barcode}`);
    const data = await res.json();
    if (data.error) {
      setProduct(null);
      setBin('');
      setStatus(data.error);
    } else {
      setProduct(data);
      setBin(data.bin || '');
      setStatus('');
    }
  };

  const handleSave = async () => {
    const res = await fetch('/api/save-bin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barcode, bin }),
    });

    const data = await res.json();
    if (data.success) {
      setStatus('Bin saved!');
    } else {
      setStatus(data.error || 'Error saving bin.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bin Dropper</h1>
      <input
        type="text"
        placeholder="Scan or enter barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        style={{ marginRight: '1rem' }}
      />
      <button onClick={handleLookup}>Look Up</button>

      {product && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{product.title}</h2>
          {product.image && <img src={product.image} alt="Product" width="100" />}
          <p>Current Bin: {product.bin || 'Not set'}</p>

          <input
            type="text"
            placeholder="Enter bin location"
            value={bin}
            onChange={(e) => setBin(e.target.value)}
            style={{ marginRight: '1rem' }}
          />
          <button onClick={handleSave}>Save Bin</button>
        </div>
      )}

      {status && <p style={{ marginTop: '1rem', color: 'green' }}>{status}</p>}
    </div>
  );
}
