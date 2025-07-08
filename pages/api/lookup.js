export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode is required" });
  }

  return res.status(200).json({
    title: "Fake Product",
    image: "https://via.placeholder.com/100",
    bin: "A12",
  });
}
