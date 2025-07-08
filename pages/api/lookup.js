export default async function handler(req, res) {
  const { barcode, bin } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" });
  }

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminToken = process.env.SHOPIFY_ADMIN_API_TOKEN;

  try {
    // 1. Look up the product using the barcode
    const productRes = await fetch(`https://${storeDomain}/admin/api/2023-04/products.json?fields=id,title,variants,image&barcode=${barcode}`, {
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json'
      }
    });

    const productData = await productRes.json();
    const product = productData.products[0];

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // If `bin` is present in query, update metafield
    if (bin) {
      await fetch(`https://${storeDomain}/admin/api/2023-04/metafields.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metafield: {
            namespace: 'custom',
            key: 'bin_location',
            value: bin,
            type: 'single_line_text_field',
            owner_id: product.id,
            owner_resource: 'product'
          }
        })
      });
    }

    // Return product info
    return res.status(200).json({
      title: product.title,
      image: product.image?.src,
      bin: bin || "Not set"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
