const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
  const header = req.header("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please authenticate" });
  }

  try {
    const token = header.slice("Bearer ".length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ error: "Please authenticate" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = auth;
