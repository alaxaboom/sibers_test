import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../models/userModel";
import logger from "../utils/logger";

const secret = process.env.SESSION_SECRET || "your-secret-key";

interface TokenPayload {
  id: number;
  username: string;
  role: string; // Добавлено role
}

interface AuthRequest extends Request {
  user?: TokenPayload;
}

const generateToken = (user: User): string => {
  logger.debug(`Generating token for user ID: ${user.id}`);
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role || "user" },
    secret,
    {
      expiresIn: "1h",
    }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Starting user registration process");
    const {
      username,
      password,
      email,
      first_name,
      last_name,
      gender,
      birthdate,
    } = req.body;

    logger.debug(
      `Registration attempt for username: ${username}, email: ${email}`
    );

    if (!username || !password || !email) {
      const errorMsg = "Username, password and email are required";
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    logger.debug("Creating new user in database");
    const user = await User.create({
      username,
      password,
      email,
      first_name: first_name || null,
      last_name: last_name || null,
      gender: gender || null,
      birthdate: birthdate ? new Date(birthdate) : null,
      role: "user", // Всегда 'user' при регистрации
    });

    logger.info(`User created successfully - ID: ${user.id}`);
    const token = generateToken(user);

    logger.debug("Sending successful registration response");
    res.json({
      token,
      username: user.username,
      birthdate: user.birthdate,
    });
  } catch (error: any) {
    logger.error(`Registration failed: ${error.message}`, { error });
    res.status(400).json({ error: error.message });
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    logger.info("Fetching current user data");
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    logger.debug(`Fetching current user with ID: ${req.user.id}`);
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      const errorMsg = "User not found";
      logger.warn(errorMsg);
      res.status(404).json({ error: errorMsg });
      return;
    }

    logger.info(`Successfully fetched current user - ID: ${user.id}`);
    res.json(user);
  } catch (error: any) {
    logger.error(`Failed to get current user: ${error.message}`, { error });
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    logger.info(`Login attempt for username: ${username}`);

    logger.debug(`Looking up user: ${username}`);
    const user = await User.findOne({ where: { username } });

    if (!user) {
      const errorMsg = "User not found";
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    logger.debug("Comparing password hashes");
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      const errorMsg = "Invalid password";
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    const token = generateToken(user);
    logger.info(`Successful login for user ID: ${user.id}`);

    res.json({ token, username: user.username });
  } catch (error: any) {
    logger.error(`Login failed: ${error.message}`, { error });
    res.status(400).json({ error: error.message });
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    logger.info("Fetching all users");
    const {
      page = "1",
      limit = "10",
      sortBy = "username",
      order = "ASC",
      search,
      gender,
      role: roleFilter, // Переименовано чтобы не конфликтовать
    } = req.query as {
      page?: string;
      limit?: string;
      sortBy?: string;
      order?: "ASC" | "DESC";
      search?: string;
      gender?: string;
      role?: string;
    };

    logger.debug(`Pagination parameters - page: ${page}, limit: ${limit}`);
    logger.debug(`Sorting parameters - sortBy: ${sortBy}, order: ${order}`);
    logger.debug(
      `Filters - search: ${search}, gender: ${gender}, role: ${roleFilter}`
    );

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where: any = {};

    if (gender) where.gender = gender;
    if (roleFilter) where.role = roleFilter;
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    logger.debug(`Calculated offset: ${offset}`);
    const users = await User.findAndCountAll({
      where,
      order: [[sortBy as string, order as string]],
      limit: parseInt(limit),
      offset: offset,
      attributes: { exclude: ["password"] },
    });

    logger.info(
      `Fetched ${users.count} users total, returning ${users.rows.length} in this page`
    );
    res.json(users);
  } catch (error: any) {
    logger.error(`Failed to fetch users: ${error.message}`, { error });
    res.status(400).json({ error: error.message });
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    logger.info(`Fetching user by ID: ${userId}`);

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      const errorMsg = `User not found with ID: ${userId}`;
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    logger.info(`Successfully fetched user ID: ${userId}`);
    res.json(user);
  } catch (error: any) {
    logger.error(`Failed to fetch user by ID: ${error.message}`, { error });
    res.status(400).json({ error: error.message });
  }
};

export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    logger.info("Starting user creation process");
    if (!req.user || req.user.role !== "admin") {
      const errorMsg = "Only admins can create users";
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    logger.debug(`Admin user (${req.user.username}) creating new user`);

    const userData = req.body;
    if (!userData.password) {
      logger.debug("Admin creating user with default password");
      userData.password = "1";
    }

    const user = await User.create(userData);
    logger.info(`User created successfully - ID: ${user.id}`);

    res.json(user);
  } catch (error: any) {
    logger.error(`User creation failed: ${error.message}`, { error });
    res.status(400).json({ error: error.message });
  }
};

export const update = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    logger.info(`Starting update for user ID: ${userId}`);
    logger.debug(`Update data: ${JSON.stringify(req.body)}`);

    if (
      !req.user ||
      (req.user.id !== parseInt(userId) && req.user.role !== "admin")
    ) {
      const errorMsg = "Unauthorized to update this user";
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    const [updated] = await User.update(req.body, {
      where: { id: userId },
    });

    if (!updated) {
      const errorMsg = `User not found with ID: ${userId}`;
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    logger.debug(`Fetching updated user data for ID: ${userId}`);
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    logger.info(`Successfully updated user ID: ${userId}`);
    res.json(updatedUser);
  } catch (error: any) {
    logger.error(`User update failed: ${error.message}`, { error });
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    logger.info(`Attempting to delete user ID: ${userId}`);

    if (!req.user || req.user.role !== "admin") {
      const errorMsg = "Only admins can delete users";
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    const deleted = await User.destroy({ where: { id: userId } });

    if (!deleted) {
      const errorMsg = `User not found with ID: ${userId}`;
      logger.warn(errorMsg);
      throw new Error(errorMsg);
    }

    logger.info(`Successfully deleted user ID: ${userId}`);
    res.json({ success: true });
  } catch (error: any) {
    logger.error(`User deletion failed: ${error.message}`, { error });
    res.status(400).json({ error: error.message });
  }
};
