const AddedReply = require("../../Domains/replies/entities/AddedReply");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply, commentId, owner) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies (id, content, owner, comment_id, date) VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, owner, commentId, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({
      ...result.rows[0],
    });
  }

  async verifyReplyExists(replyId, commentId, threadId) {
    const query = {
      text: `SELECT r.id 
             FROM replies r
             INNER JOIN comments c ON r.comment_id = c.id
             WHERE r.id = $1 AND r.comment_id = $2 AND c.thread_id = $3 AND r.is_deleted = FALSE`,
      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Balasan tidak ditemukan");
    }
  }

  async verifyReplyAccess(replyId, owner) {
    const query = {
      text: "SELECT owner FROM replies WHERE id = $1 AND is_deleted = FALSE",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Balasan tidak ditemukan");
    }

    if (result.rows[0].owner != owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses balasan ini");
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: "UPDATE replies SET is_deleted = TRUE WHERE id = $1 RETURNING id",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Balasan tidak ditemukan, gagal menghapus");
    }
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds || commentIds.length === 0) {
      return [];
    }

    const query = {
      text: `
        SELECT
          r.id,
          r.content,
          r.date,
          u.username,
          r.is_deleted,
          r.comment_id
        FROM replies r
        JOIN users u ON r.owner = u.id
        WHERE r.comment_id = ANY($1::text[])
        ORDER BY r.date ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
