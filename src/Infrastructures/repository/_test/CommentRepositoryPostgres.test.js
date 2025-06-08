const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const pool = require("../../database/postgres/pool");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist new comment and return added comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const newCommentEntity = new NewComment({
        // Create NewComment instance
        content: "Comment content",
      });
      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newCommentEntity,
        "thread-123",
        "user-123"
      );

      // Assert
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toEqual("comment-123");
      expect(addedComment.content).toEqual(newCommentEntity.content);
      expect(addedComment.owner).toEqual("user-123");

      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(1);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return empty array when no comments exist for the thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        "thread-123"
      );

      // Assert
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toEqual([]);
    });

    it("should return comments for a thread correctly", async () => {
      // Arrange
      const userA = { id: "user-123", username: "userA" };
      const userB = { id: "user-456", username: "userB" };
      const thread = { id: "thread-123", owner: "user-123" };
      const comment1Date = "2025-05-30T10:30:00.123Z";
      const comment2Date = "2025-05-30T10:35:00.456Z";

      const comment1 = {
        id: "comment-123",
        threadId: thread.id,
        owner: userA.id,
        content: "First comment",
        date: comment1Date,
        isDeleted: false,
      };
      const comment2 = {
        id: "comment-456",
        threadId: thread.id,
        owner: userB.id,
        content: "Second comment, deleted",
        date: comment2Date,
        isDeleted: true,
      };

      await UsersTableTestHelper.addUser(userA);
      await UsersTableTestHelper.addUser(userB);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment1);
      await CommentsTableTestHelper.addComment(comment2);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        thread.id
      );

      // Assert
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual(comment1.id);
      expect(comments[0].username).toEqual(userA.username);
      expect(comments[0].content).toEqual(comment1.content);
      expect(comments[0].date.toISOString()).toEqual(comment1Date);
      expect(comments[0].is_deleted).toEqual(false);

      expect(comments[1].id).toEqual(comment2.id);
      expect(comments[1].username).toEqual(userB.username);
      expect(comments[1].content).toEqual(comment2.content);
      expect(comments[1].date.toISOString()).toEqual(comment2Date);
      expect(comments[1].is_deleted).toEqual(true);
    });
  });

  describe("deleteComment function", () => {
    it("should update is_deleted flag to true in database", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment("comment-123");

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toEqual(true);
    });
  });

  describe("verifyCommentExists function", () => {
    it("should throw NotFoundError when comment does not exist", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists("comment-123")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError when comment is already deleted", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: true,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists("comment-123")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when comment exists and is not deleted", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists("comment-123")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw AuthorizationError when comment owner is not the same as the user", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await UsersTableTestHelper.addUser({
        id: "user-456",
        username: "dicoding2",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-456")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should throw AuthorizationError when comment is already deleted", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: true,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-123")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw AuthorizationError when comment owner is the same as the user and comment is not deleted", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-123")
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("verifyCommentExistsInThread function", () => {
    it("should throw NotFoundError when comment does not exist in the specified thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-456",
        owner: "user-123",
      }); // Another thread
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123", // Comment belongs to thread-123
        owner: "user-123",
        isDeleted: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExistsInThread(
          "comment-123",
          "thread-456"
        ) // Checking against wrong thread
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError when comment exists in thread but is marked as deleted", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: true, // Comment is deleted
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExistsInThread(
          "comment-123",
          "thread-123"
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError when comment ID does not exist", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExistsInThread(
          "comment-nonexistent",
          "thread-123"
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when comment exists in the thread and is not deleted", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDeleted: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExistsInThread(
          "comment-123",
          "thread-123"
        )
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
