// Every API response has the same shape, so the frontend can handle all of them one way:
//   success: { success: true,  message, data }
//   error:   { success: false, message, errors? }

export const sendSuccess = (res, { statusCode = 200, message = 'OK', data = null } = {}) =>
  res.status(statusCode).json({ success: true, message, data });

// Controllers don't call this directly: they throw an AppError and the error handler uses it
export const sendError = (res, { statusCode = 500, message = 'Something went wrong', errors } = {}) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });
