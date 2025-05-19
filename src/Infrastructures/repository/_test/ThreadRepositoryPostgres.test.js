const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres integration test", () => {
  const testUserId = "user-repo-test-001";

  beforeAll(async () => {
    // Clean tables first due to foreign key constraints if any
    await UsersTableTestHelper.cleanTable();
    await UsersTableTestHelper.addUser({
      id: testUserId,
      username: "testuserrepo001",
      password: "testpassword",
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addThread method", () => {
    it("should persist NewThread and return AddedThread correctly", async () => {
      // Arrange
      const newThreadPayload = new NewThread({
        title: "Integration Test Thread Title",
        body: "Integration test thread body content.",
      });

      const fakeIdGenerator = () => "test-id-123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        newThreadPayload,
        testUserId
      );

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById(
        "thread-test-id-123"
      );
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual("thread-test-id-123");
      expect(threads[0].title).toEqual(newThreadPayload.title);
      expect(threads[0].body).toEqual(newThreadPayload.body);
      expect(threads[0].owner).toEqual(testUserId);
      expect(threads[0].date).toBeDefined();

      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toEqual("thread-test-id-123");
      expect(addedThread.title).toEqual(newThreadPayload.title);
      expect(addedThread.owner).toEqual(testUserId);
    });

    it("should throw NotFoundError when adding thread with non-existent owner", async () => {
      // Arrange
      const newThreadPayload = new NewThread({
        title: "Test Title Fail Owner",
        body: "Test body fail owner.",
      });
      const nonExistentOwnerId = "user-nonexistent-id";
      const fakeIdGenerator = () => "test-id-456";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        threadRepositoryPostgres.addThread(newThreadPayload, nonExistentOwnerId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("verifyThreadExists method", () => {
    it("should not throw NotFoundError if thread exists", async () => {
      // Arrange
      const existingThreadId = "thread-exists-001";
      await ThreadsTableTestHelper.addThread({
        id: existingThreadId,
        owner: testUserId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {}); // idGenerator not needed here

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists(existingThreadId)
      ).resolves.not.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if thread does not exist", async () => {
      // Arrange
      const nonExistingThreadId = "thread-not-exists-001";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists(nonExistingThreadId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getThreadById method", () => {
    it("should return thread details correctly if thread exists", async () => {
      // Arrange
      const targetThreadId = "thread-detail-001";
      const threadDate = new Date(); // Use a fixed date for consistent testing
      const threadData = {
        id: targetThreadId,
        title: "Detail Test Title String",
        body: "Detail test body content.",
        owner: testUserId,
        date: threadDate.toISOString(),
      };
      await ThreadsTableTestHelper.addThread(threadData);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const result = await threadRepositoryPostgres.getThreadById(
        targetThreadId
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toEqual(threadData.id);
      expect(result.title).toEqual(threadData.title);
      expect(result.body).toEqual(threadData.body);
      expect(result.username).toBeDefined();
      expect(result.date).toBeDefined();
      expect(() => new Date(result.date)).not.toThrow();
    });

    it("should throw NotFoundError if thread does not exist when getting details", async () => {
      // Arrange
      const nonExistingThreadId = "thread-detail-not-exists-001";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.getThreadById(nonExistingThreadId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
