import { promisify } from "util";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import ErrorResponse from "../utils/errorResponse.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.auth) {
      token = req.cookies.auth;
    }

    if (!token)
      return next(
        new ErrorResponse(
          "You are not logged in Please log in to get access",
          401
        )
      );

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const current = await User.findById(decoded.id);

    if (!current)
      return next(
        new ErrorResponse(
          "The user belonging to this token does no longer exist",
          401
        )
      );

    req.user = current;
    next();
  } catch (err) {
    next(err);
  }
};
