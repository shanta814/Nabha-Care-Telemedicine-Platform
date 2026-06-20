import jwt from 'jsonwebtoken';
import Doctor from './models/Doctor';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use a proper secret from env variables

export const generateToken = (doctor) => {
  return jwt.sign(
    { 
      id: doctor._id,
      name: doctor.name,
      email: doctor.email 
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id).select('-password');
    return doctor;
  } catch (error) {
    return null;
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const doctor = await verifyToken(token);
    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.doctor = doctor;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};