import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateRequest = (
  schema: ZodType,
): RequestHandler => {
  return async (req, _res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        params: req.params,
        query: req.query,
      });

      if (validatedData.body !== undefined) {
        req.body = validatedData.body;
      }

      if (validatedData.params !== undefined) {
        req.params = validatedData.params;
      }

      /*
       * Express 5-এ req.query read-only getter হতে পারে।
       * এজন্য req.query সরাসরি replace না করে assign করা হচ্ছে।
       */
      if (validatedData.query !== undefined) {
        Object.assign(req.query, validatedData.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};