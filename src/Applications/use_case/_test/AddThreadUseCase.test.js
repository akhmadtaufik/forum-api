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

    const expectedAddedThread = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: ownerId,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed functions */
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload, ownerId);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    // Verify that NewThread was instantiated correctly within the use case
    // The first argument to mockThreadRepository.addThread should be an instance of NewThread
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      expect.objectContaining({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
      ownerId
    );
    expect(mockThreadRepository.addThread.mock.calls[0][0]).toBeInstanceOf(
      NewThread
    );
    expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
  });
});
