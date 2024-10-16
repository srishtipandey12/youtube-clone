 import { asyncHandler } from  "../utils/asyncHandler.js";
 import { ApiError } from "../utils/ApiError.js";
 import { User } from "../models/user.model.js";
 import {uploadOnCloudinary} from "../utils/cloudinary.js";
 import { ApiResonse } from "../utils/ApiResponse.js";
 import jwt from "jsonwebtoken";
import mongoose from  "mongoose"
//import TokenExpiredError from "jsonwebtoken";
 //methods
 const generateAcessAndRefreshToken = async(userId)=>
 {
try {
    const user = await User.findById(userId)
    const acessToken =  user.generateAcessToken()
     const refreshToken = user.generateAcessToken()
     user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})
      return {acessToken , refreshToken}
} catch (error) {
   throw new ApiError(500, "Something went wrong while geinerating refresh ans access token")
   
}
 }
 const registerUser = asyncHandler(async(req,res) =>{
   // get user details according to datta models
   //validation - not empty
   // check if user alearady rexist
   // check for images , check fpr avatar
// uplaod them to cloudinary for avatar
// ctreate user object-- entry in db
// remove  passwordand refresh token field from response
//check user craetkon
//return response 

const {fullName, email,username, password} = req.body
// console.log("email", email)

if(
[fullName, email, username, password].some((field) =>
    field?.trim()===" ")
){
throw new ApiError(400, "All fields are required")
}
 const existedUser  =  await User.findOne({
    $or:[{ username },{ email }]

 }

)
 if(existedUser){

   throw new ApiError(409,"User with email or username already exists")
}


console.log(req.files);

  const avatarLocalPath = await req.files?.avatar[0]?.path;

  //const coverImageLocalPath = await req.files?.coverImage[0]?.path;
let coverImageLocalPath;
if (req.files && Array.isArray(req.files.
   coverImage) && req.files.coverImage.length>0) {
      coverImageLocalPath = req.files.coverImage[0].path
   
}

  if (!avatarLocalPath) {
   throw new ApiError(400, "Avatar is required")
  }
 const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage  = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {
   throw new ApiError(400,  "Avatar is required")
  }
  const user = await User.create({
    fullName:fullName, 
   avatar: avatar.url,
   coverImage:coverImage?.url|| "",
   email: email,
   password : password,
   username:username
  });
  
  console.log(user);

  //check wether user is null or not
   const createdUser= await User.findById(user._id).select(
      "-password -refreshToken" 
   )

if(!createdUser){
   throw new ApiError(500 , "SOMETHING WENT WRONG WHILE REGISTERING USER " )
}

// we need api respponse file to send response
 
return res.status(201).json(
   new ApiResonse(200,createdUser, "User registered Successfully")
)
})


 const videoUpload = asyncHandler(async(req,res)=>{
   const {title,duration,description}=req.body
   let videoFileLocalPath;
   if (req.files && Array.isArray(req.files.
      videoFile) && req.files.videoFile.length>0) {
         videoFileLocalPath = req.files.videoFile[0].path
   }
   if (!videoFileLocalPath) {
      throw new ApiError(400, "videoFile is required")

     }
   
     const videoFile  = await uploadOnCloudinary(videoFileLocalPath)
     if (!videoFile) {
      throw new ApiError(400,  "video is required")
     }
   const video = await Video.create({
      videoFile: videoFile.url,
      duration: duration,
     description: description,
      title:title 
      

   });
   const createdVideo = await Video.findById(video._id)

   console.log(createdVideo);
if (!createdVideo) {
   throw new ApiError(500, "went wrong")
   
}  


return res.status(201).json(
   new ApiResonse(200,createdVideo,"video uplaoded Successfully")
)

 })
const loginUser = asyncHandler(async(req,res) =>{
   //req body for data
   //username or email exist
   //find user if exist
   //give error if not 
   // if user found then password check
   //  password wtong then send  message check password
   //acess and refresh Token 
//send cookies 

const { email, username,password }= req.body
if(!(username||email)){
   throw new ApiError(400, "username or password is required")
}
 const user = await User.findOne({
   $or:[{username},{email}]
})
if (!user) {
   throw new ApiError(401, "Invalid user credentials")
}
const isPasswordValid = await user.isPasswordCorrect(password)
if (!isPasswordValid) {
   throw new ApiError(401, "Invalid user credentials")
}

// calling method of access and refrsssh token
  const {acessToken,refreshToken} = await generateAcessAndRefreshToken(user._id)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  //sending reesh token to user in cookies
  const options = {
   httpOnly: true,
   secure:true
  }
  return res.status(200)
  .cookie("acessToken", acessToken, options)
  .cookie("refreshToken", refreshToken,options)
  .json(
   new ApiResonse(
      200,
      {
         user:loggedInUser, acessToken,refreshToken
      },
      "User Logged In succesfully"
   )
  )

})

const logOutUser = asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
   req.user._id,{
      $set:{
         refreshToken:1
      }
   },
   {
      new:true
   }

)
const options = {
   httpOnly: true,
   secure:true
  }
  return res.status(200)
  .clearCookie("acessToken",options)
  .clearCookie("refreshtoken",options)
  .json(new ApiResonse(200,{},"User Logged Out Succesfully"))
})

const refreshAcessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken =  req.cookies.refreshToken|| req.body.refreshToken
if (!incomingRefreshToken) {
   throw new ApiError(401, "unathorized request")
}
//verification of incomingRereshToken
  try {
    const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.ACCESS_TOKEN_SECRET,process.env.ACCESS_TOKEN_EXPIRY
 )
  const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401, "Invalid refresh token")
  }
 if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used")
 }
 const options = {
    httpOnly:true,
    secure:true
 } 
  const{acessToken,newRefreshToken} = await generateAcessAndRefreshToken(user._id)
  return res.status(200)
  .cookie("acessToken",acessToken,options)
  .cookie("newRefreshToken",newRefreshToken,options)
  .json(
    new ApiResonse(
       200,
       {acessToken,refreshToken: newRefreshToken},
       "Acess Token refreshed successfully"
    )
  )
 }
 catch (error) {
   throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

const changeCurrrentPassword = asyncHandler(async(req,res)=>{
   

      const {oldPassword, newPassword}= req.body
      // if (newPassword !==confirmPassword) {
      //    throw new ApiError(401, "passwords donot match")
      // }
      
      const user = await User.findById(req.user?._id)

      const isPasswordCorrect =  await user.
      isPasswordCorrect(oldPassword)

      if (!isPasswordCorrect) {
         throw new ApiError(400, "Invalid old password")

      }
      
      user.password = newPassword
       await user.save({validateBeforeSave:false})

return res
.status(200)
.json(new ApiResonse(200, {}, "Password changed succesfully"))
   
})
//get current user
const getCurrentUser = asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json( new ApiResonse (200, req.user,"current user fetched successfully"))
})
//how to change details of user
const updateAccountDetails = asyncHandler(async(req,
   res) => {
const {fullName,email} = req.body
if (!fullName && !email ) {
   throw new ApiError(400, "All felds are required")
}
const user = await User.findByIdAndUpdate(
   req.user?._id,
   {
$set: { fullName,email}
   },{new:true}
).select("-password")

return res
.status(200)
.json(new ApiResonse(200,user, "Account details updated succesfully"))


}) 
const updateUserAvatar  = asyncHandler(async(req,
   res)=>{
      const avatarLocalPath = req.file?.path
      if (!avatarLocalPath) {
         throw new ApiError(400, "Avatar is missing")
      }
      const avatar = await uploadOnCloudinary(avatarLocalPath)

      if (!avatar.url) {
   throw new ApiError(400, "Error while uploading avatar on cloudinary")
}

const user = await User.findByIdAndUpdate(
 req.user?._id,
 {
   $set:{
   avatar: avatar.url

   } 
},
 {new:true}).select("-password")
 return res
 .status(200)
   .json( new ApiResonse(200,user ,"Avatar updated succesfully" ))
                                                                           
})

const updateUserCoverImage  = asyncHandler(async(req,
   res)=>{
      const coverImageLocalPath = req.file?.path
      if (!coverImageLocalPath) {
         throw new ApiError(400, "Cover Image File is missing")
      }
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)
if (!coverImage.url) {
   throw new ApiError(400, "Error while uploading cover image on cloudinary")
}
 const user = await User.findByIdAndUpdate(
       req.user?._id,
{ $set:{ coverImage: coverImage.url}},
{new:true})
.select("-password")
return res
.status(200)
.json( new ApiResonse (200,user,"cover image succesfully"))

})
const getUserChannelProfile = asyncHandler(async(req,res)=>
{

const {username}= req.params  // we rae using params beacuse we want data from url s

if(!username?.trim()){  //we will useu trime beacuse we want onlyy username 

   throw new ApiError(400, "Username is missing")
}

//we will use pipelne aggregaton operator match to find the matching id of username

const channel = await User.aggregate([
   {
      $match:{
         username: username
      }
   },
   {//we have found the subcribers of channel's person username
      $lookup:{
         from:"subscriptions",
         localField :_id,
         foreignField: "channel",
         as:"subscribers"
      }
   },
   {
      //ab hum ye pta krenge ki channel wale ne kitno ko subscribe raka hai
   $lookup:
   {

      from:"subscriptions",
      localField :_id,
      foreignField: "subscribers",
      as:"subscribedTo"
   }
   },
   {
      // now for count, we need to add additional field to existing field
      $addFields:{
         subscribersCount:{
            $size:"$subscribers"
         },
         channelsSubcribedToCount:{
            $size:"$subscribedTo"
         },
         // we will give message to frontend to givesubcribe button trure false result
          isSubscribed:{
            $cond:{//in used to see the data present in object or array
               if:{$in:[req.user?._id, "$subscribers.subscriber"] },
                then: true,
                else:false
            }  
          } 
         }
      },
      {   //now we will use another pipeline name project
          // it will project only selected things
         $project:
         {
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubcribedToCount : 1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1
         }
      }
   ])
   if(!channel?.length){
      throw new ApiError(404, "Channel doesn't exist")
   }
    return res
    .status(200)
    .json(
      new ApiResonse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{

const user = await User.aggregate([
   {
      $match:{
         _id: new  mongoose.Types.ObjectId(req.user._id)
      }
   } ,
   {
      $lookup:{
         from:"videos",
         localField:"watchHistory",
         foreignField:"_id",
         as:"watchHistory",
         pipeline:[{
               $lookup:{
                  from:"users",
                  localField:"owner",
                  foreignField: "_id",
                  as :"owner",
                  pipeline:[{
                     $project:{
                        fullName:1,
                        username:1,
                        avatar:1

                     }
                  } ]
               }
            },
            {
            $addFields:{
             owner:{
             $first:"$owner"
                  }
                        }
            }]
      }
   }

])
console.log(user)
console.log(foreignField)
console.log(_id)

return res
.status(200)
.json(new ApiResonse(200, user[0].watchHistory, "Watch History Fetched Successfully"))


})


 export {registerUser, 
   loginUser,
   logOutUser,
   refreshAcessToken,
   changeCurrrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory,
   
 }