exports.up = (pgm) => {
  pgm.createTable("replies", {
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
      onDelete: "CASCADE",
    },
    comment_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "comments",
      onDelete: "CASCADE",
    },
    date: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    is_deleted: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
  });

  // Add indexes on the owner and comment_id columns for performance
  pgm.addIndex("replies", "owner");
  pgm.addIndex("replies", "comment_id");
};

exports.down = (pgm) => {
  pgm.dropTable("replies");
};
