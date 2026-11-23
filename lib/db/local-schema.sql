CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY, name text NOT NULL, email text UNIQUE NOT NULL,
  "emailVerified" boolean NOT NULL DEFAULT false, image text,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin'))
);
CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY, "expiresAt" timestamp NOT NULL, token text UNIQUE NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_id ON session("userId");
CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" text, "refreshToken" text, "idToken" text,
  "accessTokenExpiresAt" timestamp, "refreshTokenExpiresAt" timestamp, scope text, password text,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_user_id ON account("userId");
CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL, "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(), "updatedAt" timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS posts (
  id text PRIMARY KEY, title text NOT NULL, summary text NOT NULL, content text NOT NULL,
  category text NOT NULL DEFAULT 'Notícia', published boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "userId" text NOT NULL
);
CREATE TABLE IF NOT EXISTS points (id text PRIMARY KEY, data jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS campaigns (id text PRIMARY KEY, data jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS reports (
  id text PRIMARY KEY, "codeHash" text NOT NULL, "userId" text REFERENCES "user"(id) ON DELETE SET NULL,
  data jsonb NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_user_id ON reports("userId");
