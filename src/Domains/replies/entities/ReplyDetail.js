class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, isDeleted } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDeleted ? "**balasan telah dihapus**" : content;
  }

  _verifyPayload({ id, username, date, content, isDeleted }) {
    if (
      !id ||
      !username ||
      !date ||
      content === undefined ||
      content === null ||
      isDeleted === undefined ||
      isDeleted === null
    ) {
      throw new Error("REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      (typeof date !== "string" && !(date instanceof Date)) || // Allow Date object
      typeof content !== "string" ||
      typeof isDeleted !== "boolean"
    ) {
      throw new Error("REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = ReplyDetail;
