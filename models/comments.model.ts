import mongoose, { Model, Document } from "mongoose";
import { IUser } from "./User.Model";

export interface IComment {
  textMessage: string;
  user: IUser;
}

export interface ICommentDocument extends IComment, Document {
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<ICommentDocument>(
  {
    textMessage: {
      type: String,
      required: true,
    },
    user: {
      userId: {
        type: String,
        required: true,
      },
      Profilephoto: {
        type: String,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

// ✅ Correct model name: "Comment", not "Post"
export const Comment: Model<ICommentDocument> =
  mongoose.models?.Comment || mongoose.model<ICommentDocument>("Comment", commentSchema);
