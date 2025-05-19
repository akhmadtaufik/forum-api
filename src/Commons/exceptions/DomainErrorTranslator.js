const InvariantError = require("./InvariantError");
const NotFoundError = require("./NotFoundError");

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  "REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada"
  ),
  "REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat user baru karena tipe data tidak sesuai"
  ),
  "REGISTER_USER.USERNAME_LIMIT_CHAR": new InvariantError(
    "tidak dapat membuat user baru karena karakter username melebihi batas limit"
  ),
  "REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER": new InvariantError(
    "tidak dapat membuat user baru karena username mengandung karakter terlarang"
  ),
  "USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "harus mengirimkan username dan password"
  ),
  "USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "username dan password harus string"
  ),
  "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),
  "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),
  "DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),
  "DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),

  // Thread translations
  "NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "harus mengirimkan title dan body"
  ),
  "NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "title dan body harus string"
  ),
  "NEW_THREAD.TITLE_LIMIT_CHAR": new InvariantError(
    "panjang title melebihi batas limit"
  ),
  "THREAD.NOT_FOUND": new NotFoundError("thread tidak ditemukan"),

  "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat thread detail karena properti yang dibutuhkan tidak ada"
  ),
  "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat thread detail karena tipe data tidak sesuai"
  ),

  // Comment translations
  "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "harus mengirimkan content"
  ),
  "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "content harus berupa string"
  ),
  "COMMENT.NOT_FOUND": new NotFoundError("komentar tidak ditemukan"),
  "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat comment detail karena properti yang dibutuhkan tidak ada"
  ),
  "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat comment detail karena tipe data tidak sesuai"
  ),
};

module.exports = DomainErrorTranslator;
