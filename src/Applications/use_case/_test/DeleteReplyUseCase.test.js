const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteReplyUseCase = require("../DeleteReplyUseCase");

describe("DeleteReplyUseCase", () => {
  it("should orchestrating the delete reply action correctly", async () => {
    // Arrange
    const owner = "user-123";
    const threadId = "thread-123";
    const commentId = "comment-123";
    const replyId = "reply-123";

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistsInThread = jest.fn(() =>
      Promise.resolve()
    );
    mockReplyRepository.verifyReplyExists = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyAccess = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(owner, threadId, commentId, replyId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );

    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledTimes(1);
    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledWith(commentId, threadId);

    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith(
      replyId,
      commentId,
      threadId
    );

    expect(mockReplyRepository.verifyReplyAccess).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyAccess).toHaveBeenCalledWith(
      replyId,
      owner
    );

    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(replyId);
  });

  it("should throw error if user is not the owner of the reply", async () => {
    // Arrange
    const owner = "user-not-owner";
    const threadId = "thread-123";
    const commentId = "comment-123";
    const replyId = "reply-123";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistsInThread = jest.fn(() =>
      Promise.resolve()
    );
    mockReplyRepository.verifyReplyExists = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyAccess = jest.fn(() =>
      Promise.reject(new Error("AUTHORIZATION_ERROR"))
    ); // Simulate auth error

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(owner, threadId, commentId, replyId)
    ).rejects.toThrow("AUTHORIZATION_ERROR");

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );

    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledTimes(1);
    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledWith(commentId, threadId);

    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith(
      replyId,
      commentId,
      threadId
    );

    expect(mockReplyRepository.verifyReplyAccess).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.verifyReplyAccess).toHaveBeenCalledWith(
      replyId,
      owner
    );
  });
});
