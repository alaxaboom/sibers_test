import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./userModel";

const secret = process.env.SESSION_SECRET || "your-secret-key";

interface TokenPayload {
  id: number;
  username: string;
}

const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id, username: user.username }, secret, {
    expiresIn: "1h",
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, first_name, last_name, gender, birthdate } =
      req.body;
    const user = await User.create({
      username,
      password,
      first_name,
      last_name,
      gender,
      birthdate,
    });
    const token = generateToken(user);
    res.json({ token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(user);
    res.json({ token, username: user.username });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      sortBy = "username",
      order = "ASC",
    } = req.query as {
      page?: string;
      limit?: string;
      sortBy?: string;
      order?: "ASC" | "DESC";
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.findAndCountAll({
      order: [[sortBy as string, order as string]],
      limit: parseInt(limit),
      offset: offset,
      attributes: { exclude: ["password"] },
    });

    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, secret) as TokenPayload;
    const userData = req.body;

    if (decoded.username === "admin" && !userData.password) {
      userData.password = "1";
    }

    const user = await User.create(userData);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) throw new Error("User not found");

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) throw new Error("User not found");
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
