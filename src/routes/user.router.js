import { Router } from "express";
import { loginuser, logoutuser, refreshaccesstoken, registeruser } from "../controller/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.mideeleware.js";


const router = Router();

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }]),registeruser)

router.route("/login").post(loginuser)

router.route("/logout").post(verifyJWT,logoutuser)

router.route("/refresht").post(refreshaccesstoken)

export default router; 