import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { unlinkFiles } from "../utils/unlinkFiles.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  let videoFileLocalPath;
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    videoFileLocalPath = req.files.videoFile[0].path;
  }
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.videoFile.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }
  if (!title?.length || !description?.length) {
    unlinkFiles([thumbnailLocalPath, videoFileLocalPath]);
    throw new ApiError(400, "All fields are required");
  }

  const thumbnailCloud = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFileCloud = await uploadOnCloudinary(videoFileLocalPath);

  if (!videoFileCloud) {
    throw new ApiError(400, "Video file is required");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: videoFileCloud?.url || "",
    duration: videoFileCloud?.duration,
    thumbnail: thumbnailCloud?.url || "",
    owner: req.user?._id,
  });
  const createdVideo = await Video.findById(video._id);
  return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Successfully uploaded."));
});

export { publishVideo };
