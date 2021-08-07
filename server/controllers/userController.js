import User from "../models/userModel.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import cloudinary from "../utils/cloudinary.js";
import ErrorResponse from "../utils/errorResponse.js";

const headerCookie = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("auth", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 90, // 1 week
      //   secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
    })
  );
};

export const createUser = async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const newUser = await User.create({
      email: req.body.email,
      name: req.body.name,
      photo: result.secure_url,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });

    headerCookie(newUser, res);
    newUser.password = undefined;

    res.status(201).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorResponse("Please provide email and password", 400));
    }

    const user = await User.findOne({ email })
      .select("+password")
      .select("-__v");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new ErrorResponse("Incorrect email or password", 401));
    }

    headerCookie(user, res);
    user.password = undefined;

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res, next) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("auth", "loggedout", {
      httpOnly: true,
      maxAge: -1, // 1 week
      // secure: process.env.NODE_ENV !== "production",
      sameSite: true,
      domain: "localhost",
      path: "/",
    })
  );
  res.status(200).json({ status: "success" });
};

export const updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updateMyPassword.",
          400
        )
      );
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        email: req.body.email,
        name: req.body.name,
        photo: result.secure_url,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id).select("-password -__v");

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};
