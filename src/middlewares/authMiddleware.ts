import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { UserDocument, userModel } from "../models/user";

export const passTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.header("Authorization")) {
      let token = req.header("Authorization") as string;
      token = token.replace("Bearer ", "");
      console.log("current token is ", token);
      const data = await jsonwebtoken.verify(
        token,
        process.env.JWT_SECRET as string
      );
      const payload = data as DecodedToken;
      console.log(typeof data, (data as DecodedToken).iat);
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
