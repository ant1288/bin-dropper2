export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { barcode, bin } = req.body;

  if (!barcode || !bin) {
    return res.status(400).json({ error: 'Barcode and bin are required' });
  }

  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

  try {
    // Step 1: Search for product by barcode
    const searchRes = await fetch(`https://${shop}/admin/api/2024-01/products.json?fields=id,title,variants&presentment_prices=true`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await searchRes.json();
    const product = data.products.find((p) =>
      p.variants.some((v) => v.barcode === barcode)
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const variant = product.variants.find((v) => v.barcode === barcode);

    // Step 2: Set metafield
    const metafieldRes = await fetch(`https://${shop}/admin/api/2024-01/products/${product.id}/metafields.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metafield: {
          namespace: 'custom',
          key: 'bin_location',
          value: bin,
          type: 'single_line_text_field',
        },
      }),
    });

    if (!metafieldRes.ok) {
      const errorText = await metafieldRes.text();
      return res.status(500).json({ error: `Failed to save metafield: ${errorText}` });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}
