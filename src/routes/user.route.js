import { Router } from "express";
import {
     getCurrentUser, 
     loginUser, 
     logOutUser, 
     refreshAcessToken, 
     registerUser,
     updateUserAvatar,
     updateUserCoverImage ,
     changeCurrrentPassword ,
     updateAccountDetails, 
     getUserChannelProfile,
     getWatchHistory
     
    } from "../controllers/user.controller.js";
    import { videoUpload } from "../controllers/video.controller.js";
    import { getOwnerDetails } from "../controllers/video.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(
    upload.fields([
        {name:"avatar",
            maxCount:1
        },
        { name:"coverImage",
            maxCount:1
        }, 
       
    ]),
   registerUser


)

router.route("/video-upload").post(
    upload.fields([
       {
        name:"videoFile",
        maxCount:1
       }
       
    ]),
    videoUpload
 
)
router.route("/owner").get(getOwnerDetails) 
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAcessToken)
//we are getting datad from params so use/c/:username beacuse we used username
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/logout").post(verifyJWT ,logOutUser)

router.route("/change-password").post(verifyJWT,changeCurrrentPassword)

router.route("/update-account-det").patch(verifyJWT ,updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar") ,updateUserAvatar)

router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage") ,updateUserCoverImage)

router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router;
