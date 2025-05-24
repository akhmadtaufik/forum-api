const AddedReply = require("../AddedReply");

describe("AddedReply entities", () => {
  it("should throw error when payload did not contain needed property (missing owner)", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "a reply",
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not contain needed property (missing id)", () => {
    // Arrange
    const payload = {
      content: "a reply",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not contain needed property (missing content)", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification (id not string)", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "a reply",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload did not meet data type specification (content not string)", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: 123, // not a string
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload did not meet data type specification (owner not string)", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "a reply",
      owner: 123, // not a string
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError(
      "ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddedReply object correctly", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "a reply",
      owner: "user-123",
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
