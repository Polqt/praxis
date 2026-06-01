-- Deduplicate usernames before adding the unique constraint.
-- Keep the earliest-created row for each username; null out the rest.
-- This prevents the migration from failing on databases with duplicate usernames.
UPDATE users u1
SET username = NULL
WHERE username IS NOT NULL
  AND id NOT IN (
    SELECT DISTINCT ON (username) id
    FROM users
    WHERE username IS NOT NULL
    ORDER BY username, created_at ASC
  );

-- Add the unique constraint on username (NULL values are always distinct and not affected).
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username)
  WHERE username IS NOT NULL;
