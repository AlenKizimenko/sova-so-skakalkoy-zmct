-- event-platform: схема базы данных
-- PostgreSQL 16

-- === Эксперты ===
CREATE TABLE experts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    vk_group_id VARCHAR(100),
    vk_access_token TEXT,
    smtp_host VARCHAR(255),
    smtp_user VARCHAR(255),
    smtp_password TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- === Мероприятия ===
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    raw_text TEXT,
    date TIMESTAMP,
    duration_minutes INT,
    location_raw VARCHAR(500),
    location_resolved VARCHAR(500),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    price_amount DECIMAL(10, 2),
    price_currency VARCHAR(3) DEFAULT 'RUB',
    price_for_members DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_expert_id ON events(expert_id);
CREATE INDEX idx_events_status ON events(status);

-- === Страницы мероприятий ===
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    composer_version VARCHAR(20),
    composed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pages_event_id ON pages(event_id);

-- === Публикации ===
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    external_url VARCHAR(500),
    sent_count INT DEFAULT 0,
    error_message TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publications_event_id ON publications(event_id);
CREATE INDEX idx_publications_channel ON publications(channel);

-- === Подписчики / регистрации ===
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, email)
);

CREATE INDEX idx_subscribers_event_id ON subscribers(event_id);