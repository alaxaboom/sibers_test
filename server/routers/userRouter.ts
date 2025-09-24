import { Router } from "express";
import {
  register,
  login,
  getAll,
  getCurrentUser,
  getById,
  create,
  update,
  deleteUser,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth"; // Новый import

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Protected routes
router.use(authenticate); // Применяем middleware ко всем ниже

router.get("/", getAll);
router.get("/me", getCurrentUser);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", deleteUser);

export default router;
