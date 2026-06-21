-- ============================================================================
-- LORAC2 / STUDYSYNC — SCHEMA POSTGRESQL PARA NEON
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        TEXT NOT NULL UNIQUE,
    email           TEXT UNIQUE,
    password_hash   TEXT,
    role            TEXT NOT NULL DEFAULT 'aluno',
    avatar          TEXT NOT NULL DEFAULT '🦊',
    area            TEXT NOT NULL DEFAULT '',
    bio             TEXT NOT NULL DEFAULT '',
    goal_minutes    INTEGER NOT NULL DEFAULT 60,
    subject_goals   JSONB NOT NULL DEFAULT '{}'::jsonb,
    flashcards      JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email)) WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    password_hash   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    username        TEXT NOT NULL,
    content         TEXT NOT NULL,
    subtype         TEXT NOT NULL DEFAULT 'text',
    reactions       JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages (room_id, timestamp);

CREATE TABLE IF NOT EXISTS private_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_name       TEXT NOT NULL,
    content         TEXT NOT NULL,
    subtype         TEXT NOT NULL DEFAULT 'text',
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pm_from_to ON private_messages (from_id, to_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_pm_to_from ON private_messages (to_id, from_id, timestamp);

CREATE TABLE IF NOT EXISTS calendar_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    date            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events (user_id, date);

CREATE TABLE IF NOT EXISTS study_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id             UUID REFERENCES rooms(id) ON DELETE SET NULL,
    start_time          TIMESTAMPTZ NOT NULL,
    end_time            TIMESTAMPTZ NOT NULL,
    duration_seconds    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions (user_id, start_time);

CREATE TABLE IF NOT EXISTS turmas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    icon                TEXT NOT NULL DEFAULT '🏫',
    code                TEXT NOT NULL UNIQUE,
    professor_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    professor_name      TEXT NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_turmas_professor ON turmas (professor_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_turmas_code ON turmas (code);

CREATE TABLE IF NOT EXISTS turma_students (
    turma_id        UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username        TEXT NOT NULL,
    email           TEXT NOT NULL DEFAULT '',
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (turma_id, user_id)
);

CREATE TABLE IF NOT EXISTS turma_materias (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id        UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    icon            TEXT NOT NULL DEFAULT '📖'
);

CREATE INDEX IF NOT EXISTS idx_materias_turma ON turma_materias (turma_id);

CREATE TABLE IF NOT EXISTS turma_videos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id        UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    data            JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_turma ON turma_videos (turma_id);

CREATE TABLE IF NOT EXISTS turma_avisos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id        UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    data            JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avisos_turma ON turma_avisos (turma_id);

CREATE TABLE IF NOT EXISTS turma_exercicios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id        UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    data            JSONB NOT NULL DEFAULT '{}'::jsonb,
    respostas       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercicios_turma ON turma_exercicios (turma_id);

CREATE TABLE IF NOT EXISTS global_exercises (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data            JSONB NOT NULL DEFAULT '{}'::jsonb,
    shared_by       TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO rooms (name) VALUES
    ('📚 Matemática - Enem'),
    ('💻 Programação Web'),
    ('🧪 Química Orgânica'),
    ('🎨 Design UI/UX'),
    ('📖 Português - Redação'),
    ('🔬 Física - Mecânica')
ON CONFLICT DO NOTHING;
