const NewComment = require("../NewComment");

describe("NewComment entities", () => {
  it("should create newComment object correctly", () => {
    // Arrange
    const payload = {
      content: "sebuah comment",
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.content).toEqual(payload.content);
  });

  it("should throw error when payload not contain needed property", () => {
    // Arrange
    const payload = {
      // content property missing
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: 123, // should be string
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when content is empty string", () => {
    // Arrange
    const payload = {
      content: "",
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });
});
