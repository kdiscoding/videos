import { apiError } from "../utiles/apiError";
import { asyncHandler } from "../utiles/asyncHandler";
import { jwt } from "jsonwebtoken"
import { User } from "../models/user.model";

export const veryfyJWT = asyncHandler( async(req, res, next) => 
  {
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 

      if(!token){
        throw new apiError(401,"Unauthorized request")
      }

      const decodedToken = jwt.veryfyJWT(token, process.env.ACCESS_TOKEN_SECRET)

      const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

      if(!user){
        throw new apiError(401,"Invalid Access Token")
      }
      // give access of user to req obj
      req.user = user 
      next()
    } catch (error) {
      throw new apiError(401, error?.message || "Invalid Access Token")
    }

})