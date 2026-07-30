function globalError(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  try {
    return res.status(statusCode).json({
      message: err.message || "Something went wrong",
      statusCode: statusCode,
      errors: err.errors || [],
      success: err.success || false,
      data: err.data || null,
    });
  } catch (error) {
    next(error);
  }
}

export default globalError;
