const AddCommentUseCase = require("../AddCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const NewComment = require("../../../Domains/comments/entities/NewComment");

describe("AddCommentUseCase", () => {
  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "This is a comment",
    };
    const threadId = "thread-123";
    const owner = "user-123";

    // AddCommentUseCase directly returns the result of commentRepository.addComment.
    const expectedAddedComment = {
      id: "comment-xyz789",
      content: useCasePayload.content,
      owner,
    };

    const mockRepositoryResponse = {
      // This should match the structure of AddedComment
      id: "comment-xyz789",
      content: useCasePayload.content,
      owner,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockResolvedValue(undefined);
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockRepositoryResponse));

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
      expect.any(NewComment),
      threadId,
      owner
    );

    const newCommentArgument =
      mockCommentRepository.addComment.mock.calls[0][0];
    expect(newCommentArgument.content).toEqual(useCasePayload.content);
  });
});
