const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentsTableTestHelper = {
  async addComment({
    id = "comment-123",
    content = "ini adalah comment",
    owner = "user-123",
    threadId = "thread-123",
    date = new Date().toISOString(),
    isDeleted = false,
  }) {
    const query = {
      text: "INSERT INTO comments(id, content, owner, thread_id, date, is_deleted) VALUES($1, $2, $3, $4, $5, $6)",
      values: [id, content, owner, threadId, date, isDeleted],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM comments WHERE 1=1");
  },
};

module.exports = CommentsTableTestHelper;
