import request from "supertest";
import app from "../app";
import sequelize from "../config/db";
import User from "../models/User.model";

jest.setTimeout(60000); 

beforeAll(async () => {
  console.log("Trying to authenticate DB...");
  await sequelize.authenticate();
  console.log("DB Authenticated. Syncing...");
  await sequelize.sync({ force: true });
  console.log("DB Synced.");
});

afterAll(async () => {
  await sequelize.close();
});

describe("Auth Endpoints", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "John Doe",
        email: "john@example.com",
        password: "Password1!",
        role: "applicant",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/verification email sent/i);
  });

  it("should not register user with invalid name", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "John123",
        email: "john2@example.com",
        password: "Password1!",
        role: "applicant",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
  });

  it("should login a verified user", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password1!",
        role: "applicant",
      });

    const user = await User.findOne({ where: { email: "jane@example.com" } });
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "jane@example.com",
        password: "Password1!",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.object).toHaveProperty("token");
  });

  it("should not login unverified user", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Unverified User",
        email: "unverified@example.com",
        password: "Password1!",
        role: "applicant",
      });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "unverified@example.com",
        password: "Password1!",
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBeDefined();
    expect(res.body.message).toMatch(/email not verified/i);
  });
});