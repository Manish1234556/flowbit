require("dotenv").config();
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const ticketRoutes = require("../routes/tickets");
const authMiddleware = require("../middleware/authMiddleware");

jest.mock("axios");
jest.setTimeout(10000);

const User = require("../models/User");
const Ticket = require("../models/Ticket");

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/tickets", ticketRoutes);
  return app;
};

describe("R2 - Tenant Isolation", () => {
  let tokenA, tokenB;
  let testApp;

  beforeAll(async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    await mongoose.connect(`${process.env.MONGO_URI}_test`);
    testApp = createTestApp();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});
    await Ticket.deleteMany({});

    const hashedPassword = await bcrypt.hash("password123", 10);

    const userA = await User.create({
      email: "admin2@logisticsco.com",
      password: hashedPassword,
      customerId: "LogisticsCo",
      role: "Admin",
    });

    const userB = await User.create({
      email: "adminB@example.com",
      password: hashedPassword,
      customerId: "TenantB",
      role: "Admin",
    });

    tokenA = jwt.sign(
      { userId: userA._id, customerId: userA.customerId, role: userA.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    tokenB = jwt.sign(
      { userId: userB._id, customerId: userB.customerId, role: userB.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Ticket.create({
      ticketId: "abc123",
      customerId: "LogisticsCo",
      status: "open",
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Ticket.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    jest.clearAllTimers();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test("TenantB cannot see LogisticsCo tickets", async () => {
    const res = await request(testApp)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tickets).toBeDefined();
    expect(res.body.tickets.length).toBe(0);
  });

  test("LogisticsCo sees their tickets", async () => {
    const res = await request(testApp)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tickets).toBeDefined();
    expect(res.body.tickets.length).toBe(1);
    expect(res.body.tickets[0].ticketId).toBe("abc123");
  });
});
