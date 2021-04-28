import { app } from "./app";
import { mongoConnect } from "./db/mongoose";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { userModel, UserDocument } from "./models/user";

app.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
  console.log("Express started running on ", process.env.PORT);
});

console.log(process.env.MONGODB_URL);
mongoConnect(process.env.MONGODB_URL as string);
