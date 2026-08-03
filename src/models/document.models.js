import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled-doc",
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    version: {
      type: Number,
      default: 1,
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
documentSchema.index({ owner: 1 });
documentSchema.index({ title: "text" });
const Document = mongoose.model("Document", documentSchema);
export default Document;
