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
}
