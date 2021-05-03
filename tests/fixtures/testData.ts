import { userModel } from "../../src/models/user";
import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
import { taskModel } from "../../src/models/tasks";

export const userTestIdOne = new mongoose.Types.ObjectId();
export const userTestIdTwo = new mongoose.Types.ObjectId();
export const taskTestIdThree = new mongoose.Types.ObjectId();
export const taskTestIdTwo = new mongoose.Types.ObjectId();

export const userTestDataOne = {
  _id: userTestIdOne,
  name: "Raghu Vanam",
  age: 95,
  password: "Test1234",
  email: "test@1234.com",
  tokens: [
    {
      token: jsonwebtoken.sign(
        { _id: userTestIdOne },
        process.env.JWT_SECRET as string
      ),
    },
  ],
};

export const userTestDataTwo = {
  _id: userTestIdTwo,
  name: "Raghu Vanam Guru Venkata",
  age: 71,
  password: "Test1234562",
  email: "test@1234568.com",
  tokens: [
    {
      token: jsonwebtoken.sign(
        { _id: userTestIdTwo },
        process.env.JWT_SECRET as string
      ),
    },
  ],
};

export const taskTestDataOne = {
  description: "Task One",
  completed: true,
  owner: userTestIdOne,
  _id: mongoose.Types.ObjectId(),
};

export const taskTestDataTwo = {
  description: "Task Two",
  completed: true,
  owner: userTestIdOne,
  _id: taskTestIdTwo,
};

export const taskTestDataThree = {
  description: "Task Three",
  completed: true,
  owner: userTestIdTwo,
  _id: taskTestIdThree,
};

export const createUserTestData = async () => {
  await userModel.create(userTestDataOne);
  await userModel.create(userTestDataTwo);
};

export const createTaskTestData = async () => {
  await taskModel.create(taskTestDataOne);
  await taskModel.create(taskTestDataTwo);
  await taskModel.create(taskTestDataThree);
};
