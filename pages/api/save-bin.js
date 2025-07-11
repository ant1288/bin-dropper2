export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, bin } = req.body;

  if (!productId || !bin) {
    return res.status(400).json({ error: 'Missing product ID or bin value' });
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

  try {
    const metafieldRes = await fetch(`https://${domain}/admin/api/2024-01/products/${productId}/metafields.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
body: JSON.stringify({
  metafield: {
    namespace: 'custom',
    key: 'bin_locations', // ✅ match the key exactly
    value: bin,
    type: 'single_line_text_field',
  },
}),
