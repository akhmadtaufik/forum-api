const NewThread = require("../NewThread");

describe("NewThread entities", () => {
  it("should throw error when payload not contain needed property (missing body)", () => {
    // Arrange
    const payload = {
      title: "abc",
      // body is missing
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing title)", () => {
    // Arrange
    const payload = {
      body: "abc body",
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload title not meet data type specification", () => {
    // Arrange
    const payload = {
      title: 123, // not a string
      body: "abc body",
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload body not meet data type specification", () => {
    // Arrange
    const payload = {
      title: "abc",
      body: 123, // not a string
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when title contains more than 255 characters", () => {
    // Arrange
    const payload = {
      title: "a".repeat(256),
      body: "abc",
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.TITLE_LIMIT_CHAR"
    );
  });

  it("should create NewThread entities correctly", () => {
    // Arrange
    const payload = {
      title: "Sebuah title",
      body: "Lorem ipsum",
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
