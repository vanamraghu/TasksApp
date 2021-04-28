import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

export interface UserDocument extends Document {
  name: string;
  age: number;
  password?: string;
  email: string;
  tokens?: { [key: string]: string }[] | undefined;
  generateAuthToken: () => string;
  toJSON: <UserDocument>() => UserDocument;
  task: { [key: string]: string | boolean }[];
  avatar: Buffer | undefined;
}

interface UserModel extends Model<UserDocument> {
  loginValidation: (email: string, password: string) => UserDocument;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      validate: (age: number) => {
        if (age <= 0) {
          throw new Error("Age should be positive number");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: (email: string) => {
        if (!validator.isEmail(email)) {
          throw new Error("Email is not of right format");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

userSchema.virtual("task", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.statics.loginValidation = async function (
  email: string,
  password: string
) {
  const document = await userModel.findOne({ email });
  if (!document) {
    throw new Error("Not able to login");
  }
  const result = await bcryptjs.compare(password, document.password as string);
  if (!result) {
    throw new Error("Incorrect password");
  }
  return document;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jsonwebtoken.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET as string
  );
  if (user.tokens?.length === 0 || user.tokens) {
    user.tokens = user.tokens.concat({ token });
  }
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject<UserDocument>();
  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;
  return userObj;
};

userSchema.pre("save", async function (next) {
  const user = this;
  console.log("user properties before saving", user);
  if (user.isModified("password")) {
    const encryptPassword = await bcryptjs.hash(user.password as string, 8);
    user.password = encryptPassword;
  }
  next();
});

export const userModel = mongoose.model<UserDocument, UserModel>(
  "User",
  userSchema
);

export { userSchema };
