import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  removeFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
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

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "updatedAt",
    sortType = "desc",
  } = req.query;

  const userId = req.user?._id;
  const filterQuery = { owner: userId };
  if (query?.length) {
    const allQueries = query?.split(",");
    allQueries.forEach((element) => {
      const keyValue = element.split(":");
      filterQuery[keyValue[0]] = { $regex: ".*" + keyValue[1] + ".*" };
    });
  }
  const videos = await Video.find(filterQuery)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ [sortBy]: sortType });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        "Successfully retrieved all videos of the user"
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.find({ _id: videoId });
  if (video?.length <= 0) {
    throw new ApiError(400, "No such video found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Successfully retrieved the video"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const video = await Video.find({ _id: videoId, owner: req.user?._id });
  if (video.length !== 1) {
    throw new ApiError(
      400,
      "You are not authorized to update this video or there is no such video."
    );
  }
  let thumbnailUrl = video[0]?.thumbnail;
  let videoTitle = video[0]?.title;
  let videoDescription = video[0]?.description;
  let thumbnailLocalPath;
  if (req?.file) {
    thumbnailLocalPath = req?.file?.path;
    await removeFromCloudinary(thumbnailUrl);
    const newThumbnailCloud = await uploadOnCloudinary(thumbnailLocalPath);
    thumbnailUrl = newThumbnailCloud?.url;
  }
  if (title) {
    videoTitle = title;
  }
  if (description) {
    videoDescription = description;
  }
  const videoData = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: videoTitle,
        description: videoDescription,
        thumbnail: thumbnailUrl,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Successfully updated the video"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.find({ _id: videoId, owner: req.user?._id });
  if (video.length === 1) {
    await removeFromCloudinary(video[0]?.thumbnail);
    await removeFromCloudinary(video[0]?.videoFile);
  }
  const vid = await Video.deleteOne({ _id: videoId, owner: req.user?._id });
  if (vid.deletedCount === 0) {
    throw new ApiError(400, "No such video found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, vid, "Successfully deleted the video"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.find({ _id: videoId, owner: req.user?._id });
  if (video.length !== 1) {
    throw new ApiError(
      400,
      "You are not authorized to update this video or there is no such video."
    );
  }
  const publishedStatus = video[0].isPublished;
  const videoData = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !publishedStatus,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoData,
        "Successfully updated the published status"
      )
    );
});

export {
  publishVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
