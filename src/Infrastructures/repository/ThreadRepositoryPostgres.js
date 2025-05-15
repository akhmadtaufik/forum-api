const InvariantError = require("../../Commons/exceptions/InvariantError");
const AddedThread = require("../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread, ownerId) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads(id, title, body, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, title, body, ownerId, date],
    };

    try {
      const result = await this._pool.query(query);

      return new AddedThread({ ...result.rows[0] });
    } catch (error) {
      // Check for foreign key violation (ownerId not in users table)
      // PostgreSQL error code for foreign key violation is 23503
      if (error.code === "23503") {
        throw new InvariantError(
          "Failed to add thread. User ID not found or invalid."
        );
      }
      // Rethrow other errors or handle them as needed, possibly logging them
      // console.error('Error adding thread:', error); // Optional logging
      throw new Error(
        "Failed to add a thread due to an error on the database server."
      );
    }
  }

  async verifyThreadExists(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Threads with that ID were not found.");
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username 
             FROM threads 
             INNER JOIN users ON threads.owner = users.id 
             WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError(
        "Thread details could not be retrieved because the thread was not found."
      );
    }
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
