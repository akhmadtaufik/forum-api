const AddThreadUseCase = require("../AddThreadUseCase");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "Test Thread Title",
      body: "Test thread body content.",
    };
    const ownerId = "user-123";

    // The AddThreadUseCase directly returns the result of threadRepository.addThread.
    const expectedAddedThread = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: ownerId,
    });

    const mockRepositoryResponse = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: ownerId,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed functions */
    // Mock addThread to return the mockRepositoryResponse
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockRepositoryResponse));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload, ownerId);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new NewThread(useCasePayload),
      ownerId
    );

    // Retrieve the actual NewThread instance passed to the mock for more detailed assertions
    const newThreadInstanceArg =
      mockThreadRepository.addThread.mock.calls[0][0];
    expect(newThreadInstanceArg.title).toEqual(useCasePayload.title);
    expect(newThreadInstanceArg.body).toEqual(useCasePayload.body);
  });
});
