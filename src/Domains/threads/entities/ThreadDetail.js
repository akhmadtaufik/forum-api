class ThreadDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, date, username, comments } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date =
      date instanceof Date ? date.toISOString() : new Date(date).toISOString();
    this.username = username;
    this.comments = comments;
  }

  _verifyPayload({ id, title, body, date, username, comments }) {
    if (!id || !title || !body || !date || !username || !comments) {
      throw new Error("THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof title !== "string" ||
      typeof body !== "string" ||
      (typeof date !== "string" && !(date instanceof Date)) ||
      typeof username !== "string" ||
      !Array.isArray(comments)
    ) {
      throw new Error("THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = ThreadDetail;
