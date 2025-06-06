import { asyncHandler } from "../utiles/asyncHandler.js";
import {apiError} from "../utiles/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utiles/cloudinary.js"
import { apiResponse } from "../utiles/apiResponse.js";

// generate tokens
const generateAccessAndRefreshTokens = async (userId) =>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // save in database
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {refreshToken, accessToken}

  } catch (error) {
    throw new apiError(500,error, "token creation failed")
  }
}
// registeration 
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

});
// login user
const loginUser = asyncHandler( async (req, res) => {
  // get data from req.body
  // username or email , find the user 
  // password check
  // referesh and access token
  // send cookie

  const {email,username, password} = req.body;

  if(!(username || email)){
    throw new apiError(400,"username or email is required!");
    
  }

  const user = await User.findOne({
    $or: [{username}, {password}]
  });

  if (!user) {
    throw new apiError(404,"User does not exist!");
    
  }
  // password checking
  const isPasswordMatched = await user.isPasswordCorrect(password);
  if(!isPasswordMatched){
    throw new apiError(401,"password is wrong")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new apiResponse(200, { user: loggedInUser, accessToken, refreshToken},
    "User logged in successfully")
  )

});

// logout user
const logoutUser = asyncHandler( async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    }},
    {
      new: true
    }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200, {}, "User Logged Out"))
})

export  { registerUser, loginUser, logoutUser }

