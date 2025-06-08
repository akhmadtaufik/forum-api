const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddReplyUseCase = require("../../../Applications/use_case/AddReplyUseCase");

describe("AddReplyUseCase", () => {
  it("should orchestrating the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "This is a reply",
    };
    const owner = "user-123";
    const threadId = "thread-123";
    const commentId = "comment-123";

    // AddReplyUseCase directly returns the result of replyRepository.addReply.
    const expectedAddedReply = new AddedReply({
      id: "reply-xyz789",
      content: useCasePayload.content,
      owner,
    });

    const mockRepositoryResponse = new AddedReply({
      id: "reply-xyz789",
      content: useCasePayload.content,
      owner,
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentExistsInThread = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockRepositoryResponse));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      owner,
      threadId,
      commentId
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);

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

    expect(mockReplyRepository.addReply).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new NewReply(useCasePayload),
      commentId,
      owner
    );

    const newReplyArgument = mockReplyRepository.addReply.mock.calls[0][0];
    expect(newReplyArgument.content).toEqual(useCasePayload.content);
  });

  it("should throw error if thread does not exist", async () => {
    // Arrange
    const useCasePayload = { content: "reply" };
    const owner = "user-123";
    const threadId = "thread-nonexistent";
    const commentId = "comment-123";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() =>
      Promise.reject(new Error("THREAD_NOT_FOUND"))
    );
    mockCommentRepository.verifyCommentExistsInThread = jest.fn();
    mockReplyRepository.addReply = jest.fn();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(useCasePayload, owner, threadId, commentId)
    ).rejects.toThrow("THREAD_NOT_FOUND");
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );
    // Verify that verifyCommentExistsInThread is not called when thread verification fails
    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).not.toHaveBeenCalled();
  });

  it("should throw error if comment does not exist in thread", async () => {
    // Arrange
    const useCasePayload = { content: "reply" };
    const owner = "user-123";
    const threadId = "thread-123";
    const commentId = "comment-nonexistent";

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistsInThread = jest.fn(() =>
      Promise.reject(new Error("COMMENT_NOT_FOUND"))
    ); // Simulate error

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(useCasePayload, owner, threadId, commentId)
    ).rejects.toThrow("COMMENT_NOT_FOUND");
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
  });
});
