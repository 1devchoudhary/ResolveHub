import AppError from '../utils/AppError.js';

const SOURCES = ['params', 'query', 'body'];

/**
 * Validates and cleans request input with Zod schemas, before the controller runs.
 *   router.post('/register', validate({ body: registerSchema }), register);
 *
 * On success the parsed values (trimmed, normalised, unknown keys stripped) replace the raw
 * input, so controllers can trust req.body / req.query / req.params.
 * On failure it throws a 400 with one message per field.
 */
export const validate = (schemas) => (req, _res, next) => {
  const errors = {};

  for (const source of SOURCES) {
    const schema = schemas[source];
    if (!schema) continue;

    // req.body is undefined when the request has no JSON body
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path.join('.') || source;
        // Keep the first message per field: it's the most relevant one
        errors[field] ??= issue.message;
      }
      continue;
    }

    // Express 5 exposes req.query through a getter, so define it instead of assigning it
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  if (Object.keys(errors).length > 0) {
    return next(AppError.badRequest('Validation failed', errors));
  }

  return next();
};
