import { mongoConnect, mongoDisconnect } from "../src/db/mongoose";
import {
  createTaskTestData,
  createUserTestData,
  userTestDataOne,
  taskTestIdThree,
  taskTestIdTwo,
  userTestDataTwo,
} from "../tests/fixtures/testData";
import { userModel } from "../src/models/user";
import request from "supertest";
import { app } from "../src/app";
import { taskModel } from "../src/models/tasks";

beforeAll(async () => {
  await mongoConnect(process.env.MONGODB_URL as string);
  await createUserTestData();
  await createTaskTestData();
});

afterAll(async () => {
  await mongoDisconnect();
});

describe("Tests related to Tasks", () => {
  test("Verify to get all the tasks for one particular user", async () => {
    const response = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${userTestDataOne.tokens[0].token}`);
    expect(response.status).toBe(200);
    console.log("body response", response.body);
    expect(response.body.length).toEqual(2);
  });

  test("Verify the deletion of second user corresponding to the first task", async () => {
    const response = await request(app)
      .delete(`/tasks/${taskTestIdThree}`)
      .set("Authorization", `Bearer ${userTestDataTwo.tokens[0].token}`);
    const taskDocument = await taskModel.findById(taskTestIdThree);
    expect(response.status).toBe(200);
    expect(taskDocument).toBe(null);
  });

  test("Verify the status code when second user attempts to delete first task", async () => {
    const response = await request(app)
      .delete(`/tasks/${taskTestIdTwo}`)
      .set("Authorization", `Bearer ${userTestDataTwo.tokens[0].token}`);
    expect(response.status).toBe(404);
    const taskDocument = await taskModel.findById(taskTestIdTwo);
    expect(taskDocument).not.toBe(null);
  });
});
