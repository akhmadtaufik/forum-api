const Comment = require("../Comment");

describe("Comment entity", () => {
  it("should create comment object correctly", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: new Date(),
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.date).toEqual(payload.date);
    expect(comment.owner).toEqual(payload.owner);
    expect(comment.threadId).toEqual(payload.threadId);
    expect(comment.isDeleted).toEqual(payload.isDeleted);
  });

  it("should create comment object correctly with string date", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: "2025-05-24T07:19:09.775Z",
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.date).toEqual(payload.date);
    expect(comment.owner).toEqual(payload.owner);
    expect(comment.threadId).toEqual(payload.threadId);
    expect(comment.isDeleted).toEqual(payload.isDeleted);
  });

  it("should throw error when payload not contain needed property (missing date and isDeleted)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      owner: "user-123",
      threadId: "thread-123",
      // date and isDeleted property missing
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing id)", () => {
    // Arrange
    const payload = {
      content: "sebuah comment",
      date: new Date(),
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: false,
    };
    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing content)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      date: new Date(),
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: false,
    };
    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing owner)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: new Date(),
      threadId: "thread-123",
      isDeleted: false,
    };
    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing threadId)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: new Date(),
      owner: "user-123",
      isDeleted: false,
    };
    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload content did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: 123, // should be string
      date: new Date(),
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: false,
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload id did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123, // should be string
      content: "sebuah comment",
      date: new Date(),
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: false,
    };
    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload owner did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: new Date(),
      owner: 123, // should be string
      threadId: "thread-123",
      isDeleted: false,
    };
    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload threadId did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: new Date(),
      owner: "user-123",
      threadId: 123, // should be string
      isDeleted: false,
    };
    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload date has invalid data type", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: 123, // should be string or Date
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: false,
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when isDeleted has invalid data type", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      content: "sebuah comment",
      date: new Date(),
      owner: "user-123",
      threadId: "thread-123",
      isDeleted: "false", // should be boolean
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError(
      "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });
});
