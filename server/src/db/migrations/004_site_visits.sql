CREATE TABLE site_visits (
    id         SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_site_visits_visited_at ON site_visits(visited_at);
CREATE INDEX idx_site_visits_session ON site_visits(session_id);
