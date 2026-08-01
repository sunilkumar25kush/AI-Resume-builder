import { ApiError } from "../utils/ApiError.js";

/**
 * Zod validation middleware — validates body/params/query against a schema.
 * Usage: validate({ body: schema, params: schema })
 */
export function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.validatedBody = schemas.body.parse(req.body);
      if (schemas.params) req.validatedParams = schemas.params.parse(req.params);
      if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
      next();
    } catch (error) {
      const details = error.issues?.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      next(ApiError.badRequest("Validation failed", details));
    }
  };
}
