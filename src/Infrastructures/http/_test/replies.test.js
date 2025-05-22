const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");
const container = require("../../container");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");

describe("/comments endpoint functional tests", () => {
  let server;
  let accessTokenUser1;
  let accessTokenUser2;
  let userId1;
  let userId2;
  let threadId;
  let commentId;
  let replyId;
  const testUser1 = {
    username: "funcreplyuser1",
    password: "password123",
    fullname: "Reply User 1",
  };
  const testUser2 = {
    username: "funcreplyuser2",
    password: "password123",
    fullname: "Reply User 2",
  };

  beforeAll(async () => {
    server = await createServer(container);

    // Register user 1
    const registerResponse1 = await server.inject({
      // Capture response
      method: "POST",
      url: "/users",
      payload: testUser1,
    });
    userId1 = JSON.parse(registerResponse1.payload).data.addedUser.id;

    // Register user 2
    const registerResponse2 = await server.inject({
      // Capture response
      method: "POST",
      url: "/users",
      payload: testUser2,
    });
    userId2 = JSON.parse(registerResponse2.payload).data.addedUser.id;

    // Login user 1
    const loginResponse1 = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        username: testUser1.username,
        password: testUser1.password,
      },
    });

    // Login user 1
    const loginResponse2 = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        username: testUser2.username,
        password: testUser2.password,
      },
    });

    // Access token user 1
    const {
      data: { accessToken: token1 },
    } = JSON.parse(loginResponse1.payload);
    accessTokenUser1 = token1;

    // Access token user 2
    const {
      data: { accessToken: token2 },
    } = JSON.parse(loginResponse2.payload);
    accessTokenUser2 = token2;
  });

  beforeEach(async () => {
    // Create a thread and a comment for tests
    // Create thread
    const threadResponse = await server.inject({
      method: "POST",
      url: "/threads",
      payload: {
        title: "Thread for Replies",
        body: "Thread body",
      },
      headers: { Authorization: `Bearer ${accessTokenUser1}` },
    });

    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    // Create comment
    const commentResponse = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      payload: { content: "Comment for Replies" },
      headers: { Authorization: `Bearer ${accessTokenUser1}` },
    });

    commentId = JSON.parse(commentResponse.payload).data.addedComment.id;
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

  describe("WHEN POST /threads/{threadId}/comments/{commentId}/replies", () => {
    it("should response 201 and persisted reply", async () => {
      // Arrange
      const requestPayload = { content: "This is a test reply." };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(
        requestPayload.content
      );
      expect(responseJson.data.addedReply.owner).toEqual(userId1); // Assert with captured userId1

      const replies = await RepliesTableTestHelper.findReplyById(
        responseJson.data.addedReply.id
      );
      expect(replies).toHaveLength(1);
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {}; // Missing content
      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should response 400 when request payload with invalid data type", async () => {
      // Arrange
      const requestPayload = { content: 123 }; // Invalid type
      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should response 401 when no authentication token provided", async () => {
      const requestPayload = { content: "This is a test reply." };
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });
      expect(response.statusCode).toEqual(401);
    });

    it("should response 404 when thread not found", async () => {
      // Arrange
      const requestPayload = { content: "A reply" };
      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-nonexistent/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Thread tidak ditemukan");
    });

    it("should response 404 when comment not found", async () => {
      // Arrange
      const requestPayload = { content: "A reply" };
      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/comment-nonexistent/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "Komentar pada thread ini tidak ditemukan"
      );
    });
  });

  describe("WHEN DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    beforeEach(async () => {
      // Add a reply by user1
      const addedReply = await RepliesTableTestHelper.addReply({
        id: "reply-todelete",
        content: "reply to delete",
        owner: userId1,
        commentId,
      });
      replyId = addedReply.id;
    });

    it("should response 200 and soft delete the reply", async () => {
      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");

      const deletedReply = await RepliesTableTestHelper.getReplyById(replyId);
      expect(deletedReply.is_deleted).toEqual(true);
    });

    it("should response 403 when user is not the owner of the reply", async () => {
      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessTokenUser2}` }, // User2 trying to delete User1's reply
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "Anda tidak berhak mengakses balasan ini"
      );
    });

    it("should response 404 when reply not found", async () => {
      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-nonexistent`,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Balasan tidak ditemukan");
    });

    it("should response 404 when comment not found for the reply", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/comment-nonexistent/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual(
        "Komentar pada thread ini tidak ditemukan"
      );
    });

    it("should response 404 when thread not found for the reply", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-nonexistent/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessTokenUser1}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual("Thread tidak ditemukan");
    });

    it("should response 401 when no authentication token provided", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });
      expect(response.statusCode).toEqual(401);
    });
  });
});
