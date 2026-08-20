import { createRedis } from "../../config/redis.config.js";
import DocumentMember from "../models/docsMember.models.js";
import Document from "../models/document.models.js";
import { DocumentVersion } from "../models/document_versioning.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";

export const createDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const redis_key = `all_docs:${user._id}`;

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
    user: user._id,
    document: created_doc._id,
    role: "owner",
    invitedBy: user._id,
  });

  if (!doc_member) {
    throw new ApiError(500, "problem createing doc member");
  }

  await createRedis.del(redis_key);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        document: created_doc,
        membership: doc_member,
      },
      "Document created successfully.",
    ),
  );
});

export const getUserDocuments = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
  }

  const redis_key = `all_docs:${user._id}`;

  const cachedDocs = await createRedis.get(redis_key);

  if (cachedDocs) {
    return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cachedDocs), "All the docs"));
  }

  const all_my_docs = await DocumentMember.find({
    user: user._id,
  }).populate("document");

  const ownedDocuments = [];
  const editableDocuments = [];
  const viewableDocuments = [];

  all_my_docs.forEach((e) => {
    if (e.role == "owner") {
      ownedDocuments.push(e);
    } else if (e.role == "editor") {
      editableDocuments.push(e);
    } else {
      viewableDocuments.push(e);
    }
  });

  const data = {
    all_docs: all_my_docs,
    ownedDocuments,
    editableDocuments,
    viewableDocuments,
  };

  await createRedis.set(redis_key, JSON.stringify(data), { EX: 60 * 5 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        all_docs: all_my_docs,
        ownedDocuments,
        editableDocuments,
        viewableDocuments,
      },
      "All the docs",
    ),
  );
});

// later make a ustility function const membership = await getDocumentMembership(user._id, documentId);
export const getDocumentById = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Not created doc.");
  }
  const redisKey2 = `doc:${id}`;

  const cached_Data = await createRedis.get(redisKey2);

  if (cached_Data) {
    return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cached_Data), "doc "));
  }

  const membership = await DocumentMember.findOne({
    user: req.user._id,
    document: id,
  }).populate("document");
  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document.",
    );
  }

  if (membership.document.isDeleted) {
    throw new ApiError(404, "Document not found.");
  }

  await createRedis.set(redisKey2, JSON.stringify(membership), { EX: 60 * 5 });

  return res.status(200).json(new ApiResponse(200, { membership }, "doc "));
});

export const updateDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const redis_key = `all_docs:${user._id}`;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Document id is required.");
  }

  const redisKey2 = `doc:${id}`;

  const membership = await DocumentMember.findOne({
    user: user._id,
    document: id,
  }).populate("document");

  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document.",
    );
  }

  if (!membership.document) {
    throw new ApiError(404, "Document not found.");
  }

  if (!["owner", "editor"].includes(membership.role)) {
    throw new ApiError(403, "You don't have permission to edit this document.");
  }

  if (membership.document.isDeleted) {
    throw new ApiError(404, "Document not found.");
  }

  const { title, content } = req.body;

  const updatedObj = {};

  if (title !== undefined) {
    updatedObj.title = title;
  }

  if (content !== undefined) {
    updatedObj.content = content;
  }

  const updatedDoc = await Document.findByIdAndUpdate(id, updatedObj, {
    new: true,
    runValidators: true,
  });

  await createRedis.del(redis_key);
  await createRedis.del(redisKey2);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoc, "Document updated."));
});

/********************  learn mongoose transaction**************************************** */
/**************************************************************************************** */
/**************************************************************************************** */
/**************************************************************************************** */

export const version_update = asyncHandler(async (req, res) => {
  const user = req.user;

  const redis_key = `all_docs:${user._id}`;

  const { id } = req.params;

  if (!id) throw new ApiError(400, "Document ID is required");

  const redisKey2 = `doc:${id}`;

  const membership = await DocumentMember.findOne({
    user: user._id,
    document: id,
  }).populate("document");

  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document.",
    );
  }

  if (!membership.document) {
    throw new ApiError(404, "document not found");
  }

  if (membership.document.isDeleted) {
    throw new ApiError(404, "Document not found.");
  }

  if (membership.document.isArchived) {
    throw new ApiError(409, "Archived documents cannot be versioned.");
  }

  if (membership.role !== "owner") {
    throw new ApiError(403, "Only the owner can create a version.");
  }

  const { message } = req.body;

  /** PREVENT DUPLICATION */

  const latestVersion = await DocumentVersion.findOne({
    document: id,
  }).sort({ version: -1 });

  if (
    latestVersion &&
    latestVersion.title === membership.document.title &&
    latestVersion.content === membership.document.content
  ) {
    throw new ApiError(409, "No changes detected since the previous version.");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    membership.document.version += 1;
    await membership.document.save({ session });

    const newVersion = await DocumentVersion.create(
      {
        document: id,
        version: membership.document.version,
        title: membership.document.title,
        content: membership.document.content,
        createdBy: user._id,
        message,
      },
      { session },
    );

    await session.commitTransaction();

    await createRedis.del(redis_key);
    await createRedis.del(redisKey2);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          document: membership.document,
          version: newVersion,
        },
        "Version created successfully.",
      ),
    );
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

/**************************************************************************************** */
/**************************************************************************************** */
/**************************************************************************************** */
/**************************************************************************************** */

//  Move to trash can //
export const deleteDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const redis_key = `all_docs:${user._id}`;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Not created doc.");
  }

  const redisKey2 = `doc:${id}`;

  const membership = await DocumentMember.findOne({
    user: req.user._id,
    document: id,
  }).populate("document");

  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document.",
    );
  }

  if (!membership.document) {
    throw new ApiError(404, "document not found");
  }

  if (membership.role !== "owner") {
    throw new ApiError(
      403,
      "You don't have permission to delete this document.",
    );
  }

  if (membership.document.isDeleted) {
    throw new ApiError(404, "Document is already deleted.");
  }

  membership.document.isDeleted = true;

  await membership.document.save();

  await createRedis.del(redis_key);
  await createRedis.del(redisKey2);

  return res
    .status(200)
    .json(new ApiResponse(200, membership, "Moved to trash"));
});

export const restoreDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const redis_key = `all_docs:${user._id}`;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Not created doc.");
  }

  const redisKey2 = `doc:${id}`;

  const membership = await DocumentMember.findOne({
    user: req.user._id,
    document: id,
  }).populate("document");

  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document.",
    );
  }

  if (!membership.document) {
    throw new ApiError(404, "document not found");
  }

  if (membership.role !== "owner") {
    throw new ApiError(
      403,
      "You don't have permission to delete this document.",
    );
  }

  if (!membership.document.isDeleted) {
    throw new ApiError(404, "Document is not deleted.");
  }

  membership.document.isDeleted = false;

  await membership.document.save();

  await createRedis.del(redis_key);
  await createRedis.del(redisKey2);

  return res
    .status(200)
    .json(new ApiResponse(200, membership, "Document removed from trash"));
});

export const permanentlyDeleteDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Not created doc.");
  }

  const membership = await DocumentMember.findOne({
    user: req.user._id,
    document: id,
  }).populate("document");

  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document. or this file is already deleted.",
    );
  }

  if (!membership.document) {
    throw new ApiError(404, "document not found");
  }

  if (membership.role !== "owner") {
    throw new ApiError(
      403,
      "You don't have permission to delete this document.",
    );
  }

  await membership.document.deleteOne();
  await DocumentMember.deleteMany({
    document: membership.document._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Document permanently deleted."));
});

export const trashCan = asyncHandler(async (req, res) => {
  const user = req.user;

  const deleted_docs = await Document.find({
    owner: user._id,
    isDeleted: true,
  });

  return res.status(200).json(new ApiResponse(200, deleted_docs, "deleted"));
});

export const cleanTrashCan = asyncHandler(async (req, res) => {
  const user = req.user;

  const deleted_docs = await Document.find({
    owner: user._id,
    isDeleted: true,
  });
  if (deleted_docs.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Trash is already empty."));
  }
  for (const doc of deleted_docs) {
    await DocumentMember.deleteMany({
      document: doc._id,
    });

    await doc.deleteOne();
  }

  return res.status(200).json(new ApiResponse(200, null, "Trash Can cleaned."));
});

export const toggleArchiveDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Not created doc.");
  }

  const membership = await DocumentMember.findOne({
    user: user._id,
    document: id,
  }).populate("document");

  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document.",
    );
  }

  if (!membership.document) {
    throw new ApiError(404, "document not found");
  }

  if (membership.role !== "owner") {
    throw new ApiError(
      403,
      "You don't have permission to archive this document.",
    );
  }

  if (membership.document.isDeleted) {
    throw new ApiError(404, "Can not access the document.");
  }
  let message = "";
  if (membership.document.isArchived) {
    membership.document.isArchived = false;

    message = "Document Unarchived";
  } else {
    membership.document.isArchived = true;
    message = "Document Archived";
  }

  await membership.document.save();

  return res.status(200).json(new ApiResponse(200, membership, message));
});

// export const unarchiveDocument = asyncHandler(async (req, res) => {});

export const duplicateDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  const redis_key = `all_docs:${user._id}`;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Not created doc.");
  }

  const membership = await DocumentMember.findOne({
    user: user._id,
    document: id,
  }).populate("document");

  if (!membership) {
    throw new ApiError(
      403,
      "You don't have permission to access this document.",
    );
  }

  // const document = await Document.findById(id);
  // if (!document) {
  //   throw new ApiError(404, "Document not found.");
  // }
  const document = membership.document;

  if (document.isArchived) {
    throw new ApiError(409, "Can't copy archived document.");
  }

  // if (document.isArchived) {
  //   throw new ApiError(409, "Can't copy archived document.");
  // }
  if (document.isDeleted) {
    throw new ApiError(404, "Document not found.");
  }
  const created_doc = await Document.create({
    title: `Copy of ${document.title}`,
    content: document.content,
    owner: user._id,
  });
  if (!created_doc) {
    throw new ApiError(500, "Document not created");
  }

  const doc_member = await DocumentMember.create({
    user: user._id,
    document: created_doc._id,
    role: "owner",
    invitedBy: user._id,
  });

  if (!doc_member) {
    throw new ApiError(500, "problem createing doc member");
  }

  await createRedis.del(redis_key);
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        document: created_doc,
        membership: doc_member,
      },
      "Document duplicated successfully.",
    ),
  );
});
