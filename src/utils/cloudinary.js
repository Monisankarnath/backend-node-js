import { v2 as cloudinary } from "cloudinary";
import { unlinkFiles } from "./unlinkFiles.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been successfully uploaded.
    unlinkFiles([localFilePath]);
    return response;
  } catch (error) {
    unlinkFiles([localFilePath]); // remove the locally saved temporary file as the upload operation failed
  }
};
const removeFromCloudinary = async (url) => {
  try {
    if (!url) return;
    const splitUrl = url?.split("/");
    const publicId = splitUrl[splitUrl?.length - 1].split(".")[0];
    // remove file from cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    console.log("Cloudinary asset removal result =", result);
  } catch (error) {
    console.log("Error in asset removal from cloudinary");
  }
};

export { uploadOnCloudinary, removeFromCloudinary };
