import { useState } from "react";

export default function Home() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(`/api/lookup?barcode=${barcode}`);
    const data = await response.json();
    setProduct(data);
  }

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Bin Dropper</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Scan or enter barcode"
          style={{ padding: 10, width: 300 }}
        />
        <button type="submit" style={{ padding: 10, marginLeft: 10 }}>
          Look Up
        </button>
      </form>

      {product && (
        <div style={{ marginTop: 20 }}>
          <h2>{product.title}</h2>
          {product.image && <img src={product.image} width={100} />}
          <p>Bin: {product.bin || "Not set"}</p>
        </div>
      )}
    </main>
  );
}
