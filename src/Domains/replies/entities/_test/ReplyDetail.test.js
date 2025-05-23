const ReplyDetail = require("../ReplyDetail");

describe("ReplyDetail entities", () => {
  const basePayload = {
    id: "reply-123",
    username: "user-test",
    date: "2025-05-21T00:00:00.000Z",
    content: "reply content",
    isDeleted: false,
  };

  describe("NOT_CONTAIN_NEEDED_PROPERTY error", () => {
    it("should throw error if id is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.id;
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if username is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.username;
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if date is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.date;
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if content is undefined", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.content; // results in content being undefined
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if content is null", () => {
      // Arrange
      const payload = { ...basePayload, content: null };
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if isDeleted is undefined", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.isDeleted; // results in isDeleted being undefined
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if isDeleted is null", () => {
      // Arrange
      const payload = { ...basePayload, isDeleted: null };
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });
  });

  describe("NOT_MEET_DATA_TYPE_SPECIFICATION error", () => {
    it("should throw error if id is not a string", () => {
      // Arrange
      const payload = { ...basePayload, id: 123 };
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if username is not a string", () => {
      // Arrange
      const payload = { ...basePayload, username: 123 };
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if date is not a string or Date object (e.g., number)", () => {
      // Arrange
      const payload = { ...basePayload, date: 1234567890 };
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if content is not a string", () => {
      // Arrange
      const payload = { ...basePayload, content: 123 };
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if isDeleted is not a boolean", () => {
      // Arrange
      const payload = { ...basePayload, isDeleted: "false" };
      // Action & Assert
      expect(() => new ReplyDetail(payload)).toThrowError(
        "REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });
  });

  describe("Successful creation", () => {
    it("should create ReplyDetail object correctly for non-deleted reply with string date", () => {
      // Arrange
      const payload = {
        id: "reply-123",
        username: "user-test",
        date: "2025-05-21T00:00:00.000Z", // String date
        content: "reply content",
        isDeleted: false,
      };
      // Action
      const replyDetail = new ReplyDetail(payload);
      // Assert
      expect(replyDetail.id).toEqual(payload.id);
      expect(replyDetail.username).toEqual(payload.username);
      expect(replyDetail.date).toEqual(payload.date);
      expect(replyDetail.content).toEqual(payload.content);
    });

    it("should create ReplyDetail object correctly for non-deleted reply with Date object date", () => {
      // Arrange
      const dateObject = new Date();
      const payload = {
        id: "reply-123",
        username: "user-test",
        date: dateObject, // Date object
        content: "reply content",
        isDeleted: false,
      };
      // Action
      const replyDetail = new ReplyDetail(payload);
      // Assert
      expect(replyDetail.id).toEqual(payload.id);
      expect(replyDetail.username).toEqual(payload.username);
      expect(replyDetail.date).toEqual(dateObject);
      expect(replyDetail.content).toEqual(payload.content);
    });

    it("should create ReplyDetail object correctly for deleted reply", () => {
      // Arrange
      const payload = {
        id: "reply-abc",
        username: "user-xyz",
        date: new Date().toISOString(),
        content: "original content",
        isDeleted: true,
      };
      // Action
      const replyDetail = new ReplyDetail(payload);
      // Assert
      expect(replyDetail.id).toEqual(payload.id);
      expect(replyDetail.username).toEqual(payload.username);
      expect(replyDetail.date).toEqual(payload.date);
      expect(replyDetail.content).toEqual("**balasan telah dihapus**");
    });
  });
});
