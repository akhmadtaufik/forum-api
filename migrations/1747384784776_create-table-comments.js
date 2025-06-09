exports.up = (pgm) => {
  pgm.createTable("comments", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users",
      onDelete: "CASCADE", // If the user is deleted, their comments are also deleted
    },
    thread_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "threads",
      onDelete: "CASCADE", // If the thread is deleted, its comments are also deleted
    },
    date: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    is_deleted: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
  });

  // Add indexes on the owner and thread_id columns for performance
  pgm.addIndex("comments", "owner");
  pgm.addIndex("comments", "thread_id");
};

exports.down = (pgm) => {
  pgm.dropTable("comments");
};
