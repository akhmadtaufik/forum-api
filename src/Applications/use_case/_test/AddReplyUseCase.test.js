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

    const mockAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner,
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExistsInThread = jest.fn(() =>
      Promise.resolve()
    );
    mockReplyRepository.addReply = jest.fn(() =>
      Promise.resolve(mockAddedReply)
    );

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
    expect(addedReply).toStrictEqual(mockAddedReply);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );
    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledWith(commentId, threadId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new NewReply({ content: useCasePayload.content }),
      commentId,
      owner
    );
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
    ); // Simulate error

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(useCasePayload, owner, threadId, commentId)
    ).rejects.toThrow("THREAD_NOT_FOUND");
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );
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
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );
    expect(
      mockCommentRepository.verifyCommentExistsInThread
    ).toHaveBeenCalledWith(commentId, threadId);
  });
});
