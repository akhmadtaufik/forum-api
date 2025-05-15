const Thread = require("../Thread");

describe("Thread entities", () => {
  it("should throw error when payload not contain needed property", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "abc",
      body: "abc body",
      owner: "user-123",
      // date is missing
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      body: {},
      owner: 12345,
      date: [],
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create Thread entities correctly with string date", () => {
    // Arrange
    const dateNow = new Date().toISOString();
    const payload = {
      id: "thread-123",
      title: "Dicoding Indonesia",
      body: "Isi thread",
      owner: "user-123",
      date: dateNow,
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.owner).toEqual(payload.owner);
    expect(thread.date).toEqual(dateNow);
  });

  it("should create Thread entities correctly with Date object", () => {
    // Arrange
    const dateNow = new Date();
    const payload = {
      id: "thread-123",
      title: "Dicoding Indonesia",
      body: "Isi thread",
      owner: "user-123",
      date: dateNow,
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.owner).toEqual(payload.owner);
    expect(thread.date).toEqual(dateNow);
  });
});
