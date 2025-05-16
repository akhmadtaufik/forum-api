const NewComment = require("../../Domains/comments/entities/NewComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    const newComment = new NewComment(useCasePayload);

    // Verify thread exists before adding comment
    await this._verifyThreadExists(threadId);

    return this._commentRepository.addComment(newComment, threadId, owner);
  }

  async _verifyThreadExists(threadId) {
    try {
      await this._threadRepository.verifyThreadExists(threadId);
    } catch (error) {
      throw new NotFoundError("Thread tidak ditemukan");
    }
  }
}

module.exports = AddCommentUseCase;
