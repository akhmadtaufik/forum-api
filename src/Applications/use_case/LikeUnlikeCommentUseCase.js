class LikeUnlikeCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    // Verify thread exists
    await this._threadRepository.verifyThreadExists(threadId);

    // Verify comment exists in thread
    await this._commentRepository.verifyCommentExistsInThread(
      commentId,
      threadId
    );

    const isLiked = await this._commentRepository.verifyCommentLikeExists(
      commentId,
      userId
    );

    if (isLiked) {
      await this._commentRepository.deleteCommentLike(commentId, userId);
    } else {
      await this._commentRepository.addCommentLike(commentId, userId);
    }
  }
}

module.exports = LikeUnlikeCommentUseCase;
