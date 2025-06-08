const AddCommentUseCase = require("../AddCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

describe("AddCommentUseCase", () => {
  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "This is a comment",
    };
    const threadId = "thread-123";
    const owner = "user-123";

    const expectedAddedComment = new AddedComment({
      id: "comment-xyz789",
      content: useCasePayload.content,
      owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
    mockCommentRepository.addComment = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedComment({
          id: "comment-xyz789",
          content: useCasePayload.content,
          owner,
        })
      )
    );

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload,
      threadId,
      owner
    );

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );

    expect(mockCommentRepository.addComment).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      new NewComment(useCasePayload),
      threadId,
      owner
    );

    const newCommentInstance =
      mockCommentRepository.addComment.mock.calls[0][0];
    expect(newCommentInstance.content).toEqual(useCasePayload.content);
  });

  it("should throw error if thread does not exist", async () => {
    // Arrange
    const useCasePayload = {
      content: "This is a comment",
    };
    const threadId = "thread-nonexistent";
    const owner = "user-123";

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockRejectedValue(new Error("THREAD_NOT_FOUND"));
    mockCommentRepository.addComment = jest.fn();

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addCommentUseCase.execute(useCasePayload, threadId, owner)
    ).rejects.toThrow("THREAD_NOT_FOUND");

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      threadId
    );
    expect(mockCommentRepository.addComment).not.toHaveBeenCalled();
  });
});
