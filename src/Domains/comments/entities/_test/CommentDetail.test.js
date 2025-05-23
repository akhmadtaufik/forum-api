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

  it("should throw error when payload id is not a string", () => {
    // Arrange
    const payload = {
      id: 123, // not a string
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload username is not a string", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: 123, // not a string
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload date is not a string or Date object", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: 1234567890, // not a string or Date object
      content: "sebuah comment",
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when replies is not an array if provided", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      replies: "this is not an array",
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.REPLIES_SHOULD_BE_ARRAY" // Corrected expected error
    );
  });

  it("should create commentDetail object correctly when replies are not provided", () => {
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
    expect(commentDetail.replies).toEqual([]); // Assert default replies
  });

  it("should create commentDetail object correctly when replies are provided", () => {
    // Arrange
    const mockReplies = [
      { id: "reply-1", content: "reply content 1" },
      { id: "reply-2", content: "reply content 2" },
    ];
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      replies: mockReplies,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(mockReplies);
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
    expect(commentDetail.replies).toEqual([]); // Check replies default
  });

  it('should mask content with "**komentar telah dihapus**" when is_deleted (with underscore) is true', () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      is_deleted: true, // Using is_deleted with underscore
      replies: [{ id: "reply-1" }], // Providing some replies
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual("**komentar telah dihapus**");
    expect(commentDetail.replies).toEqual(payload.replies); // Check replies are passed through
  });
});
