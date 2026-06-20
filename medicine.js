export default function handler(req, res) {
  // Replace with real DB queries if needed
  res.status(200).json([
    { name: "Paracetamol", stock: 20 },
    { name: "Ibuprofen", stock: 15 }
  ]);
}
