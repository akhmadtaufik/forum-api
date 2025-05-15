const NewThread = require("../../Domains/threads/entities/NewThread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayLoad, ownerId) {
    const newThread = new NewThread(useCasePayLoad);
    return this._threadRepository.addThread(newThread, ownerId);
  }
}

module.exports = AddThreadUseCase;
