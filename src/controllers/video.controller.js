import { asyncHandler } from  "../utils/asyncHandler.js";
 import { ApiError } from "../utils/ApiError.js";
 import {uploadOnCloudinary} from "../utils/cloudinary.js";
 import { ApiResonse } from "../utils/ApiResponse.js";
 import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";


// const videoUpload = asyncHandler(async(req,res)=>{
//     const {title,duration,description}=req.body
//     let videoFileLocalPath;
//     if (req.files && Array.isArray(req.files.
//        videoFile) && req.files.videoFile.length>0) {
//           videoFileLocalPath = req.files.videoFile[0].path
//     }
//     if (!videoFileLocalPath) {
//        throw new ApiError(400, "videoFile is required")
 
//       }
    
//       const videoFile  = await uploadOnCloudinary(videoFileLocalPath)
//       if (!videoFile) {
//        throw new ApiError(400,  "video is required")
//       }
//     const video = await Video.create({
//        videoFile: videoFile.url,
//        duration: duration,
//       description: description,
//        title:title ,
//        owner:req.user._id
       
 
//     });



//     const createdVideo = await Video.findById(video._id)
 
//  if (!createdVideo) {
//     throw new ApiError(500, "went wrong")
    
//  }  
 
//  console.log(owner)

//  return res.status(201).json(
//     new ApiResonse(200,createdVideo,"video uplaoded Successfully")
//  )
 
//   })

const videoUpload = asyncHandler(async (req, res) => {
    const { title, duration, description ,objectId} = req.body;
    const owner=await User.findOne(objectId)

    let videoFileLocalPath;


    // Check if the video file is uploaded
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files.videoFile[0].path; // Get the local path of the video file
    }

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFile is required");
    }

    // Upload video to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if (!videoFile) {
        throw new ApiError(400, "video upload failed");
    }

    // Create a new video document
    const video = await Video.create({
        videoFile: videoFile.url,
        duration: duration,
        description: description,
        title: title,
        owner:owner._id
    });


    const createdVideo = await Video.findById(video._id) 
    console.log(createdVideo)

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while fetching the created video")
    }
    console.log(objectId)

    return res.status(201)
   // .json(
    //    new ApiResonse(200, "Video uploaded successfully")
    //);
});


  const getOwnerDetails = asyncHandler(async(req,res)=>{

    
   return res
   .status(200)
   .json(new ApiResonse(200, video[0], "Fetched Successfully"))
   

})
export {videoUpload,getOwnerDetails}