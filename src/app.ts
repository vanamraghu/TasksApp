import express from "express";
import { Request, Response } from "express";
import hbs from "hbs";
import path from "path";
import { userModel } from "./models/user";
import { userRouter } from "./routers/userrouter";
import { taskRouter } from "./routers/taskrouter";

export const app = express();

console.log(__dirname);

const partialPath = path.join(__dirname, "../views/partials");

hbs.registerPartials(partialPath);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
// app.set("port", process.env.PORT);
app.set("view engine", "hbs");

app.use(userRouter);
app.use(taskRouter);

app.get("/", (req: Request, res: Response) => {
  res.render("user", {
    name: "Raghu",
  });
});

app.patch("/userUpdateId/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const queryParams = req.query;
  const body = req.body;
  try {
    await userModel.findOneAndUpdate({ _id: id }, body);
  } catch (error) {
    return res.send({
      message: "Invalid ID",
    });
  }
  const userCount = await userModel.countDocuments(queryParams);
  return res.send({
    count: userCount,
  });
});
