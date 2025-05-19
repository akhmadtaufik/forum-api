const ThreadDetail = require("../../../Domains/threads/entities/ThreadDetail");
const CommentDetail = require("../../../Domains/comments/entities/CommentDetail");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
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
      username: "user-123",
    };

    const expectedComments = [
      {
        id: "comment-123",
        username: "user-123",
        date: "2025-05-19T07:19:09.775Z",
        content: "sebuah comment",
        isDeleted: false,
      },
      {
        id: "comment-456",
        username: "johndoe",
        date: "2025-05-19T07:19:09.775Z",
        content: "komentar yang telah dihapus",
        isDeleted: true,
      },
    ];

    const expectedThreadDetail = new ThreadDetail({
      ...expectedThread,
      comments: expectedComments.map((comment) => new CommentDetail(comment)),
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedComments));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(
      useCasePayload.threadId
    );

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );
  });

  it("should throw NotFoundError when thread does not exist", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() =>
        Promise.reject(new NotFoundError("Thread tidak ditemukan"))
      );

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(
      getThreadDetailUseCase.execute(useCasePayload.threadId)
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
  });
});
