const CommentDetail = require("../CommentDetail");

describe("CommentDetail entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      // content property is missing
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: 123, // should be string
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create commentDetail object correctly", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
  });

  it('should mask content with "**komentar telah dihapus**" when isDeleted is true', () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      isDeleted: true,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual("**komentar telah dihapus**");
  });
});
