/**
    POST   /share-links/:documentId
    GET    /share-links/:token
    PATCH  /share-links/:id
    DELETE /share-links/:id
    GET    /share-links/document/:documentId
 */

import crypto from "crypto";
import DocumentMember from "../models/docsMember.models.js";
import Document from "../models/document.models.js";
import ShareLink from "../models/share_link.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";
import { CLIENT_URL } from "../../config/env.config.js";

function generate_token() {
  const token = crypto.randomBytes(32).toString("hex");

  const hashed_token = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
  return { token, hashed_token, expiresAt };
}

export const create_share_url = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  const document = await Document.findById(id);
  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  const documentMember = await DocumentMember.findOne({
    document: document._id,
    user: user._id,
  });

  if (!documentMember) {
    throw new ApiError(403, "You are not a member of this document.");
  }
  if (!["owner", "admin"].includes(documentMember.role)) {
    throw new ApiError(
      403,
      "You do not have permission to invite collaborators.",
    );
  }

  const { token, hashed_token, expiresAt } = generate_token();

  const share_link = await ShareLink.create({
    document: document._id,
    token: hashed_token,
    expiresAt,
    createdBy: user._id,
  });

  if (!share_link) {
    throw new ApiError(500, "share link NOT CREATED.");
  }

  const url = `${CLIENT_URL}/share/${token}`;

  return res.status(201).json(new ApiResponse(201, url, "Share Link created."));
});

export const access_share_url = asyncHandler(async (req, res) => {
  const user = req.user;

  const { token } = req.params;

  if (!token) {
    throw new ApiError(404, "Token not found.");
  }

  const hashed_token = crypto.createHash("sha256").update(token).digest("hex");

  const share_url = await ShareLink.findOne({
    token: hashed_token,
    expiresAt: { $gt: Date.now() },
  });

  if (!share_url) {
    throw new ApiError(404, "Share link is invalid or has expired.");
  }

  if (share_url.isRevoked) {
    throw new ApiError(403, "Invalid URL.");
  }
  const alreadyExists = await DocumentMember.findOne({
    document: share_url.document,
    user: user._id,
  });

  if (alreadyExists) {
    throw new ApiError(409, "You are a member already.");
  }

  const documentMember = await DocumentMember.create({
    user: user._id,
    document: share_url.document,
    role: share_url.role,
    invitedBy: share_url.createdBy,
  });

  if (!documentMember) {
    throw new ApiError(500, "Failed to register you.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { documentMember, share_url }, "User accepted."),
    );
});

export const revoke_share_url = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "ID is required.");
  }

  const share_url = await ShareLink.findById(id);

  if (!share_url) {
    throw new ApiError(404, "URL not found.");
  }

  const documentMember = await DocumentMember.findOne({
    document: share_url.document,
    user: user._id,
  });

  if (!documentMember) {
    throw new ApiError(403, "You can not access this.");
  }

  if (!["owner", "admin"].includes(documentMember.role)) {
    throw new ApiError(403, "You are not authorized.");
  }

  if (share_url.isRevoked) {
    share_url.isRevoked = false;
  } else {
    share_url.isRevoked = true;
  }
  const message = share_url.isRevoked
    ? "Share link revoked."
    : "Share link restored.";

  await share_url.save();

  return res.status(200).json(new ApiResponse(200, share_url, message));
});
export const delete_share_url = asyncHandler(async (req, res) => {
  const user = req.user;
  const { share_url_id } = req.params;

  if (!share_url_id) {
    throw new ApiError(400, "ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(share_url_id)) {
    throw new ApiError(400, "Invalid share link id.");
  }
  const share_url = await ShareLink.findById(share_url_id);

  if (!share_url) {
    throw new ApiError(404, "URL not found.");
  }

  const documentMember = await DocumentMember.findOne({
    document: share_url.document,
    user: user._id,
  });

  if (!documentMember) {
    throw new ApiError(403, "You are not a member of this document.");
  }

  if (!["owner", "admin"].includes(documentMember.role)) {
    throw new ApiError(403, "You are not authorized.");
  }

  await ShareLink.findByIdAndDelete(share_url._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Share link deleted successfully."));
});

export const all_shared_url = asyncHandler(async (req, res) => {
  const user = req.user;

  const { documentId } = req.params;

  if (!documentId) {
    throw new ApiError(401, "Document Id is required.");
  }
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid document id.");
  }

  const documentMember = await DocumentMember.findOne({
    document: documentId,
    user: user._id,
  });

  if (!documentMember) {
    throw new ApiError(403, "You are not a member of this document.");
  }

  if (!["owner", "admin"].includes(documentMember.role)) {
    throw new ApiError(403, "You are not authorized.");
  }

  const all_share_urls = await ShareLink.find({
    document: documentId,
  })
    .populate("createdBy", "fullName email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, all_share_urls, "All share urls."));
});
