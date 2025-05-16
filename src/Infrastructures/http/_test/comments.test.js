const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentRepositoryPostgres = require("../../repository/CommentRepositoryPostgres");
const createServer = require("../../../Infrastructures/http/createServer");
const container = require("../../container");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");

describe("/comments endpoint functional tests", () => {
  let server;
  let accessToken;
  let threadId;
  const testUser = {
    id: "user-123",
    username: "funccommentuser",
    password: "password123",
    fullname: "Comment User",
  };

  beforeAll(async () => {
    server = await createServer(container);

    // Register user
    await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username: testUser.username,
        password: testUser.password,
        fullname: testUser.fullname,
      },
    });

    // Login user
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

    // Create thread for comment testing
    const threadResponse = await server.inject({
      method: "POST",
      url: "/threads",
      payload: {
        title: "Test Thread",
        body: "Thread body",
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const {
      data: {
        addedThread: { id: createdThreadId },
      },
    } = JSON.parse(threadResponse.payload);
    threadId = createdThreadId;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("POST /threads/{threadId}/comments", () => {
    it("should respond 201 and persist comment", async () => {
      // Arrange
      const payload = { content: "Test comment" };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();

      // Verify database
      const comments = await CommentsTableTestHelper.findCommentById(
        responseJson.data.addedComment.id
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual(payload.content);
    });

    it("should respond 400 when payload missing content", async () => {
      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toMatch("harus mengirimkan content");
    });

    it("should respond 400 when content has invalid type", async () => {
      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: { content: 12345 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toMatch("content harus berupa string");
    });

    it("should respond 404 when thread not found", async () => {
      // Arrange
      const fakeThreadId = "thread-xxx";

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${fakeThreadId}/comments`,
        payload: { content: "Test comment" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toMatch("Thread tidak ditemukan");
    });

    it("should respond 401 when missing authentication", async () => {
      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: { content: "Test comment" },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
