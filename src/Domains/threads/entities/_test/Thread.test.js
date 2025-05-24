const Thread = require("../Thread");

describe("Thread entities", () => {
  const basePayload = {
    id: "thread-123",
    title: "abc title",
    body: "abc body",
    owner: "user-123",
    date: new Date(),
  };

  it("should throw error when payload not contain needed property (missing date)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.date;

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing id)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.id;
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing title)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.title;
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing body)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.body;
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not contain needed property (missing owner)", () => {
    // Arrange
    const payload = { ...basePayload };
    delete payload.owner;
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload id not meet data type specification", () => {
    // Arrange
    const payload = { ...basePayload, id: 123 };
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload title not meet data type specification", () => {
    // Arrange
    const payload = { ...basePayload, title: 123 };
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload body not meet data type specification", () => {
    // Arrange
    const payload = { ...basePayload, body: 123 };
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload owner not meet data type specification", () => {
    // Arrange
    const payload = { ...basePayload, owner: 123 };
    // Action & Assert
    expect(() => new Thread(payload)).toThrowError(
      "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should throw error when payload date not meet data type specification", () => {
    // Arrange
    const payload = { ...basePayload, date: 123 }; // not string or Date
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
      title: "Sebuah title",
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
      title: "Sebuah title",
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
