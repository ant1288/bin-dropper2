export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" });
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

  try {
    const response = await fetch(`https://${domain}/admin/api/2024-01/products.json?fields=id,title,images,variants`, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const products = data.products;

    const product = products.find((product) =>
      product.variants.some((variant) => variant.barcode === barcode)
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const variant = product.variants.find((v) => v.barcode === barcode);

    res.status(200).json({
      title: product.title,
      image: product.images[0]?.src || null,
      bin: variant?.metafield?.value || "Not set",
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}
