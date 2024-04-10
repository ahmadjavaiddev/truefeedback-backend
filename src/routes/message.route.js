import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
     acceptMessage,
     createMessage,
     deleteMessage,
     generateMessages,
     getAcceptMessageStatus,
     getMessageStatus,
     getMessages,
} from "../controllers/message.controller.js";

const router = Router();

router.route("/create").post(createMessage);
router.route("/").get(verifyJWT, getMessages);
router.route("/delete/:messageId").delete(verifyJWT,deleteMessage);
router.route("/accept").post(verifyJWT, acceptMessage);
router.route("/userstatus").get(verifyJWT, getAcceptMessageStatus);
router.route("/userstatus/:username").get(getMessageStatus);
router.route("/generate").get(generateMessages);

export default router;
