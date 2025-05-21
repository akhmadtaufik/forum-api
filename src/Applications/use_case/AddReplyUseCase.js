const NewReply = require("../../Domains/replies/entities/NewReply");

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner, threadId, commentId) {
    const newReply = new NewReply(useCasePayload);

    // Verify thread and comment exists before adding reply
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExistsInThread(
      commentId,
      threadId
    );

    return this._replyRepository.addReply(newReply, commentId, owner);
  }
}

module.exports = AddReplyUseCase;
