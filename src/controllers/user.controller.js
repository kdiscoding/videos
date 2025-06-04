import { asyncHandler } from "../utiles/asyncHandler.js";
import {apiError} from "../utiles/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utiles/cloudinary.js"
import { apiResponse } from "../utiles/apiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
  // get the user details from frontend 
  // validation (not empty) 
  // check if user already exits, check for images, upload them on cloudinary
  // create user object save in db(entery in db)
  // remove password and refresh token field from response 
  // check for user creation and return response

  const { fullname,email,username,password } = req.body
  console.log(email)

  // validations all fields are required 
if([fullname, email, username, password].some((field) => field?.trim() === "")){
  throw new apiError(400,"all fields are required")
}

// validation if user already exits or not 

const existedUser = await User.findOne({ $or: [{ username }, { email }]})
if(existedUser){
  throw new apiError(409,"User Found in records")
}

const avatarLocalPath = req.files?.avatar[0]?.path 
// const coverImageLocalPath = req.files?.coverImage[0]?.path

let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  coverImageLocalPath = req.files.coverImage[0].path
}

if(!avatarLocalPath){
  throw new apiError(400,"Avatar file is required!")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
  throw new apiError(400,"Avatar file is required!")
}
// save data in db
const user = await User.create({
  fullname,
  avatar: avatar.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username: username.toLowerCase()
})

const createdUser = await User.findById(user._id).select("-password -refreshToken")

if (!createdUser) {
  throw new apiError(500,"Something went wrong while registering the user")
}

return res.status(201).json(
  new apiResponse(200, createdUser, "User registered successfuly")
)

})

export  { registerUser }

