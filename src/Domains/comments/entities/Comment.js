class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, date, owner, threadId, isDeleted } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.owner = owner;
    this.threadId = threadId;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({ id, content, date, owner, threadId, isDeleted }) {
    if (
      !id ||
      !content ||
      date === undefined ||
      !owner ||
      !threadId ||
      isDeleted === undefined
    ) {
      throw new Error("COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof content !== "string" ||
      !(typeof date === "string" || date instanceof Date) ||
      typeof owner !== "string" ||
      typeof threadId !== "string" ||
      typeof isDeleted !== "boolean"
    ) {
      throw new Error("COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = Comment;
