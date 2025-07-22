import { Router } from "express";
import {
  register,
  login,
  getAll,
  getById,
  create,
  update,
  deleteUser,
} from "./userController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", deleteUser);

export default router;
