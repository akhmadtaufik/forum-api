const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");
const CommentDetail = require("../../Domains/comments/entities/CommentDetail");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    // Get thread and comments data from repositories
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    const commentsList = Array.isArray(comments) ? comments : [];

    // Create CommentDetail instances for each comment
    const commentDetails = commentsList.map((comment) => {
      console.log("Comment from repository:", comment);
      return new CommentDetail({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content,
        isDeleted: comment.is_deleted,
      });
    });

    // Create and return ThreadDetail with all required properties
    const threadDetail = new ThreadDetail({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: commentDetails,
    });

    return threadDetail;
  }
}

module.exports = GetThreadDetailUseCase;
