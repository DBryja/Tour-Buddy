import { validationResult } from "express-validator";

export const handleErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(400).json({ errors: errors.array() });
    return res.render("user/signupTemplate.ejs", { errors: errors.array(), libs: ["tools"] });
  }
  await next();
};
