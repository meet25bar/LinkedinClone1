import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { NextRequest, NextResponse } from "next/server";

// Correct type for route handler
export async function GET(
  req: NextRequest,
  context: { params: { postId: string } }
) {
  try {
    await connectDB();

    const { postId } = context.params;

    const post = await Post.findById(postId).populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post.comments, { status: 200 });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return NextResponse.json({ error: "Error occurred" }, { status: 500 });
  }
}
