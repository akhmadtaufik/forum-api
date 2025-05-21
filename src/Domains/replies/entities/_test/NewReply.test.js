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
      content: "   ",
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError("NEW_REPLY.EMPTY_CONTENT");
  });

  it("should throw error when content is empty", () => {
    // Arrange
    const payload = {
      content: "   ",
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError("NEW_REPLY.EMPTY_CONTENT");
  });
});
