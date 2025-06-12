exports.up = (pgm) => {
  pgm.createTable("comment_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    comment_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "comments(id)",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // Add a unique constraint to ensure a user can only like a comment once
  pgm.addConstraint("comment_likes", "unique_comment_id_user_id", {
    unique: ["comment_id", "user_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("comment_likes");
};
