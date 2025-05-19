class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, owner) {
    // Verify thread exists
    await this._threadRepository.verifyThreadExists(threadId);

    // Verify comment exists
    await this._commentRepository.verifyCommentExists(commentId);

    // Verify comment owner
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // Soft delete the comment (set is_deleted flag)
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
