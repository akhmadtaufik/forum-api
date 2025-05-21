const ReplyRepository = require("../ReplyRepository");

describe("ReplyRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action and Assert
    await expect(replyRepository.addReply({}, "", "")).rejects.toThrowError(
      "METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      replyRepository.verifyReplyExists("", "", "")
    ).rejects.toThrowError("METHOD_NOT_IMPLEMENTED");
    await expect(
      replyRepository.verifyReplyAccess("", "")
    ).rejects.toThrowError("METHOD_NOT_IMPLEMENTED");
    await expect(replyRepository.deleteReplyById("")).rejects.toThrowError(
      "METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      replyRepository.getRepliesByCommentIds([])
    ).rejects.toThrowError("METHOD_NOT_IMPLEMENTED");
  });
});

module.exports = ReplyRepository;
