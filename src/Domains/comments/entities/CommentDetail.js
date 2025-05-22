class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      username,
      date,
      content,
      isDeleted = false,
      is_deleted = false,
      replies = [],
    } = payload;
    const deleted = isDeleted || is_deleted;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = deleted ? "**komentar telah dihapus**" : content;
    this.replies = replies;
  }

  _verifyPayload({ id, username, date, content, replies }) {
    if (!id || !username || !date || !content) {
      throw new Error("COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (replies && !Array.isArray(replies)) {
      throw new Error("COMMENT_DETAIL.REPLIES_SHOULD_BE_ARRAY");
    }

    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      (typeof date !== "string" && !(date instanceof Date)) ||
      typeof content !== "string" ||
      (replies !== undefined && !Array.isArray(replies))
    ) {
      throw new Error("COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = CommentDetail;
