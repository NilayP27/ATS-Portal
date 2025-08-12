const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// --- Signup ---
exports.signup = async (req, res) => {
  try {
    const { email, password, username, role, department, title } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      username,
      role: role || "Recruiter", // Default if not provided
      department,
      title
    });
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- Login ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Request Reset Code ---
exports.requestResetCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    await sendEmail(email, 'Your Reset Code', `Your reset code: ${code}`);
    res.json({ message: 'Reset code sent' });
  } catch (error) {
    console.error("Reset code error:", error);
    res.status(500).json({ message: 'Error sending reset code' });
  }
};

// --- Reset Password ---
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.resetCode !== code ||
      !user.resetCodeExpires ||
      Date.now() > user.resetCodeExpires
    ) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
