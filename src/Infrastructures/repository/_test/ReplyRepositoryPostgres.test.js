const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const userId = "user-123";
  const threadId = "thread-123";
  const commentId = "comment-123";

  beforeEach(async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: userId, username: "dicoding" });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    await CommentsTableTestHelper.addComment({
      id: commentId,
      owner: userId,
      threadId,
    });
  });

  describe("addReply function", () => {
    it("should persist new reply and return added reply correctly", async () => {
      // Arrange
      const newReply = new NewReply({ content: "This is a reply" });
      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(
        newReply,
        commentId,
        userId
      );

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toBe(newReply.content);
      expect(replies[0].owner).toBe(userId);
      expect(replies[0].comment_id).toBe(commentId);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: newReply.content,
          owner: userId,
        })
      );
    });
  });

  describe("verifyReplyExists function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists(
          "reply-nonexistent",
          commentId,
          threadId
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when reply exists", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-xyz",
        commentId,
        owner: userId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists(
          "reply-xyz",
          commentId,
          threadId
        )
      ).resolves.not.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if reply exists but for a different commentId", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-xyz",
        commentId,
        owner: userId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists(
          "reply-xyz",
          "comment-other",
          threadId
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if reply and comment exist but for a different threadId", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-xyz",
        commentId,
        owner: userId,
      });
      const otherThreadId = "thread-456";
      await ThreadsTableTestHelper.addThread({
        id: otherThreadId,
        owner: userId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists(
          "reply-xyz",
          commentId,
          otherThreadId
        )
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if reply exists but is_deleted is true", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-xyz",
        commentId,
        owner: userId,
        isDeleted: true,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists(
          "reply-xyz",
          commentId,
          threadId
        )
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("verifyReplyAccess function", () => {
    it("should throw AuthorizationError when user is not the owner", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-xyz",
        owner: userId,
        commentId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAccess("reply-xyz", "user-other")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw AuthorizationError when user is the owner", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-xyz",
        owner: userId,
        commentId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAccess("reply-xyz", userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });

    it("should throw NotFoundError if reply does not exist (during access check)", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAccess("reply-nonexistent", userId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError if reply exists but is_deleted is true (during access check)", async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: "reply-xyz",
        owner: userId,
        commentId,
        isDeleted: true,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAccess("reply-xyz", userId)
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("deleteReplyById function", () => {
    it("should soft delete the reply from database", async () => {
      // Arrange
      const replyIdToDelete = "reply-todelete";
      await RepliesTableTestHelper.addReply({
        id: replyIdToDelete,
        owner: userId,
        commentId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById(replyIdToDelete);

      // Assert
      const reply = await RepliesTableTestHelper.getReplyById(replyIdToDelete);
      expect(reply.is_deleted).toEqual(true);
    });

    it("should throw NotFoundError if reply to delete is not found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.deleteReplyById("reply-nonexistent")
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe("getRepliesByCommentIds function", () => {
    it("should return empty array if no replies found for comment IDs", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([
        "comment-nonexistent",
      ]);

      // Assert
      expect(replies).toEqual([]);
    });

    it("should return empty array when commentIds is null", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(
        null
      );

      // Assert
      expect(replies).toEqual([]);
    });

    it("should return empty array when commentIds is undefined", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(
        undefined
      );

      // Assert
      expect(replies).toEqual([]);
    });

    it("should return empty array when commentIds is an empty array", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([]);

      // Assert
      expect(replies).toEqual([]);
    });

    it("should return replies correctly mapped for given comment IDs", async () => {
      // Arrange
      const user2Id = "user-456";
      await UsersTableTestHelper.addUser({ id: user2Id, username: "johndoe" });
      await RepliesTableTestHelper.addReply({
        id: "reply-1",
        commentId,
        owner: userId,
        content: "reply 1 user1",
        date: "2025-05-23T00:00:00.000Z",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-2",
        commentId,
        owner: user2Id,
        content: "reply 2 user2",
        date: "2025-05-23T01:00:00.000Z",
        isDeleted: true,
      });

      const comment2Id = "comment-456";
      await CommentsTableTestHelper.addComment({
        id: comment2Id,
        owner: userId,
        threadId,
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-3",
        commentId: comment2Id,
        owner: userId,
        content: "reply 3 user1 on comment2",
        date: "2025-05-23T00:00:00.000Z",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([
        commentId,
        comment2Id,
      ]);

      // Assert
      expect(replies).toHaveLength(3);
      expect(replies).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "reply-1",
            comment_id: commentId,
            username: "dicoding",
            content: "reply 1 user1",
            date: new Date("2025-05-22T17:00:00.000Z"),
            is_deleted: false,
          }),
          expect.objectContaining({
            id: "reply-2",
            comment_id: commentId,
            username: "johndoe",
            content: "reply 2 user2",
            date: new Date("2025-05-22T18:00:00.000Z"),
            is_deleted: true,
          }),
          expect.objectContaining({
            id: "reply-3",
            comment_id: comment2Id,
            username: "dicoding",
            content: "reply 3 user1 on comment2",
            date: new Date("2025-05-22T17:00:00.000Z"),
            is_deleted: false,
          }),
        ])
      );
      const comment1Replies = replies
        .filter((r) => r.comment_id === commentId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      expect(comment1Replies[0].id).toBe("reply-1");
      expect(comment1Replies[1].id).toBe("reply-2");
    });
  });
});
