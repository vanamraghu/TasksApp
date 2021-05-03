import { app } from "../src/app";
import request from "supertest";
import { mongoConnect, mongoDisconnect } from "../src/db/mongoose";
import { userModel } from "../src/models/user";
import {
  userTestDataOne,
  createUserTestData,
  userTestIdOne,
} from "../tests/fixtures/testData";

const userData: { [key: string]: string | number } = {
  name: "RAGHU",
  age: 56,
  email: "test@1234.com",
  password: "Test1234",
};

const invalidUserData: { [key: string]: string | number } = {
  name: "Invalid",
  email: "invalid@user.com",
  password: "invalid",
};

beforeAll(async () => {
  await mongoConnect(process.env.MONGODB_URL as string);
  await createUserTestData();
});

afterAll(async () => {
  await mongoDisconnect();
});

describe("User Route Tests", () => {
  test("Verifying the attributes of user after creating the record", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${userTestDataOne.tokens[0].token}`);
    expect(response.body.age).toBe(95);
    expect(response.body.name).toBe("Raghu Vanam");
    expect(response.body.email).toBe("test@1234.com");
  });

  test("Verifying whether User is logged in", async () => {
    const response = await request(app).post("/users/login").send(userData);
    expect(response.status).toBe(200);
    const userDocument = await userModel.findById(response.body.user._id);
    const newToken = userDocument.tokens[1].token;
    expect(newToken).toBe(response.body.token);
    expect(response.body.user).toMatchObject({
      name: "Raghu Vanam",
      age: 95,
    });
  });

  test("Verifying whether invalid user is logged in ", async () => {
    const response = await request(app)
      .post("/users/login")
      .send(invalidUserData);
    expect(response.status).toBe(400);
  });

  test("Verifying whether user is not authenticated", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer &***`);
    expect(response.status).toBe(401);
  });

  test("Verify the File upload ", async () => {
    const response = await request(app)
      .post("/users/me/avatar")
      .set("Authorization", `Bearer ${userTestDataOne.tokens[0].token}`)
      .attach("avatar", "tests/fixtures/profile-pic.jpg");
    expect(response.status).toBe(200);
    const userDocument = await userModel.findById(userTestIdOne);
    expect(userDocument.avatar).toEqual(expect.any(Buffer));
  });

  test("Verify the updation of two fields", async () => {
    const response = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${userTestDataOne.tokens[0].token}`)
      .send({
        name: "Venkata Raghavendra",
      });
    expect(response.body.name).toEqual("Venkata Raghavendra");
  });

  test("Verify the error status code when invalid property is provided", async () => {
    const response = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${userTestDataOne.tokens[0].token}`)
      .send({ location: "bangalore" });
    expect(response.status).toBe(400);
  });

  test("Verifying whether user is not deleted with incorrect authentication", async () => {
    const response = await request(app)
      .delete("/users/me")
      .set("Authorization", `Bearer $34343`);
    expect(response.status).toBe(401);
  });

  test("Verifying whether user can be deleted with correct authetication", async () => {
    const response = await request(app)
      .delete("/users/me")
      .set("Authorization", `Bearer ${userTestDataOne.tokens[0].token}`);
    expect(response.status).toBe(200);
    const userDocument = await userModel.findById(userTestIdOne);
    expect(userDocument).toBe(null);
  });
});
