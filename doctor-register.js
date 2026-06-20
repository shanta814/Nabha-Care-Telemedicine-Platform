import dbConnect from '../../../lib/db/mongodb';
import Doctor from '../../../lib/db/models/Doctor';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await dbConnect();
    console.log('Connected to MongoDB');
    const { name, email, password, specialization, phoneNumber } = req.body;

    // Validate input
    if (!name || !email || !password || !specialization || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    // Create new doctor
    const doctor = await Doctor.create({
      name,
      email,
      password,
      specialization,
      phoneNumber
    });

    // Remove password from response
    doctor.password = undefined;

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Send more detailed error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Error creating doctor account: ${error.message}`
      : 'Error creating doctor account';
      
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}