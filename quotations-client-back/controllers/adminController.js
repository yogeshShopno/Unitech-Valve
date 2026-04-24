const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.json({ token, message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logoutAdmin = (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin
};