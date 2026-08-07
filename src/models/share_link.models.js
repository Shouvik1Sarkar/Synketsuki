import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["viewer"],
      default: "viewer",
      required: true,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// shareLinkSchema.index({ token: 1 }, { unique: true });
// shareLinkSchema.index({ document: 1 });

const ShareLink = mongoose.model("ShareLink", shareLinkSchema);

export default ShareLink;
