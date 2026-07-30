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
      return next(err);
    }
  };
}

export default asyncHandler;
