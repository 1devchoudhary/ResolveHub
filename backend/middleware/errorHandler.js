import AppError from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';

// Requests that matched no route. Mount after all routes.
export const notFound = (req, res) =>
  sendError(res, { statusCode: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });

// Central error handler. Mount last. Express 5 also sends rejected async handlers here.
// The four arguments are required: that's how Express recognises an error handler.
export const errorHandler = (err, req, res, next) => {
  // A response already started streaming: let Express close the connection
  if (res.headersSent) return next(err);

  // Errors we threw on purpose
  if (err instanceof AppError) {
    return sendError(res, { statusCode: err.statusCode, message: err.message, errors: err.errors });
  }

  // Errors from express.json()
  if (err.type === 'entity.parse.failed') {
    return sendError(res, { statusCode: 400, message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return sendError(res, { statusCode: 413, message: 'Request body is too large' });
  }

  // Other client errors raised by Express or its middleware, marked safe to show
  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500 && err.expose) {
    return sendError(res, { statusCode: status, message: err.message });
  }

  // Anything else is a bug or an outage: log it fully, never leak details (SQL, stack) to the client
  console.error('❌ Unhandled error:', err);
  return sendError(res, { statusCode: 500, message: 'Something went wrong' });
};
