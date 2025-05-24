const ThreadDetail = require("../../../Domains/threads/entities/ThreadDetail");
const CommentDetail = require("../../../Domains/comments/entities/CommentDetail");
const ReplyDetail = require("../../../Domains/replies/entities/ReplyDetail"); // Import ReplyDetail
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository"); // Import ReplyRepository
const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrating the get thread detail action correctly", async () => {
    // Arrange
    const useCaseThreadId = "thread-xyz";

    // 1. Raw data returned by mocks
    const mockRawThreadData = {
      id: useCaseThreadId,
      title: "Mock Thread Title from Repo",
      body: "Mock thread body from Repo",
      date: new Date("2025-05-22T10:00:00.000Z"),
      username: "repoUser",
    };

    const mockRawCommentsData = [
      {
        id: "comment-repo-1",
        username: "commenterRepo1",
        date: new Date("2025-05-22T10:05:00.000Z"),
        content: "Raw comment 1 content from repo",
        is_deleted: false,
      },
      {
        id: "comment-repo-2",
        username: "commenterRepo2",
        date: new Date("2025-05-22T10:10:00.000Z"),
        content: "Raw comment 2 content (deleted) from repo",
        is_deleted: true,
      },
    ];

    const mockRawRepliesData = [
      {
        id: "reply-repo-A",
        comment_id: "comment-repo-1",
        username: "replierRepoA",
        date: new Date("2025-05-22T10:06:00.000Z"),
        content: "Raw reply A to comment 1 from repo",
        is_deleted: false,
      },
      {
        id: "reply-repo-B",
        comment_id: "comment-repo-1",
        username: "replierRepoB",
        date: new Date("2025-05-22T10:07:00.000Z"),
        content: "Raw reply B to comment 1 (deleted) from repo",
        is_deleted: true,
      },
    ];

    // 2. Construct the truly expected ThreadDetail based on how the use case should process the mockRawData
    const expectedProcessedComments = mockRawCommentsData.map((rawComment) => {
      const processedReplies = mockRawRepliesData
        .filter((rawReply) => rawReply.comment_id === rawComment.id)
        .map(
          (rawReply) =>
            new ReplyDetail({
              id: rawReply.id,
              content: rawReply.content,
              date: rawReply.date,
              username: rawReply.username,
              isDeleted: rawReply.is_deleted,
            })
        );
      return new CommentDetail({
        id: rawComment.id,
        username: rawComment.username,
        date: rawComment.date,
        content: rawComment.content,
        isDeleted: rawComment.is_deleted,
        replies: processedReplies,
      });
    });

    const expectedThreadDetail = new ThreadDetail({
      id: mockRawThreadData.id,
      title: mockRawThreadData.title,
      body: mockRawThreadData.body,
      date: mockRawThreadData.date,
      username: mockRawThreadData.username,
      comments: expectedProcessedComments,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockResolvedValue(undefined);
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(mockRawThreadData);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(mockRawCommentsData);
    mockReplyRepository.getRepliesByCommentIds = jest
      .fn()
      .mockResolvedValue(mockRawRepliesData);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const actualThreadDetail = await getThreadDetailUseCase.execute(
      useCaseThreadId
    );

    // Assert
    // 3. Assert that the actual result from the use case matches the independently constructed expectedThreadDetail
    expect(actualThreadDetail).toStrictEqual(expectedThreadDetail);

    // 4. Verify all mock interactions
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      useCaseThreadId
    );

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCaseThreadId
    );

    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledTimes(
      1
    );
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCaseThreadId
    );

    const expectedCommentIdsForRepoCall = mockRawCommentsData.map(
      (comment) => comment.id
    );
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(
      expectedCommentIdsForRepoCall
    );
  });

  it("should orchestrating the get thread detail action correctly when no comments exist", async () => {
    // Arrange
    const useCaseThreadId = "thread-no-comments";

    const mockRawThreadData = {
      id: useCaseThreadId,
      title: "Mock Thread No Comments",
      body: "Mock body no comments",
      date: new Date("2025-05-22T11:00:00.000Z"),
      username: "testUserNoComments",
    };
    const mockRawCommentsDataEmpty = []; // No comments

    // Construct expected ThreadDetail
    const expectedThreadDetailWithNoComments = new ThreadDetail({
      ...mockRawThreadData,
      comments: [], // Expect empty array for comments
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockResolvedValue(undefined);
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockResolvedValue(mockRawThreadData);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(mockRawCommentsDataEmpty);
    mockReplyRepository.getRepliesByCommentIds = jest.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const actualThreadDetail = await getThreadDetailUseCase.execute(
      useCaseThreadId
    );

    // Assert
    expect(actualThreadDetail).toStrictEqual(
      expectedThreadDetailWithNoComments
    );
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      useCaseThreadId
    );
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCaseThreadId
    );
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCaseThreadId
    );
    expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when thread does not exist", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest // Mock verifyThreadExists to reject
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("Thread tidak ditemukan"))
      );
    // getThreadById should not be called if verifyThreadExists rejects
    mockThreadRepository.getThreadById = jest.fn();
    // Mock other repository methods that should not be called
    mockCommentRepository.getCommentsByThreadId = jest.fn();
    mockReplyRepository.getRepliesByCommentIds = jest.fn();

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      getThreadDetailUseCase.execute(useCasePayload.threadId)
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getThreadById).not.toHaveBeenCalled();
    expect(mockCommentRepository.getCommentsByThreadId).not.toHaveBeenCalled();
    expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
  });
});
