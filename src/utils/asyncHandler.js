// using promise
// const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

// using async await
const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const jsonObject = {
      success: false,
      status: statusCode,
    };
    if (error.errors instanceof Array && error.errors.length) {
    } else if (
      error.errors instanceof Object &&
      error.errors?.length == undefined
    ) {
      jsonObject.errors = Object.values(error?.errors)?.map((err) => {
        const errorName = err?.path ? `${err.path} error` : err?.name;
        return { name: errorName, message: err.message };
      });
    } else {
      jsonObject.message = error?.message;
    }

    res.status(statusCode).json(jsonObject);
  }
};
export { asyncHandler };
