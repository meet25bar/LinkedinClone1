"use server";

import { Post } from "@/models/post.model";
import { IUser } from "@/models/User.Model";
import { currentUser } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "./db";
import { revalidatePath } from "next/cache";
import { Comment } from "@/models/comments.model";
import mongoose from "mongoose"; // ✅ Required for ObjectId casting
import { CloudinaryUploadResult } from "@/lib/types";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ✅ Create a post
export const createPostAction = async (formData: FormData) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const inputText = formData.get("inputText") as string;
  const file = formData.get("image") as File | null;

  const userDatabase: IUser = {
    firstName: user.firstName || "Meet",
    lastName: user.lastName || "Barot",
    userId: user.id,
    Profilephoto: user.imageUrl,
  };

  let imageUrl = "";

  if (file && typeof file === "object") {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {

      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });

    imageUrl = uploadResult.secure_url;
  }

  await Post.create({
    description: inputText,
    User: userDatabase,
    imageUrl: imageUrl,
  });

  revalidatePath("/");
};

// ✅ Get all posts with populated comments
export const getAllposts = async () => {
  await connectDB();
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
      });

    if (!posts) return [];
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    return error;
  }
};

// ✅ Delete post
export const deletePostAction = async (formData: FormData) => {
  await connectDB();

  const postId = formData.get("postId") as string;
  if (!postId) throw new Error("Post ID is missing");

  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  if (post.User.userId !== user.id) {
    throw new Error("Unauthorized deletion attempt");
  }

  try {
    await Post.deleteOne({ _id: postId });
    revalidatePath("/");
  } catch (error) {
    throw new Error("An error occurred while deleting the post",error);
  }
};

// ✅ Create a comment (fixed)
export const createCommentAction = async (postId: string, formData: FormData) => {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user) throw new Error("Not authenticated");

    const inputText = formData.get("inputText") as string;
    if (!inputText) throw new Error("Empty comment");
    if (!postId) throw new Error("Post ID is required");

    const userDatabase: IUser = {
      firstName: user.firstName || "Meet",
      lastName: user.lastName || "Barot",
      userId: user.id,
      Profilephoto: user.imageUrl,
    };

    const post = await Post.findById({ _id: postId });
    if (!post) throw new Error("Post not found");

    const comment = await Comment.create({
      textMessage: inputText,
      user: userDatabase,
    });

    // ✅ Fix: cast _id as ObjectId
    post.comments?.push(comment._id as mongoose.Types.ObjectId);
    await post.save();

    revalidatePath("/");
  } catch (error) {
    console.error("Comment creation error:", error);
    throw new Error("Error occurred while posting comment");
  }
};
