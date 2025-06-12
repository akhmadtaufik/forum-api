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
      likeCount = 0, // Add likeCount with a default value
    } = payload;
    const deleted = isDeleted || is_deleted;

    this.id = id;
    this.username = username;
    this.date =
      date instanceof Date ? date.toISOString() : new Date(date).toISOString();
    this.content = deleted ? "**komentar telah dihapus**" : content;
    this.replies = replies;
    this.likeCount = likeCount;
  }

  _verifyPayload({ id, username, date, content, replies, likeCount }) {
    if (!id || !username || !date || !content) {
      // Check for likeCount
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
      (replies !== undefined && !Array.isArray(replies)) ||
      (likeCount !== undefined && typeof likeCount !== "number")
    ) {
      throw new Error("COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = CommentDetail;
