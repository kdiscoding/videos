import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

 // Configuration
 cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// upload file
const uploadOnCloudinary = async (localFilePath ) => {
  try {
      const uploadResult = await cloudinary.uploader.upload(localFilePath,{
      resource_type: "auto"
    })
    console.log("file is uploaded on cloudinary!! uploadResult: ", uploadResult);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath) //  remove locally saved temporary file  
    return null;
  }
}

export {uploadOnCloudinary}
