import mongoose, { Document } from "mongoose";

export interface TaskDocument extends Document {
  description: string;
  completed: boolean;
  owner: mongoose.Types.ObjectId;
}

export const taskSchema = new mongoose.Schema<TaskDocument>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const taskModel = mongoose.model<TaskDocument>("Task", taskSchema);
