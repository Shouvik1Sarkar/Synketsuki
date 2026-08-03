import DocumentMember from "../models/docsMember.models.js";
import Document from "../models/document.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";

export const createDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const { title, content } = req.body;

  const created_doc = await Document.create({
    title,
    content,
    owner: user._id,
  });

  if (!created_doc) {
    throw new ApiError(500, "Document not created.");
  }

  const doc_member = await DocumentMember.create({
    user,
    document: created_doc,
    role: "owner",
  });

  if (!doc_member) {
    throw new ApiError(500, "problem createing doc member");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, created_doc, "Document created"));
});
