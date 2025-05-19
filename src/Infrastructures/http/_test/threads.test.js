const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const createServer = require("../createServer");
const container = require("../../container");

describe("/threads endpoint functional tests", () => {
  let server;
  let accessToken;

  const testUser = {
    username: "functhreaduser",
    password: "password123",
    fullname: "Thread Functional User",
  };

  beforeAll(async () => {
    server = await createServer(container);

    // Register test user
    await server.inject({
      method: "POST",
      url: "/users",
      payload: testUser,
    });

    // Login to get access token
    const loginResponse = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        username: testUser.username,
        password: testUser.password,
      },
    });

    const {
      data: { accessToken: token },
    } = JSON.parse(loginResponse.payload);
    accessToken = token;
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("POST /threads", () => {
    it("should respond 201 and persist thread when payload is valid", async () => {
      const payload = {
        title: "Valid Thread Title",
        body: "Valid thread body",
      };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(payload.title);

      const threadsInDb = await ThreadsTableTestHelper.findThreadById(
        responseJson.data.addedThread.id
      );
      expect(threadsInDb).toHaveLength(1);
    });

    it("should respond 400 when title is missing", async () => {
      const payload = { body: "Thread body without title" };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(status).toEqual("fail");
      expect(message).toMatch(/title/i);
    });

    it("should respond 400 when body is missing", async () => {
      const payload = { title: "Thread with no body" };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(status).toEqual("fail");
      expect(message).toMatch(/body/i);
    });

    it("should respond 400 when title is not a string", async () => {
      const payload = {
        title: 12345,
        body: "Valid body",
      };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(status).toEqual("fail");
      expect(message).toEqual("title dan body harus string");
    });

    it("should respond 400 when title exceeds character limit", async () => {
      const payload = {
        title: "a".repeat(256),
        body: "Body with long title",
      };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(status).toEqual("fail");
      expect(message).toMatch(/panjang title melebihi batas limit/i);
    });

    it("should respond 401 when no access token is provided", async () => {
      const payload = {
        title: "Unauthorized Thread",
        body: "This should not be allowed",
      };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual("Missing authentication");
    });
  });
});
