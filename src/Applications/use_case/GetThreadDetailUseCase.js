const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");
const CommentDetail = require("../../Domains/comments/entities/CommentDetail");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    const CommentDetails = comments.map(
      (comment) => new CommentDetail(comment)
    );

    return new ThreadDetail({
      ...thread,
      comments: CommentDetails,
    });
  }
}

module.exports = GetThreadDetailUseCase;
