const ReplyDetail = require("../ReplyDetail");

describe("ReplyDetail entities", () => {
  it("should throw error when payload does not contain needed property", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "user-test",
      date: "2023-01-01T00:00:00.000Z",
      // content is missing
      isDeleted: false,
    };

    // Act and Assert
    expect(() => new ReplyDetail(payload)).toThrowError(
      "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload does not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123, // wrong type
      username: "user-test",
      date: "2025-05-20T00:00:00.000Z",
      content: "reply content",
      isDeleted: "false", // wrong type
    };

    // Act and Assert
    expect(() => new ReplyDetail(payload)).toThrowError(
      "REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create ReplyDetail object correctly for non-deleted reply", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "user-test",
      date: new Date().toISOString(),
      content: "reply content",
      isDeleted: false,
    };
    const replyDetail = new ReplyDetail(payload);

    // Act and Assert
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.content).toEqual(payload.content);
  });

  it("should create ReplyDetail object correctly for deleted reply", () => {
    // Arrange
    // Note: The content should be replaced with "**balasan telah dihapus**"
    const payload = {
      id: "reply-abc",
      username: "user-xyz",
      date: new Date().toISOString(),
      content: "original content",
      isDeleted: true,
    };
    const replyDetail = new ReplyDetail(payload);

    // Act and Assert
    // Check if the content is replaced with "**balasan telah dihapus**"
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.content).toEqual("**balasan telah dihapus**");
  });
});
