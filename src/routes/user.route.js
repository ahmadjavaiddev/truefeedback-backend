import { Router } from "express";
import {
     getRandomUsers,
     login,
     register,
     search,
     validateUserToken,
     verifyUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/search").post(search);
router.route("/random").get(getRandomUsers);
router.route("/verify").post(verifyUser);
router.route("/verify/validate").post(validateUserToken);

export default router;
