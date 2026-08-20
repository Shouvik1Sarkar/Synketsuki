import * as cookie from "cookie";

export const socketAuth = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    const accessId = cookies.accessToken;

    if (!accessId) {
      throw new ApiError(401, "Not logged in.");
    }
    let decoded_data;
    try {
      decoded_data = jwt.verify(accessId, ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired token.");
    }

    const user = await User.findById(decoded_data._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(403, "Please verify your email.");
    }

    socket.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
