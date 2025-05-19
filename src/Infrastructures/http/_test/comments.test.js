const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const createServer = require("../../../Infrastructures/http/createServer");
const container = require("../../container");

describe("/comments endpoint functional tests", () => {
  let server;
  let accessToken;
  let threadId;
  let commentId;
  const testUser = {
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
      payload: testUser,
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

    // Create thread
    const threadResponse = await server.inject({
      method: "POST",
      url: "/threads",
      payload: {
        title: "Test Thread",
        body: "Thread body",
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    // Create comment
    const commentResponse = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      payload: { content: "Test comment" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    commentId = JSON.parse(commentResponse.payload).data.addedComment.id;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("POST /threads/{threadId}/comments endpoint", () => {
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

  describe("DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should respond 200 and soft delete the comment", async () => {
      // Arrange: tambahkan comment baru via endpoint
      const responseCreate = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: { content: "Another comment" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const newCommentId = JSON.parse(responseCreate.payload).data.addedComment
        .id;

      // Act
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${newCommentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");

      const comments = await CommentsTableTestHelper.findCommentById(
        newCommentId
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toEqual(true);
    });

    it("should respond 404 when thread not found", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-not-found/comments/${commentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond 404 when comment not found", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/comment-not-found`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond 403 when user is not the owner", async () => {
      // Register another user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "otheruser",
          password: "password123",
          fullname: "Other User",
        },
      });

      const loginOther = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "otheruser",
          password: "password123",
        },
      });

      const {
        data: { accessToken: otherToken },
      } = JSON.parse(loginOther.payload);

      // Add new comment by testUser
      const responseCreate = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: { content: "Comment for unauthorized delete" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const targetCommentId = JSON.parse(responseCreate.payload).data
        .addedComment.id;

      // Try deleting using another user token
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${targetCommentId}`,
        headers: { Authorization: `Bearer ${otherToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond 401 when no authentication is provided", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});
