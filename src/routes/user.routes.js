import { Router } from "express";
import {loginUser, logoutUser, refereshAccessToken, registerUser} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewar.js";


const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount: 1
    },{
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser)

router.route("/login").post(loginUser)

  
// secured routes
router.route("/logout").post( verifyJWT, logoutUser)
router.route("/refresh-token").post(refereshAccessToken)

export default router