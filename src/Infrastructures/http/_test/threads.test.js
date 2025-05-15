const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint functional tests", () => {
  let server;
  let accessToken;
  const testUserId = "user-func-thread-001";
  const testUsername = "functhreaduser";

  beforeAll(async () => {
    server = await createServer(container);
    // Clean tables before all tests in this suite
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();

    // Register a user for authentication
    await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username: testUsername,
        password: "password123",
        fullname: "Functional Test Thread User",
      },
    });

    // Login to get an access token
    const loginResponse = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        username: testUsername,
        password: "password123",
      },
    });
    const loginResponseJson = JSON.parse(loginResponse.payload);
    accessToken = loginResponseJson.data.accessToken;
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("when POST /threads", () => {
    it("should respond 201 and persist thread when request is valid", async () => {
      // Arrange
      const requestPayload = {
        title: "Valid Functional Test Thread Title",
        body: "This is the valid body of the functional test thread.",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);

      // Owner ID will match the user created in the authentication process
      // Since we're not manipulating the users table in this refactored version
      expect(responseJson.data.addedThread.owner).toBeDefined();

      const threadsInDb = await ThreadsTableTestHelper.findThreadById(
        responseJson.data.addedThread.id
      );
      expect(threadsInDb).toHaveLength(1);
      expect(threadsInDb[0].title).toEqual(requestPayload.title);
      expect(threadsInDb[0].body).toEqual(requestPayload.body);
      expect(threadsInDb[0].owner).toBeDefined();
    });

    it("should respond 400 when request payload is missing title", async () => {
      // Arrange
      const requestPayload = {
        // title is missing
        body: "This thread body has no title.",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).not.toEqual("");
    });

    it("should respond 400 when request payload is missing body", async () => {
      // Arrange
      const requestPayload = {
        title: "This thread title has no body",
        // body is missing
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).not.toEqual("");
    });

    it("should respond 400 when request payload has invalid title type", async () => {
      // Arrange
      const requestPayload = {
        title: 12345, // Invalid type, should be string
        body: "This thread body has an invalid title type.",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).not.toEqual("");
    });

    it("should respond 400 when request payload has title exceeding character limit", async () => {
      // Arrange
      const requestPayload = {
        title: "a".repeat(256),
        body: "This thread body has an overly long title.",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toMatch(
        /panjang title melebihi batas limit/i
      );
    });

    it("should respond 401 when no access token is provided", async () => {
      // Arrange
      const requestPayload = {
        title: "Thread Title without Auth",
        body: "This thread body is sent without an access token.",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        // No Authorization header
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      // Hapi default message for missing auth with JWT strategy
      expect(responseJson.message).toEqual("Missing authentication");
    });
  });
});
