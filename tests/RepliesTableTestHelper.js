/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply({
    id = "reply-123",
    content = "reply content",
    owner = "user-123",
    commentId = "comment-123",
    date = new Date().toISOString(),
    isDeleted = false,
  }) {
    const query = {
      text: "INSERT INTO replies(id, content, owner, comment_id, date, is_deleted) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, content, owner, commentId, date, isDeleted],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },

  async findReplyById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getReplyById(id) {
    const replies = await this.findReplyById(id);

    return replies[0];
  },

  async deleteReplyById(id) {
    const query = {
      text: "UPDATE replies SET is_deleted = TRUE WHERE id = $1",
      values: [id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM replies WHERE 1=1");
  },
};

module.exports = RepliesTableTestHelper;
