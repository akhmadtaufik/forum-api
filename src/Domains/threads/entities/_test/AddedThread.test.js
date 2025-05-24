const AddedThread = require("../AddedThread");

describe("AddedThread entities", () => {
  it("should throw error when payload not contain needed property (missing owner)", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "abc",
      // owner is missing
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing id)", () => {
    // Arrange
    const payload = {
      title: "abc",
      owner: "user-123",
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing title)", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      owner: "user-123",
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload id not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123, // not a string
      title: "abc",
      owner: "user-123",
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload title not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: 123, // not a string
      owner: "user-123",
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload owner not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "abc",
      owner: 123, // not a string
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddedThread entities correctly", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "Sebuah title",
      owner: "user-123",
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
