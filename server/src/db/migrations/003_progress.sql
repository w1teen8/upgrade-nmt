CREATE TABLE material_progress (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    done_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, material_id)
);
CREATE INDEX idx_material_progress_user ON material_progress(user_id);

CREATE TABLE topic_progress (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id     INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, topic_id)
);
CREATE INDEX idx_topic_progress_user ON topic_progress(user_id);
