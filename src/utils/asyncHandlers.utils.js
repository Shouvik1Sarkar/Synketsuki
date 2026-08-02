// function asyncHandler(fn) {
//   return (req, res, next, err) => {
//     Promise.resolve()
//       .then(() => {
//         return fn(req, res, next, err);
//       })
//       .catch((err) => {
//         return next(err);
//       });
//   };
// }
function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      return await fn(req, res, next);
    } catch (err) {
      console.log("error: ", err);
      next(err);
    }
  };
}

export default asyncHandler;
