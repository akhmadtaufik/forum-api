const RegisterUser = require("../../../Domains/users/entities/RegisterUser");
const RegisteredUser = require("../../../Domains/users/entities/RegisteredUser");
const UserRepository = require("../../../Domains/users/UserRepository");
const PasswordHash = require("../../security/PasswordHash");
const AddUserUseCase = require("../AddUserUseCase");

describe("AddUserUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the add user action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    };

    // AddUserUseCase directly returns the result of userRepository.addUser.
    const expectedRegisteredUser = new RegisteredUser({
      id: "user-xyz789",
      username: useCasePayload.username,
      fullname: useCasePayload.fullname,
    });

    const mockRepositoryResponse = new RegisteredUser({
      id: "user-xyz789",
      username: useCasePayload.username,
      fullname: useCasePayload.fullname,
    });

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.verifyAvailableUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockPasswordHash.hash = jest
      .fn()
      .mockImplementation(() => Promise.resolve("encrypted_password"));
    mockUserRepository.addUser = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockRepositoryResponse));

    /** creating use case instance */
    const addUserUseCase = new AddUserUseCase({
      // Renamed variable for clarity
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
    });

    // Action
    const registeredUser = await addUserUseCase.execute(useCasePayload);

    // Assert
    expect(registeredUser).toStrictEqual(expectedRegisteredUser); // Assert against expected use case output

    expect(mockUserRepository.verifyAvailableUsername).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.verifyAvailableUsername).toHaveBeenCalledWith(
      useCasePayload.username
    );

    expect(mockPasswordHash.hash).toHaveBeenCalledTimes(1);
    expect(mockPasswordHash.hash).toHaveBeenCalledWith(useCasePayload.password);

    expect(mockUserRepository.addUser).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.addUser).toHaveBeenCalledWith(
      new RegisterUser({
        username: useCasePayload.username,
        password: "encrypted_password",
        fullname: useCasePayload.fullname,
      })
    );
  });
});
