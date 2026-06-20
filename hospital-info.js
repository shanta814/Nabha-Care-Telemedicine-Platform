export default function handler(req, res) {
  // Replace with real DB queries if needed
  res.status(200).json({
    beds: [
      { hospital: "City Hospital", available: 5 },
      { hospital: "Nabha Medical", available: 2 }
    ],
    visitingHours: "10 AM to 8 PM"
  });
}
