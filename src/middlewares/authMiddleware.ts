import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { userModel } from "../models/user";

export const passTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.header("Authorization")) {
      let token = req.header("Authorization") as string;
      token = token.replace("Bearer ", "");
      const data = await jsonwebtoken.verify(
        token,
        process.env.JWT_SECRET as string
      );
      const payload = data as DecodedToken;
      const userDocument = await userModel.findOne({
        _id: payload._id,
        "tokens.token": token,
      });
      if (!userDocument) {
        throw new Error();
      }
      req.user = userDocument;
      req.userToken = token;
      next();
    }
  } catch (e) {
    res.status(401).send({
      error: "Not Authenticated...",
    });
  }
};
