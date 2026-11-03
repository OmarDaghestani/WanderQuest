const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");

const authController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
      });

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(201).json({ token });
    } catch (error) {
      console.error("Register error:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Server error" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const validPassword = await user.validatePassword(password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({ token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findByPk(req.user.id);

      if (email !== user.email) {
        const taken = await User.findOne({ where: { email } });
        if (taken) {
          return res.status(400).json({ error: "Email already in use" });
        }
        user.email = email;
        await user.save();
      }

      res.json({ id: user.id, email: user.email, preferences: user.preferences });
    } catch (error) {
      console.error("Update profile error:", error.message);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "Email already in use" });
      }
      res.status(500).json({ error: "Server error" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!(await user.validatePassword(currentPassword))) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: "Password updated" });
    } catch (error) {
      console.error("Change password error:", error.message);
      res.status(500).json({ error: "Server error" });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
      res.json(user);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = authController;



