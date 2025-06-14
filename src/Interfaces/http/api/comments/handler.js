const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const LikeUnlikeCommentUseCase = require("../../../../Applications/use_case/LikeUnlikeCommentUseCase");

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const { id: ownerId } = request.auth.credentials;
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );
    const addedComment = await addCommentUseCase.execute(
      request.payload,
      threadId,
      ownerId
    );

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );

    await deleteCommentUseCase.execute(threadId, commentId, ownerId);

    return {
      status: "success",
    };
  }

  async putCommentLikeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;

    const likeUnlikeCommentUseCase = this._container.getInstance(
      LikeUnlikeCommentUseCase.name
    );

    await likeUnlikeCommentUseCase.execute({ threadId, commentId, userId });

    return {
      status: "success",
    };
  }
}

module.exports = CommentsHandler;
