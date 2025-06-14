const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");
const CommentDetail = require("../../Domains/comments/entities/CommentDetail");
const ReplyDetail = require("../../Domains/replies/entities/ReplyDetail");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExists(threadId);

    // Get thread and comments data from repositories
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    let commentsWithReplies = [];

    if (comments.length > 0) {
      const commentIds = comments.map((comment) => comment.id);
      const rawReplies = await this._replyRepository.getRepliesByCommentIds(
        commentIds
      );

      // Fetch like counts for all comments in parallel
      const likeCountsPromises = comments.map((comment) =>
        this._commentRepository.getCommentLikesCountByCommentId(comment.id)
      );
      const likeCounts = await Promise.all(likeCountsPromises);

      commentsWithReplies = comments.map((comment, index) => {
        // Fix: rawComments -> comments
        const commentRepliesData = rawReplies
          .filter((reply) => reply.comment_id === comment.id)
          .map(
            (reply) =>
              new ReplyDetail({
                // Map to ReplyDetail entity
                id: reply.id,
                content: reply.content,
                date: reply.date,
                username: reply.username,
                isDeleted: reply.is_deleted,
              })
          );

        return new CommentDetail({
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          isDeleted: comment.is_deleted,
          replies: commentRepliesData,
          likeCount: likeCounts[index],
        });
      });
    }
    return new ThreadDetail({
      ...thread,
      comments: commentsWithReplies,
    });
  }
}

module.exports = GetThreadDetailUseCase;
