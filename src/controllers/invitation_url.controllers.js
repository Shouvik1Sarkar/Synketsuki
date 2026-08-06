import { CLIENT_URL } from "../../config/env.config.js";
import DocumentMember from "../models/docsMember.models.js";
import Document from "../models/document.models.js";
import Invitation from "../models/invitaion.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";
import crypto from "crypto";
import { send_email } from "../utils/email.utils.js";

function generate_token() {
  const token = crypto.randomBytes(32).toString("hex");

  const hashed_token = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
  return { token, hashed_token, expiresAt };
}

export const createInvitationUrl = asyncHandler(async (req, res) => {
  const user = req.user;

  // note in learning how invitation and share link two schemas were almost make then you had to take decision

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

  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const invited_user = await User.findOne({ email });
  if (!invited_user) {
    throw new ApiError(404, "User not found.");
  }

  if (invited_user._id.equals(user._id)) {
    throw new ApiError(400, "You cannot invite yourself.");
  }

  const existingMember = await DocumentMember.findOne({
    document: document._id,
    user: invited_user._id,
  });

  if (existingMember) {
    throw new ApiError(400, "User is already a collaborator.");
  }

  const existingInvitation = await Invitation.findOne({
    document: document._id,
    invitedUser: invited_user._id,
    status: "pending",
  });

  if (existingInvitation) {
    throw new ApiError(409, "A pending invitation already exists.");
  }

  const { token, hashed_token, expiresAt } = generate_token();

  const invitation = await Invitation.create({
    document: document._id,
    invitedUser: invited_user._id,
    invitedBy: user._id,
    role: "viewer",
    token: hashed_token,
    status: "pending",
    expiresAt: expiresAt,
  });

  if (!invitation) {
    throw new ApiError(500, "iNVITATION NOT CREATED.");
  }

  const url = `${CLIENT_URL}/invitation/${token}`;

  // send_invitation_url = (userName, sender, url)

  try {
    await send_email({
      email: email,
      subject: "Invitation to collaborative docs.",
      meilGenContent: send_invitation_url(
        invited_user.userName,
        user.fullName,
        url,
      ),
    });
  } catch (error) {
    // Can use session token
    await Invitation.findByIdAndDelete(invitation._id);

    logger.error({ error }, "Failed to send invitation email");

    throw new ApiError(500, "Failed to send invitation email.");
  }

  return res.status(201).json(new ApiResponse(201, url, "URL sent."));
});

export const accessInvitationUrl = asyncHandler(async (req, res) => {});

export const updateInvitationUrl = asyncHandler(async (req, res) => {});

export const revokeInvitationUrl = asyncHandler(async (req, res) => {});

export const getAllInvitationUrls = asyncHandler(async (req, res) => {});
