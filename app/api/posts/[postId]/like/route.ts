import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { NextRequest, NextResponse } from "next/server";

// GET /api/posts/[postId]/like → Get all likes
export async function GET(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  try {
    await connectDB();

    const postId = context.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json(post.likes, { status: 200 });
  } catch (error) {
    console.error("Error getting likes:", error);
    return NextResponse.json({ error: "Error occurred" }, { status: 500 });
  }
}

// POST /api/posts/[postId]/like → Like a post
export async function POST(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  try {
    await connectDB();

    const { userId } = await req.json();
    const postId = context.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    await post.updateOne({ $addToSet: { likes: userId } });

    return NextResponse.json({ message: "Liked." }, { status: 200 });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Error occurred" }, { status: 500 });
  }
}
