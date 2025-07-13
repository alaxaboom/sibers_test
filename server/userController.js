const User = require("./userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secret = process.env.SESSION_SECRET;

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, secret, {
    expiresIn: "1h",
  });
};

exports.register = async (req, res) => {
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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error("Invalid credentials");
    }
    const token = generateToken(user);
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "username",
      order = "ASC",
    } = req.query;
    const offset = (page - 1) * limit;
    const users = await User.findAndCountAll({
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: offset,
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);

    const userData = req.body;
    if (decoded.username === "admin" && !userData.password) {
      userData.password = "1";
    }

    const user = await User.create(userData);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) throw new Error("User not found");
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) throw new Error("User not found");
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
