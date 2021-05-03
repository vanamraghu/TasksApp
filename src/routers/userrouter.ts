import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { userModel } from "../models/user";
import { passTokens } from "../middlewares/authMiddleware";
import { taskModel } from "../models/tasks";
import multer from "multer";
import sharp from "sharp";

export const userRouter = express.Router();

userRouter.post("/users", async (req: Request, res: Response) => {
  try {
    const user = await userModel.create(req.body);
    const token = await user.generateAuthToken();
    res.status(201).send({ user: user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

userRouter.post("/users/login", async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const user = await userModel.loginValidation(body.email, body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({
      error: "Incorrect credentials",
    });
  }
});

userRouter.post(
  "/users/logout",
  passTokens,
  async (req: Request, res: Response) => {
    const document = req.user;
    const actualToken = req.userToken;
    try {
      if (document.tokens) {
        document.tokens = document.tokens.filter((token) => {
          return token.token !== actualToken;
        });
        console.log("Updated document after removing matched token ", document);
        await req.user.save();
        res.send();
      }
    } catch (e) {
      res.status(500).send();
    }
  }
);

userRouter.post(
  "/users/logoutAll",
  passTokens,
  async (req: Request, res: Response) => {
    const document = req.user;
    try {
      if (document.tokens) {
        document.tokens = [];
      }
      await document.save();
      res.send();
    } catch (e) {
      res.status(501).send();
    }
  }
);

userRouter.get("/users/me", passTokens, async (req: Request, res: Response) => {
  res.send(req.user);
});

userRouter.get("/users/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const data = await userModel.findById(id);
    if (!data) {
      res.status(404).send({
        message: "No data found",
      });
    }
    res.send(data);
  } catch (e) {
    res.status(500).send({
      id: "Id is not found",
    });
  }
});

userRouter.patch(
  "/users/me",
  passTokens,
  async (req: Request, res: Response) => {
    const user = req.user;
    const userKeys = Object.keys(req.body);
    const allowedKeys = ["name", "age", "password", "email"];
    const result = userKeys.every((user) => {
      return allowedKeys.includes(user);
    });
    if (!result) {
      return res.status(400).send({
        message: "Invalid property",
      });
    }
    try {
      userKeys.forEach((userKey) => {
        if (user) {
          user.set(userKey, req.body[userKey]);
        }
      });
      if (!user) {
        res.status(404).send({
          message: "User with Id is not found,plase check the id....",
        });
      } else {
        await user.save();
        res.status(200).send(user);
      }
    } catch (e) {
      res.status(400).send({
        e,
      });
    }
  }
);

userRouter.delete(
  "/users/me",
  passTokens,
  async (req: Request, res: Response) => {
    const id = req.user._id;
    try {
      await userModel.deleteOne({ _id: id });
      await taskModel.deleteMany({ owner: id });
      res.send(req.user);
    } catch (e) {
      res.status(500).send({
        message: "Please check Id...",
      });
    }
  }
);

const UserAvatar = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req: Request, file, callback) {
    if (
      file.originalname.endsWith(".pdf") ||
      file.originalname.endsWith(".doc") ||
      file.originalname.endsWith(".docx")
    ) {
      callback(new Error("Please upload jpeg/jpg/png"));
    } else {
      callback(null, true);
    }
  },
});

userRouter.post(
  "/users/me/avatar",
  passTokens,
  UserAvatar.single("avatar"),
  async (req: Request, res: Response) => {
    try {
      const imageBuffer = await sharp(req.file.buffer)
        .resize(500, 500)
        .png()
        .toBuffer();
      req.user.avatar = imageBuffer;
      await req.user.save();
      res.send();
    } catch (e) {
      res.send({
        message: "Please upload file properly",
      });
    }
  },
  (error: Error, req: Request, res: Response, next: NextFunction) => {
    res.send({
      error: error.message,
    });
  }
);

userRouter.get("/users/:id/avatar", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById({ _id: id });
    if (!user || !user.avatar) {
      res.send({
        message: "User id is not correct",
      });
    }
    if (user) {
      res.set("Content-Type", "image/jpg");
      res.send(user.avatar);
    }
  } catch (e) {
    res
      .send({
        message: "User Not found",
      })
      .status(400);
  }
});

userRouter.delete(
  "/users/me/avatar",
  passTokens,
  async (req: Request, res: Response) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({
      message: "User profile is deleted",
    });
  }
);
