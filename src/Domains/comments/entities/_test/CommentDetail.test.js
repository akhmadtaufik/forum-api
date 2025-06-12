const CommentDetail = require("../CommentDetail");

describe("CommentDetail entities", () => {
  const basePayload = {
    id: "comment-123",
    username: "user123",
    date: "2025-05-19T07:22:33.555Z",
    content: "sebuah comment",
    replies: [],
    likeCount: 0,
  };

  it("should throw error when payload did not contain needed property (missing content)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      // content property is missing
      likeCount: 0,
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not contain needed property (missing id)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.id;

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not contain needed property (missing username)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.username;

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not contain needed property (missing date)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.date;

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should default likeCount to 0 when likeCount property is missing from payload", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.likeCount; // likeCount is removed

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.likeCount).toBe(0); // Assert it defaults to 0
  });

  it("should throw error when payload did not meet data type specification (content not string)", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: 123, // should be string
      likeCount: 0,
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
      likeCount: 0,
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
      likeCount: 0,
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
      likeCount: 0,
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload likeCount is not a number", () => {
    // Arrange
    const payload = {
      ...basePayload,
      likeCount: "0", // Not a number
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
      likeCount: 0,
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.REPLIES_SHOULD_BE_ARRAY"
    );
  });

  it("should create commentDetail object correctly when replies are not provided and likeCount is provided", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      likeCount: 5,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual([]); // Assert default replies
    expect(commentDetail.likeCount).toEqual(5);
  });

  it("should default likeCount to 0 if not provided in payload but other required fields are present", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      // likeCount is not provided
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.likeCount).toEqual(0);
  });

  it("should create commentDetail object correctly when replies and likeCount are provided", () => {
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
      likeCount: 10,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(mockReplies);
    expect(commentDetail.likeCount).toEqual(10);
  });

  it('should mask content with "**komentar telah dihapus**" when isDeleted is true and include likeCount', () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      isDeleted: true,
      likeCount: 3,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual("**komentar telah dihapus**");
    expect(commentDetail.replies).toEqual([]); // Check replies default
    expect(commentDetail.likeCount).toEqual(3);
  });

  it('should mask content with "**komentar telah dihapus**" when is_deleted (with underscore) is true and include likeCount', () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "user123",
      date: "2025-05-19T07:22:33.555Z",
      content: "sebuah comment",
      is_deleted: true,
      replies: [{ id: "reply-1" }],
      likeCount: 7,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual("**komentar telah dihapus**");
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.likeCount).toEqual(7);
  });

  it("should correctly process date when it is a Date instance, matching specific ISO string and include likeCount", () => {
    // Arrange
    const specificDateString = "2025-05-19T07:22:33.555Z";
    const dateInstance = new Date(specificDateString);
    const basePayload = {
      id: "comment-xyz",
      username: "testuser",
      content: "A test comment",
      replies: [], // Ensure replies is an array
      likeCount: 0,
    };
    const payloadWithDateInstance = {
      ...basePayload,
      date: dateInstance,
      likeCount: 2,
    };

    // Action
    const commentDetail = new CommentDetail(payloadWithDateInstance);

    // Assert
    expect(commentDetail.date).toBe(dateInstance.toISOString());
    expect(commentDetail.date).toBe(specificDateString);
    expect(commentDetail.id).toBe(payloadWithDateInstance.id);
    expect(commentDetail.username).toBe(payloadWithDateInstance.username);
    expect(commentDetail.content).toBe(payloadWithDateInstance.content);
    expect(commentDetail.replies).toEqual(payloadWithDateInstance.replies);
  });
});
