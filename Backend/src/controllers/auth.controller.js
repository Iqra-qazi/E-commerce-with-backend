import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getJwtSecret } from "../utils/jwt.js";

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const jwtSecret = getJwtSecret();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    const userAlreadyExists = await userModel.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (userAlreadyExists) {
      return res.status(409).json({ message: "A user with that name or email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hash,
      role: "user",
    });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.cookie("token", token);
    return res.status(201).json({
      message: "User created successfully",
      user: toPublicUser(user),
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const jwtSecret = getJwtSecret();
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.cookie("token", token);
    return res.status(200).json({
      message: "User logged in successfully",
      user: toPublicUser(user),
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await userModel.findById(req.authUserId);

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { registerUser, loginUser, getCurrentUser };