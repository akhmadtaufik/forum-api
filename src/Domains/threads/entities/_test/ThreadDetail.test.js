const ThreadDetail = require("../ThreadDetail");

describe("ThreadDetail entities", () => {
  // Base valid payload for constructing test cases
  const basePayload = {
    id: "thread-123",
    title: "judul thread",
    body: "isi thread",
    date: "2025-05-19T07:19:09.775Z",
    username: "user-123",
    comments: [],
  };

  describe("Property validation: NOT_CONTAIN_NEEDED_PROPERTY", () => {
    it("should throw error if id is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.id;

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if title is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.title;

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if body is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.body;

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if date is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.date;

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if username is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.username;

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });

    it("should throw error if comments property is missing", () => {
      // Arrange
      const payload = { ...basePayload };
      delete payload.comments; // comments property is missing (undefined)

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
      );
    });
  });

  describe("Data type validation: NOT_MEET_DATA_TYPE_SPECIFICATION", () => {
    it("should throw error if id is not a string", () => {
      // Arrange
      const payload = { ...basePayload, id: 123 };

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if title is not a string (covers Line 21)", () => {
      // Arrange
      const payload = { ...basePayload, title: 123 }; // title is not a string

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if body is not a string", () => {
      // Arrange
      const payload = { ...basePayload, body: 123 };

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if date is not a string or Date object", () => {
      // Arrange
      const payload = { ...basePayload, date: 1234567890 }; // date is a number

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error if username is not a string", () => {
      // Arrange
      const payload = { ...basePayload, username: 123 };

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });

    it("should throw error when comments is not an array", () => {
      // Arrange
      const payload = { ...basePayload, comments: "not an array" };

      // Action & Assert
      expect(() => new ThreadDetail(payload)).toThrowError(
        "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });
  });

  describe("Successful creation", () => {
    it("should create threadDetail object correctly with string date", () => {
      // Arrange
      const payload = {
        id: "thread-123",
        title: "judul thread",
        body: "isi thread",
        date: "2025-05-19T07:19:09.775Z", // Date as string
        username: "user-123",
        comments: [{ id: "comment-1" }],
      };

      // Action
      const threadDetail = new ThreadDetail(payload);

      // Assert
      expect(threadDetail.id).toEqual(payload.id);
      expect(threadDetail.title).toEqual(payload.title);
      expect(threadDetail.body).toEqual(payload.body);
      expect(threadDetail.date).toEqual(payload.date);
      expect(threadDetail.username).toEqual(payload.username);
      expect(threadDetail.comments).toEqual(payload.comments);
    });

    it("should create threadDetail object correctly with Date object for date", () => {
      // Arrange
      const dateObject = new Date();
      const payload = {
        id: "thread-123",
        title: "judul thread",
        body: "isi thread",
        date: dateObject, // Date as Date object
        username: "user-123",
        comments: [],
      };

      // Action
      const threadDetail = new ThreadDetail(payload);

      // Assert
      expect(threadDetail.id).toEqual(payload.id);
      expect(threadDetail.title).toEqual(payload.title);
      expect(threadDetail.body).toEqual(payload.body);
      expect(threadDetail.date).toEqual(dateObject);
      expect(threadDetail.username).toEqual(payload.username);
      expect(threadDetail.comments).toEqual(payload.comments);
    });
  });
});
