const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const AuthenticationTokenManager = require("../../security/AuthenticationTokenManager");
const RefreshAuthenticationUseCase = require("../RefreshAuthenticationUseCase");

describe("RefreshAuthenticationUseCase", () => {
  it("should throw error if use case payload not contain refresh token", async () => {
    // Arrange
    const useCasePayload = {};
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action & Assert
    await expect(
      refreshAuthenticationUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN"
    );
  });

  it("should throw error if refresh token not string", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 1,
    };
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action & Assert
    await expect(
      refreshAuthenticationUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should orchestrating the refresh authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: "some_refresh_token",
    };
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    const mockDecodedPayload = { username: "dicoding_user", id: "user-xyz" };
    const mockGeneratedAccessToken = "neutral.new.access.token.789";

    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockResolvedValue(undefined);
    mockAuthenticationTokenManager.verifyRefreshToken = jest
      .fn()
      .mockResolvedValue(undefined);
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockResolvedValue(mockDecodedPayload);
    mockAuthenticationTokenManager.createAccessToken = jest
      .fn()
      .mockResolvedValue(mockGeneratedAccessToken);
    // Create the use case instace
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const accessToken = await refreshAuthenticationUseCase.execute(
      useCasePayload
    );

    // Assert
    expect(
      mockAuthenticationTokenManager.verifyRefreshToken
    ).toHaveBeenCalledTimes(1);
    expect(
      mockAuthenticationTokenManager.verifyRefreshToken
    ).toHaveBeenCalledWith(useCasePayload.refreshToken);

    expect(
      mockAuthenticationRepository.checkAvailabilityToken
    ).toHaveBeenCalledTimes(1);
    expect(
      mockAuthenticationRepository.checkAvailabilityToken
    ).toHaveBeenCalledWith(useCasePayload.refreshToken);

    expect(mockAuthenticationTokenManager.decodePayload).toHaveBeenCalledTimes(
      1
    );
    expect(mockAuthenticationTokenManager.decodePayload).toHaveBeenCalledWith(
      useCasePayload.refreshToken
    );

    expect(
      mockAuthenticationTokenManager.createAccessToken
    ).toHaveBeenCalledTimes(1);
    expect(
      mockAuthenticationTokenManager.createAccessToken
    ).toHaveBeenCalledWith(mockDecodedPayload); // Called with the decoded payload from the mock

    expect(accessToken).toEqual(mockGeneratedAccessToken);
  });
});
