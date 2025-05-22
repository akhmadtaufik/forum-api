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
    const useCasePayload = {
      threadId: "thread-123",
    };

    const expectedThread = {
      id: "thread-123",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2025-05-19T07:19:09.775Z",
      username: "dicoding",
    };

    const expectedComments = [
      {
        id: "comment-123",
        username: "dicoding",
        date: "2025-05-19T07:22:33.555Z",
        content: "sebuah comment",
        is_deleted: false,
      },
      {
        id: "comment-456",
        username: "johndoe",
        date: "2025-05-19T07:26:21.338Z",
        content: "komentar yang telah dihapus",
        is_deleted: true,
      },
    ];

    const expectedReplies = [
      {
        id: "reply-123",
        comment_id: "comment-123", // Belongs to the first comment
        username: "johndoe",
        date: "2025-05-19T07:23:00.000Z",
        content: "sebuah balasan",
        is_deleted: false,
      },
      {
        id: "reply-456",
        comment_id: "comment-123", // Belongs to the first comment
        username: "dicoding",
        date: "2025-05-19T07:24:00.000Z",
        content: "balasan yang dihapus",
        is_deleted: true,
      },
      // No replies for comment-456 in this example
    ];

    // Create expected CommentDetail instances with proper masking and replies
    const expectedCommentDetails = expectedComments.map((comment) => {
      const commentRepliesData = expectedReplies
        .filter((reply) => reply.comment_id === comment.id)
        .map(
          (reply) =>
            new ReplyDetail({
              id: reply.id,
              content: reply.content,
              date: reply.date,
              username: reply.username,
              isDeleted: reply.is_deleted, // Pass is_deleted to ReplyDetail
            })
        );
      return new CommentDetail({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content, // Content from raw comment
        isDeleted: comment.is_deleted, // Pass is_deleted to CommentDetail
        replies: commentRepliesData,
      });
    });

    const expectedThreadDetail = new ThreadDetail({
      ...expectedThread,
      comments: expectedCommentDetails,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository(); // Create mock ReplyRepository

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest // Mock verifyThreadExists
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesByCommentIds = jest // Mock getRepliesByCommentIds
      .fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository, // Inject mockReplyRepository
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(
      useCasePayload.threadId
    );

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );
    // Assert that getRepliesByCommentIds is called with the IDs of comments that are not deleted.
    // Or simply with all comment IDs if the use case logic fetches for all.
    // Current use case fetches for all comments initially.
    const expectedCommentIds = expectedComments.map((comment) => comment.id);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(
      expectedCommentIds
    );
  });

  it("should orchestrating the get thread detail action correctly when no comments exist", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const expectedThread = {
      id: "thread-123",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2025-05-19T07:19:09.775Z",
      username: "dicoding",
    };

    const expectedComments = []; // No comments

    const expectedThreadDetail = new ThreadDetail({
      ...expectedThread,
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
      .mockResolvedValue(expectedThread);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(expectedComments);
    // getRepliesByCommentIds should not be called if there are no comments
    mockReplyRepository.getRepliesByCommentIds = jest
      .fn()
      .mockResolvedValue([]);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(
      useCasePayload.threadId
    );

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockReplyRepository.getRepliesByCommentIds).not.toBeCalled();
  });

  it("should throw NotFoundError when thread does not exist", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository(); // Add mockReplyRepository

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest // Mock verifyThreadExists to reject
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("Thread tidak ditemukan"))
      );
    // getThreadById should not be called if verifyThreadExists rejects
    mockThreadRepository.getThreadById = jest.fn();

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository, // Inject mockReplyRepository
    });

    // Action & Assert
    await expect(
      getThreadDetailUseCase.execute(useCasePayload.threadId)
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      // Check verifyThreadExists was called
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getThreadById).not.toBeCalled(); // Ensure getThreadById was not called
  });
});
