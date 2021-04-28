import { app } from "./app";
import { mongoConnect } from "./db/mongoose";

app.listen(process.env.PORT, () => {
  console.log("Express started running on ", process.env.PORT);
});

mongoConnect(process.env.MONGODB_URL as string);
