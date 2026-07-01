CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE material_type AS ENUM ('conspect', 'shpargalka', 'test', 'video', 'other');
CREATE TYPE purchase_status AS ENUM ('pending', 'paid', 'failed', 'cancelled');

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'student',
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_verification_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_evt_token ON email_verification_tokens(token);

CREATE TABLE courses (
    id           SERIAL PRIMARY KEY,
    slug         VARCHAR(100) NOT NULL UNIQUE,
    title        VARCHAR(255) NOT NULL,
    subject      VARCHAR(50) NOT NULL,
    course_type  VARCHAR(20) NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    price_uah    NUMERIC(10,2) NOT NULL,
    icon         VARCHAR(50),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE topics (
    id          SERIAL PRIMARY KEY,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_topics_course ON topics(course_id);

CREATE TABLE materials (
    id          SERIAL PRIMARY KEY,
    topic_id    INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    type        material_type NOT NULL,
    title       VARCHAR(255) NOT NULL,
    url         TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_materials_topic ON materials(topic_id);

CREATE TABLE purchases (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id         INTEGER NOT NULL REFERENCES courses(id),
    order_id          VARCHAR(100) NOT NULL UNIQUE,
    amount_uah        NUMERIC(10,2) NOT NULL,
    status            purchase_status NOT NULL DEFAULT 'pending',
    liqpay_payment_id VARCHAR(100),
    raw_callback      JSONB,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at           TIMESTAMPTZ
);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE UNIQUE INDEX idx_purchases_user_course_paid
    ON purchases(user_id, course_id) WHERE status = 'paid';
