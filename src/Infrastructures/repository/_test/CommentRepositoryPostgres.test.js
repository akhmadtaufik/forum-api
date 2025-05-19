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
  // Common test data
  const userId = "user-123";
  const threadId = "thread-123";
  const commentId = "comment-123";
  const commentContent = "This is a comment";
  const fakeIdGenerator = () => "123";

  // Helper function to create test dependencies
  const createTestDependencies = async ({
    additionalUsers = [],
    isCommentDeleted = false,
  } = {}) => {
    await UsersTableTestHelper.addUser({ id: userId });

    for (const user of additionalUsers) {
      await UsersTableTestHelper.addUser(user);
    }

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userId,
    });

    await CommentsTableTestHelper.addComment({
      id: commentId,
      threadId,
      owner: userId,
      isDeleted: isCommentDeleted,
    });
  };

  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist new comment and return added comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });

      const newComment = new NewComment({ content: commentContent });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment,
        threadId,
        userId
      );

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: commentId,
          content: commentContent,
          owner: userId,
        })
      );
    });
  });

  describe("verifyCommentExists function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists(commentId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError when comment is already deleted", async () => {
      // Arrange
      await createTestDependencies({ isCommentDeleted: true });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists(commentId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when comment exists and is not deleted", async () => {
      // Arrange
      await createTestDependencies();
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentExists(commentId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw AuthorizationError when user is not the owner", async () => {
      // Arrange
      const otherUser = {
        id: "user-456",
        username: "user456",
      };

      await createTestDependencies({ additionalUsers: [otherUser] });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, otherUser.id)
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should throw AuthorizationError when comment is already deleted", async () => {
      // Arrange
      await createTestDependencies({ isCommentDeleted: true });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId)
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw AuthorizationError when user is the owner and comment is not deleted", async () => {
      // Arrange
      await createTestDependencies();
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("deleteComment function", () => {
    it("should update is_deleted flag to true in database", async () => {
      // Arrange
      await createTestDependencies();
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toEqual(true);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return comments for a thread correctly", async () => {
      // Arrange
      const userA = { id: "user-A", username: "userA" };
      const userB = { id: "user-B", username: "userB" };

      await UsersTableTestHelper.addUser(userA);
      await UsersTableTestHelper.addUser(userB);
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userA.id });

      const comment1 = {
        id: "comment-001",
        content: "First comment",
        owner: userA.id,
        threadId,
        date: "2024-01-01T00:00:00.000Z",
      };

      const comment2 = {
        id: "comment-002",
        content: "Second comment, deleted",
        owner: userB.id,
        threadId,
        date: "2024-01-01T00:05:00.000Z",
        isDeleted: true,
      };

      await CommentsTableTestHelper.addComment(comment1);
      await CommentsTableTestHelper.addComment(comment2);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId
      );

      // Assert
      expect(comments).toHaveLength(2);

      // First comment assertions
      expect(comments[0].id).toEqual(comment1.id);
      expect(comments[0].username).toEqual(userA.username);
      expect(comments[0].content).toEqual(comment1.content);
      expect(comments[0].is_deleted).toEqual(false);

      // Second (deleted) comment assertions
      expect(comments[1].id).toEqual(comment2.id);
      expect(comments[1].username).toEqual(userB.username);
      expect(comments[1].content).toEqual("**komentar telah dihapus**");
      expect(comments[1].is_deleted).toEqual(true);
    });
  });
});
