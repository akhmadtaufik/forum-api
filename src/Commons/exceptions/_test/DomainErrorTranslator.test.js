const DomainErrorTranslator = require("../DomainErrorTranslator");
const InvariantError = require("../InvariantError");
const NotFoundError = require("../NotFoundError");

describe("DomainErrorTranslator", () => {
  it("should translate error correctly", () => {
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena tipe data tidak sesuai"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.USERNAME_LIMIT_CHAR")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena karakter username melebihi batas limit"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat user baru karena username mengandung karakter terlarang"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(new InvariantError("harus mengirimkan title dan body"));
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(new InvariantError("title dan body harus string"));
    expect(
      DomainErrorTranslator.translate(new Error("NEW_THREAD.TITLE_LIMIT_CHAR"))
    ).toStrictEqual(new InvariantError("panjang title melebihi batas limit"));
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(new InvariantError("harus mengirimkan content"));
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(new InvariantError("content harus berupa string"));

    // ThreadDetail translations
    expect(
      DomainErrorTranslator.translate(
        new Error("THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat thread detail karena properti yang dibutuhkan tidak ada"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat thread detail karena tipe data tidak sesuai"
      )
    );

    // CommentDetail translations
    expect(
      DomainErrorTranslator.translate(
        new Error("COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat comment detail karena properti yang dibutuhkan tidak ada"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat comment detail karena tipe data tidak sesuai"
      )
    );

    // Reply translations
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(new InvariantError("harus mengirimkan content"));
    expect(
      DomainErrorTranslator.translate(
        new Error("NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(new InvariantError("content harus berupa string"));
    expect(
      DomainErrorTranslator.translate(new Error("NEW_REPLY.EMPTY_CONTENT"))
    ).toStrictEqual(new InvariantError("content balasan tidak boleh kosong"));
    expect(
      DomainErrorTranslator.translate(
        new Error("ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat balasan baru karena tipe data tidak sesuai"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat reply detail karena properti yang dibutuhkan tidak ada"
      )
    );
    expect(
      DomainErrorTranslator.translate(
        new Error("REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION")
      )
    ).toStrictEqual(
      new InvariantError(
        "tidak dapat membuat reply detail karena tipe data tidak sesuai"
      )
    );
    expect(
      DomainErrorTranslator.translate(new Error("REPLY.NOT_FOUND"))
    ).toStrictEqual(new NotFoundError("balasan tidak ditemukan"));
    expect(
      DomainErrorTranslator.translate(
        new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED")
      )
    ).toStrictEqual(
      new InvariantError("metode repository belum diimplementasikan")
    );

    // NotFoundError translations
    expect(
      DomainErrorTranslator.translate(new Error("THREAD.NOT_FOUND"))
    ).toStrictEqual(new NotFoundError("thread tidak ditemukan"));
    expect(
      DomainErrorTranslator.translate(new Error("COMMENT.NOT_FOUND"))
    ).toStrictEqual(new NotFoundError("komentar tidak ditemukan"));
  });

  it("should return original error when error message is not needed to translate", () => {
    // Arrange
    const error = new Error("some_error_message");

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});
