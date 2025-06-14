const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newCommentEntity, threadId, owner) {
    const { content } = newCommentEntity; // Access content from the entity instance
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDeleted = false;

    const query = {
      text: "INSERT INTO comments(id, content, owner, thread_id, date, is_deleted) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, owner, threadId, date, isDeleted],
    };
    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1 AND is_deleted = FALSE",
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Comment not found");
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1 AND owner = $2 AND is_deleted = FALSE",
      values: [commentId, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("You are not allowed to see this comment");
    }
  }

  async verifyCommentExistsInThread(commentId, threadId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1 AND thread_id = $2 AND is_deleted = FALSE",
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Komentar pada thread ini tidak ditemukan");
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_deleted = TRUE WHERE id = $1 RETURNING id",
      values: [commentId],
    };
    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT c.id, u.username, c.date, c.content, c.is_deleted
        FROM comments c
        JOIN users u ON c.owner = u.id
        WHERE c.thread_id = $1
        ORDER BY c.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      ...row,
      date: new Date(row.date).toISOString(),
    }));
  }

  async addCommentLike(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO comment_likes (id, comment_id, user_id) VALUES ($1, $2, $3) RETURNING id",
      values: [id, commentId, userId],
    };
    await this._pool.query(query);
  }

  async deleteCommentLike(commentId, userId) {
    const query = {
      text: "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      values: [commentId, userId],
    };
    await this._pool.query(query);
  }

  async verifyCommentLikeExists(commentId, userId) {
    const query = {
      text: "SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getCommentLikesCountByCommentId(commentId) {
    const query = {
      text: "SELECT COUNT(id) AS like_count FROM comment_likes WHERE comment_id = $1",
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return parseInt(result.rows[0].like_count, 10);
  }
}

module.exports = CommentRepositoryPostgres;
