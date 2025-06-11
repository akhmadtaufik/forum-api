const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const LikeUnlikeCommentUseCase = require("../LikeUnlikeCommentUseCase");

describe("LikeUnlikeCommentUseCase", () => {
  it("should orchestrate the like comment action correctly when comment is not liked", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistsInThread = jest.fn(() =>
      Promise.resolve()
    );
    mockCommentRepository.verifyCommentLikeExists = jest.fn(() =>
      Promise.resolve(false)
    ); // Not liked
    mockCommentRepository.addCommentLike = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteCommentLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentLikeExists).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId
    );
    expect(mockCommentRepository.addCommentLike).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId
    );
    expect(mockCommentRepository.deleteCommentLike).not.toHaveBeenCalled();
  });

  it("should orchestrate the unlike comment action correctly when comment is already liked", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistsInThread = jest.fn(() =>
      Promise.resolve()
    );
    mockCommentRepository.verifyCommentLikeExists = jest.fn(() =>
      Promise.resolve(true)
    ); // Already liked
    mockCommentRepository.addCommentLike = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteCommentLike = jest.fn(() => Promise.resolve());

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentLikeExists).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId
    );
    expect(mockCommentRepository.deleteCommentLike).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId
    );
    expect(mockCommentRepository.addCommentLike).not.toHaveBeenCalled();
  });
});
