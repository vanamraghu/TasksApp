import express, { Request, Response } from "express";
import { taskModel } from "../models/tasks";
import { passTokens } from "../middlewares/authMiddleware";
export const taskRouter = express.Router();

taskRouter.post("/tasks", passTokens, async (req: Request, res: Response) => {
  try {
    const taskDocument = await taskModel.create({
      ...req.body,
      owner: req.user._id,
    });
    res.status(201).send(taskDocument);
  } catch (e) {
    res.status(400).send(e);
  }
});

taskRouter.get("/tasks", passTokens, async (req: Request, res: Response) => {
  try {
    const match: { [key: string]: boolean } = {};
    const sort: { [key: string]: number } = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    if (req.query.sort) {
      const splitValues = (req.query.sort as string).split(":") as string[];
      sort[splitValues[0]] = splitValues[1] === "desc" ? -1 : 1;
    }
    const data = await req.user
      .populate({
        path: "task",
        match,
        options: {
          limit: parseInt(req.query.limit as string),
          skip: parseInt(req.query.skip as string),
          sort,
        },
      })
      .execPopulate();
    res.send(data.task);
  } catch (e) {
    res.status(501).send({
      message: "Data is not present",
    });
  }
});

taskRouter.get(
  "/tasks/:id",
  passTokens,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const data = await taskModel.findOne({ _id: id, owner: req.user._id });
      if (!data) {
        return res.status(404).send({
          message: "Data is not present for the provided ID, pls check id...",
        });
      }
      res.send(data);
    } catch (e) {
      res.status(500).send({
        message: "Record not found",
      });
    }
  }
);

taskRouter.patch(
  "/tasks/:id",
  passTokens,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const keys = Object.keys(req.body);
    const actualKeys = ["description", "completed"];
    const result = keys.every((key) => {
      return actualKeys.includes(key);
    });
    if (!result) {
      res.status(404).send({
        message: "Please check the request body...",
      });
    }
    try {
      const taskDocument = await taskModel.findOne({
        _id: id,
        owner: req.user.id,
      });
      keys.forEach((k) => {
        if (taskDocument) {
          taskDocument.set(k, req.body[k]);
        }
      });
      if (!taskDocument) {
        res.status(400).send({
          id: "Please check id...",
        });
      } else {
        await taskDocument.save();
        res.status(201).send(taskDocument);
      }
    } catch (e) {
      res.status(404).send({
        id: "Incorrect Id",
      });
    }
  }
);

taskRouter.delete(
  "/tasks/:id",
  passTokens,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const data = await taskModel.findOneAndDelete({
        _id: id,
        owner: req.user.id,
      });
      if (!data) {
        return res.status(404).send({
          message: "Please check id",
        });
      }
      res.status(200).send(data);
    } catch (e) {
      res.status(500).send({
        message: "Incorrect Id provided!!!",
      });
    }
  }
);

taskRouter.get("/tasksId/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await taskModel.findByIdAndDelete(id);
    const countDocuments = taskModel.count({ completed: false });
    res.send({
      count: countDocuments,
    });
  } catch (e) {
    res.status(500).send({
      message: "Id not found",
    });
  }
});
