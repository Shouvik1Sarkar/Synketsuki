import DocumentMember from "../models/docsMember.models.js";
import Document from "../models/document.models.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";

export const createInvitationUrl = asyncHandler(async (req, res) => {
  const user = req.user;

  // note in learning how invitation and share link two schemas were almost make then you had to take decision

  const { id } = req.params;

  const document = await Document.findById(id);
  if (!document) {
    throw new ApiError(404, "Not found document.");
  }

  const documentMember = await DocumentMember.findOne({
    document: document._id,
    user: user._id,
  });

  if (!documentMember) {
    throw new ApiError(401, "You are not the member of the Document.");
  }
  if (!["owner", "admin"].includes(documentMember.role)) {
    throw new ApiError(
      401,
      "You do not have permission to access the Document.",
    );
  }

  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const doesExist = await User.findOne({ email });
  if (!doesExist) {
    throw new ApiError(400, "User does not exist.");
  }

  const token = ""; // random
});

export const accessInvitationUrl = asyncHandler(async (req, res) => {});

export const updateInvitationUrl = asyncHandler(async (req, res) => {});

export const revokeInvitationUrl = asyncHandler(async (req, res) => {});

export const getAllInvitationUrls = asyncHandler(async (req, res) => {});
