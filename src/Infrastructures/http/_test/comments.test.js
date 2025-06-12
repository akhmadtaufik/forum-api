const Jwt = require("@hapi/jwt");
const pool = require("../../database/postgres/pool");
const createServer = require("../../../Infrastructures/http/createServer");
const container = require("../../container");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");

describe("/comments endpoint functional tests", () => {
  let server;
  let accessToken;
  let initialThreadId;
  let initialCommentId;

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

    // Create initial thread
    const threadResponse = await server.inject({
      method: "POST",
      url: "/threads",
      payload: {
        title: "Initial Test Thread",
        body: "Initial thread body",
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    initialThreadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    // Create initial comment
    const commentResponse = await server.inject({
      method: "POST",
      url: `/threads/${initialThreadId}/comments`,
      payload: { content: "Initial test comment" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    initialCommentId = JSON.parse(commentResponse.payload).data.addedComment.id;
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("POST /threads/{threadId}/comments endpoint", () => {
    it("should respond 201 and persist comment", async () => {
      // Arrange
      const payload = { content: "Test comment for POST" };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${initialThreadId}/comments`,
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();

      const comments = await CommentsTableTestHelper.findCommentById(
        responseJson.data.addedComment.id
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual(payload.content);
    });

    it("should respond 400 when payload missing content", async () => {
      const response = await server.inject({
        method: "POST",
        url: `/threads/${initialThreadId}/comments`,
        payload: {},
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toMatch("harus mengirimkan content");
    });

    it("should respond 400 when content has invalid type", async () => {
      const response = await server.inject({
        method: "POST",
        url: `/threads/${initialThreadId}/comments`,
        payload: { content: 12345 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toMatch("content harus berupa string");
    });

    it("should respond 404 when thread not found", async () => {
      const fakeThreadId = "thread-xxx-post";
      const response = await server.inject({
        method: "POST",
        url: `/threads/${fakeThreadId}/comments`,
        payload: { content: "Test comment" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toMatch("Thread tidak ditemukan");
    });

    it("should respond 401 when missing authentication", async () => {
      const response = await server.inject({
        method: "POST",
        url: `/threads/${initialThreadId}/comments`,
        payload: { content: "Test comment" },
      });
      expect(response.statusCode).toEqual(401);
    });
  });

  describe("DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should respond 200 and soft delete the comment", async () => {
      // Arrange: add a new comment specifically for this test
      const commentPayload = { content: "Comment to be deleted" };
      const createResponse = await server.inject({
        method: "POST",
        url: `/threads/${initialThreadId}/comments`,
        payload: commentPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const newCommentId = JSON.parse(createResponse.payload).data.addedComment
        .id;

      // Act
      const deleteResponse = await server.inject({
        method: "DELETE",
        url: `/threads/${initialThreadId}/comments/${newCommentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const deleteJson = JSON.parse(deleteResponse.payload);
      expect(deleteResponse.statusCode).toEqual(200);
      expect(deleteJson.status).toEqual("success");

      const comments = await CommentsTableTestHelper.findCommentById(
        newCommentId
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toEqual(true);
    });

    it("should respond 404 when thread not found for delete", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-not-found-del/comments/${initialCommentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
    });

    it("should respond 404 when comment not found for delete", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${initialThreadId}/comments/comment-not-found-del`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
    });

    it("should respond 403 when user is not the owner for delete", async () => {
      // Register another user via API endpoint
      const otherUserPayload = {
        username: "otheruserdel",
        password: "password123",
        fullname: "Other User Del For Delete Test",
      };
      const registerOtherUserResponse = await server.inject({
        method: "POST",
        url: "/users",
        payload: otherUserPayload,
      });
      expect(registerOtherUserResponse.statusCode).toEqual(201);

      // Login the other user
      const loginOther = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "otheruserdel", password: "password123" },
      });
      expect([200, 201]).toContain(loginOther.statusCode); // Ensure login was successful (200 or 201)
      const loginOtherJson = JSON.parse(loginOther.payload);
      expect(loginOtherJson.data).toBeDefined();
      expect(loginOtherJson.data.accessToken).toBeDefined();
      const otherToken = loginOtherJson.data.accessToken;

      // testUser creates a comment
      const commentToStealPayload = { content: "Comment by original owner" };
      const createResponse = await server.inject({
        method: "POST",
        url: `/threads/${initialThreadId}/comments`,
        payload: commentToStealPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const targetCommentId = JSON.parse(createResponse.payload).data
        .addedComment.id;

      // otheruser tries to delete it
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${initialThreadId}/comments/${targetCommentId}`,
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      expect(response.statusCode).toEqual(403);
    });

    it("should respond 401 when no authentication is provided for delete", async () => {
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${initialThreadId}/comments/${initialCommentId}`,
      });
      expect(response.statusCode).toEqual(401);
    });
  });

  describe("PUT /threads/{threadId}/comments/{commentId}/likes endpoint", () => {
    let specificThreadId;
    let specificCommentId;

    beforeEach(async () => {
      // Create a new thread for these tests
      const threadResponse = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Like Test Thread",
          body: "Thread for like/unlike tests",
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      specificThreadId = JSON.parse(threadResponse.payload).data.addedThread.id;

      // Create a new comment in this thread for these tests
      const commentResponse = await server.inject({
        method: "POST",
        url: `/threads/${specificThreadId}/comments`,
        payload: { content: "Comment for like/unlike tests" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      specificCommentId = JSON.parse(commentResponse.payload).data.addedComment
        .id;
    });

    it("should respond 200 and like the comment if not already liked", async () => {
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${specificThreadId}/comments/${specificCommentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");

      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(
        specificCommentId
      );
      expect(likes).toHaveLength(1);
      // Get userId from the accessToken
      const decodedToken = Jwt.token.decode(accessToken);
      const userIdFromToken = decodedToken.decoded.payload.id;
      expect(likes[0].user_id).toEqual(userIdFromToken);

      const threadDetailResponse = await server.inject({
        method: "GET",
        url: `/threads/${specificThreadId}`,
      });
      const threadDetailJson = JSON.parse(threadDetailResponse.payload);
      const targetComment = threadDetailJson.data.thread.comments.find(
        (c) => c.id === specificCommentId
      );
      expect(targetComment.likeCount).toEqual(1);
    });

    it("should respond 200 and unlike the comment if already liked", async () => {
      // First, like the comment
      await server.inject({
        method: "PUT",
        url: `/threads/${specificThreadId}/comments/${specificCommentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      let likes = await CommentLikesTableTestHelper.findLikesByCommentId(
        specificCommentId
      );
      expect(likes).toHaveLength(1);

      // Action: Unlike the comment
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${specificThreadId}/comments/${specificCommentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");

      likes = await CommentLikesTableTestHelper.findLikesByCommentId(
        specificCommentId
      );
      expect(likes).toHaveLength(0);

      const threadDetailResponse = await server.inject({
        method: "GET",
        url: `/threads/${specificThreadId}`,
      });
      const threadDetailJson = JSON.parse(threadDetailResponse.payload);
      const targetComment = threadDetailJson.data.thread.comments.find(
        (c) => c.id === specificCommentId
      );
      expect(targetComment.likeCount).toEqual(0);
    });

    it("should respond 401 when missing authentication for likes", async () => {
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${specificThreadId}/comments/${specificCommentId}/likes`,
      });
      expect(response.statusCode).toEqual(401);
    });

    it("should respond 404 when thread not found for likes", async () => {
      const response = await server.inject({
        method: "PUT",
        url: `/threads/thread-xxx-like/comments/${specificCommentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toMatch("Thread tidak ditemukan");
    });

    it("should respond 404 when comment not found in thread for likes", async () => {
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${specificThreadId}/comments/comment-xxx-like/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toMatch(
        "Komentar pada thread ini tidak ditemukan"
      );
    });
  });
});
