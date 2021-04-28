import mongoose from "mongoose";

export const mongoConnect = (url: string) => {
  mongoose
    .connect(url, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB is connected");
    })
    .catch(() => {
      console.log("DB connection failure");
    });
};
