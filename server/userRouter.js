const { Router } = require("express");
const userController = require("./userController");

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/", userController.getAll);
router.get("/:id", userController.getById);
router.post("/", userController.create);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);

module.exports = router;
