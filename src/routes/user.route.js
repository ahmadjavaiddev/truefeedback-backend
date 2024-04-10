import { Router } from "express";
import {
     getRandomUsers,
     login,
     register,
     search,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/search").post(search);
router.route("/random").get(getRandomUsers);

export default router;
