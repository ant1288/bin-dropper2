export default async function handler(req, res) {
  const { barcode, bin } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" });
  }

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminToken = process.env.SHOPIFY_ADMIN_API_TOKEN;

  try {
    // Step 1: Find the variant using the barcode
    const variantRes = await fetch(`https://${storeDomain}/admin/api/2023-04/variants.json?barcode=${barcode}`, {
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json'
      }
    });

    const variantData = await variantRes.json();
    const variant = variantData.variants?.[0];

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    const productId = variant.product_id;

    // Step 2: Fetch the product details
    const productRes = await fetch(`https://${storeDomain}/admin/api/2023-04/products/${productId}.json`, {
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json'
      }
    });

    const { product } = await productRes.json();

    // Step 3: If a new bin is submitted, update the metafield
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

    return res.status(200).json({
      title: product.title,
      image: product.image?.src,
      bin: bin || "Not set"
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

}
