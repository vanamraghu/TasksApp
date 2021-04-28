import { app } from "./app";
import { mongoConnect } from "./db/mongoose";

app.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
  console.log("Express started running on ", process.env.PORT);
});

console.log(process.env.MONGODB_URL);
mongoConnect(process.env.MONGODB_URL as string);
