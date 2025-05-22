const UserRepository = require("../../../Domains/users/UserRepository");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const AuthenticationTokenManager = require("../../security/AuthenticationTokenManager");
const PasswordHash = require("../../security/PasswordHash");
const LoginUserUseCase = require("../LoginUserUseCase");
const NewAuth = require("../../../Domains/authentications/entities/NewAuth");

describe("LoginUserUseCase", () => {
  it("should orchestrating the login action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: "dicoding",
      password: "secret",
    };

    // Define neutral mock return values for tokens
    const mockAccessToken = "neutral.access.token.xyz";
    const mockRefreshToken = "neutral.refresh.token.abc";
    const mockUserId = "user-test-789";
    const mockEncryptedPassword = "encrypted_password_from_repo";

    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    // Mocking
    mockUserRepository.getPasswordByUsername = jest
      .fn()
      .mockResolvedValue(mockEncryptedPassword);
    mockPasswordHash.comparePassword = jest.fn().mockResolvedValue(undefined); // Resolves if password matches
    mockAuthenticationTokenManager.createAccessToken = jest
      .fn()
      .mockResolvedValue(mockAccessToken);
    mockAuthenticationTokenManager.createRefreshToken = jest
      .fn()
      .mockResolvedValue(mockRefreshToken);
    mockUserRepository.getIdByUsername = jest
      .fn()
      .mockResolvedValue(mockUserId);
    mockAuthenticationRepository.addToken = jest
      .fn()
      .mockResolvedValue(undefined); // Resolves if token is added

    // create use case instance
    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualNewAuth = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(actualNewAuth).toEqual(
      new NewAuth({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      })
    );

    expect(mockUserRepository.getPasswordByUsername).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getPasswordByUsername).toHaveBeenCalledWith(
      useCasePayload.username
    );

    expect(mockPasswordHash.comparePassword).toHaveBeenCalledTimes(1);
    expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(
      useCasePayload.password,
      mockEncryptedPassword
    );

    expect(mockUserRepository.getIdByUsername).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.getIdByUsername).toHaveBeenCalledWith(
      useCasePayload.username
    );

    expect(
      mockAuthenticationTokenManager.createAccessToken
    ).toHaveBeenCalledTimes(1);
    expect(
      mockAuthenticationTokenManager.createAccessToken
    ).toHaveBeenCalledWith({
      username: useCasePayload.username,
      id: mockUserId,
    });

    expect(
      mockAuthenticationTokenManager.createRefreshToken
    ).toHaveBeenCalledTimes(1);
    expect(
      mockAuthenticationTokenManager.createRefreshToken
    ).toHaveBeenCalledWith({
      username: useCasePayload.username,
      id: mockUserId,
    });

    expect(mockAuthenticationRepository.addToken).toHaveBeenCalledTimes(1);
    expect(mockAuthenticationRepository.addToken).toHaveBeenCalledWith(
      mockRefreshToken
    );
  });
});
