export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" });
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

  try {
    const response = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query getProductByBarcode($barcode: String!) {
            productVariants(first: 1, query: $barcode) {
              edges {
                node {
                  id
                  title
                  barcode
                  image {
                    src
                  }
                  product {
                    id
                    title
                    images(first: 1) {
                      edges {
                        node {
                          src
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { barcode },
      }),
    });

    const result = await response.json();
    const variant = result.data?.productVariants?.edges?.[0]?.node;

    if (!variant) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = {
      title: variant.product.title,
      image: variant.product.images.edges?.[0]?.node?.src || null,
      bin: null,
      productId: variant.product.id,
      variantId: variant.id,
    };

    res.status(200).json(product);
  } catch (error) {
    console.error("Shopify lookup error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
