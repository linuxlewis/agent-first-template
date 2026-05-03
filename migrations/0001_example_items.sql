CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS items (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name varchar(255) NOT NULL,
	description text,
	status varchar(32) NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS items_status_idx ON items (status);
