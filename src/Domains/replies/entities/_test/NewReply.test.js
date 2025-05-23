const NewReply = require("../NewReply");

describe("NewReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when content is empty", () => {
    // Arrange
    const payload = {
      content: "   ", // content with only spaces
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError("NEW_REPLY.EMPTY_CONTENT");
  });

  it("should throw error NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY when content is an empty string", () => {
    // Arrange
    const payload = {
      content: "", // Empty string
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw TypeError when payload is null", () => {
    // Arrange
    const payload = null;

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(TypeError);
  });

  it("should throw TypeError when payload is undefined", () => {
    // Arrange
    const payload = undefined;

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError(TypeError);
  });

  it("should create NewReply object correctly when content is valid", () => {
    // Arrange
    const payload = {
      content: "This is a valid reply.",
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply).toBeInstanceOf(NewReply);
    expect(newReply.content).toEqual(payload.content);
  });
});
