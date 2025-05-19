const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("DeleteCommentUseCase", () => {
  it("should orchestrating the delete comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(
      useCasePayload.threadId,
      useCasePayload.commentId,
      useCasePayload.owner
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.commentId
    );
  });

  it("should throw NotFoundError when thread does not exist", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("Thread tidak ditemukan"))
      );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(
        useCasePayload.threadId,
        useCasePayload.commentId,
        useCasePayload.owner
      )
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
  });

  it("should throw NotFoundError when comment does not exist", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("Komentar tidak ditemukan"))
      );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(
        useCasePayload.threadId,
        useCasePayload.commentId,
        useCasePayload.owner
      )
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId
    );
  });

  it("should throw AuthorizationError when user is not the comment owner", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(
          new AuthorizationError("Anda tidak berhak mengakses resource ini")
        )
      );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(
        useCasePayload.threadId,
        useCasePayload.commentId,
        useCasePayload.owner
      )
    ).rejects.toThrowError(AuthorizationError);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner
    );
  });
});
