// An expected, client-facing error (bad input, duplicate, not found, forbidden…).
// Throw it anywhere in a request; the central error handler turns it into a JSON response.
//   throw new AppError(404, 'Ticket not found');
//   throw new AppError(400, 'Validation failed', { email: 'Email is required' });
export default class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    // Optional per-field messages, e.g. { email: 'Email is required' }
    this.errors = errors;
  }

  static badRequest(message = 'Bad request', errors) {
    return new AppError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(401, message);
  }

  static forbidden(message = 'You do not have permission to do that') {
    return new AppError(403, message);
  }

  static notFound(message = 'Not found') {
    return new AppError(404, message);
  }

  static conflict(message, errors) {
    return new AppError(409, message, errors);
  }
}
