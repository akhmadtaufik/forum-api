const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper"); // Import RepliesTableTestHelper
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
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
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
      expect(message).toMatch(/harus string/i);
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
      expect(message).toMatch(/panjang title/i);
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

  describe("GET /threads/{threadId}", () => {
    it("should respond 200 and return thread detail with comments", async () => {
      // Add user, thread, and comments
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await UsersTableTestHelper.addUser({
        id: "user-456",
        username: "johndoe",
      });

      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        owner: "user-123",
        date: "2025-05-19T00:19:09.775Z",
      });

      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "sebuah comment",
        owner: "user-123", // dicoding
        threadId: "thread-123",
        date: "2025-05-19T00:22:33.555Z",
        isDeleted: false,
      });

      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        content: "komentar yang akan dihapus",
        owner: "user-456", // johndoe
        threadId: "thread-123",
        date: "2025-05-19T00:26:21.338Z",
        isDeleted: true,
      });

      // Add replies
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        content: "balasan pertama untuk comment-123",
        owner: "user-456", // johndoe
        commentId: "comment-123",
        date: "2025-05-19T00:30:00.000Z",
        isDeleted: false,
      });

      await RepliesTableTestHelper.addReply({
        id: "reply-456",
        content: "balasan kedua untuk comment-123 (dihapus)",
        owner: "user-123", // dicoding
        commentId: "comment-123",
        date: "2025-05-19T00:32:00.000Z", // Adjusted to UTC
        isDeleted: true,
      });

      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-123",
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();

      const { thread } = responseJson.data;
      expect(thread.id).toEqual("thread-123");
      expect(thread.title).toEqual("sebuah thread");
      expect(thread.body).toEqual("sebuah body thread");
      expect(thread.date).toEqual("2025-05-19T00:19:09.775Z");
      expect(thread.username).toEqual("dicoding");

      expect(thread.comments).toHaveLength(2);
      const [comment1, comment2] = thread.comments;

      // Comment 1 assertions
      expect(comment1.id).toEqual("comment-123");
      expect(comment1.username).toEqual("dicoding");
      expect(comment1.date).toEqual("2025-05-19T00:22:33.555Z");
      expect(comment1.content).toEqual("sebuah comment");
      expect(comment1.replies).toHaveLength(2);

      const [reply1_comment1, reply2_comment1] = comment1.replies;
      expect(reply1_comment1.id).toEqual("reply-123");
      expect(reply1_comment1.username).toEqual("johndoe");
      expect(reply1_comment1.date).toEqual("2025-05-19T00:30:00.000Z");
      expect(reply1_comment1.content).toEqual(
        "balasan pertama untuk comment-123"
      );

      expect(reply2_comment1.id).toEqual("reply-456");
      expect(reply2_comment1.username).toEqual("dicoding");
      expect(reply2_comment1.date).toEqual("2025-05-19T00:32:00.000Z");
      expect(reply2_comment1.content).toEqual("**balasan telah dihapus**");

      // Comment 2 assertions
      expect(comment2.id).toEqual("comment-456");
      expect(comment2.username).toEqual("johndoe");
      expect(comment2.date).toEqual("2025-05-19T00:26:21.338Z");
      expect(comment2.content).toEqual("**komentar telah dihapus**");
      expect(comment2.replies).toEqual([]); // No replies for this comment
    });

    it("should respond 404 when thread not found", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-not-found",
      });

      const { status, message } = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(status).toEqual("fail");
      expect(message).toBeDefined();
    });
  });
});
