-- Kích hoạt extension hỗ trợ UUID nếu dùng PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng danh mục (Độc lập)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng tour lộ trình (Độc lập)
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT DEFAULT 0,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng phiên người dùng ẩn danh (Độc lập)
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY,
    device_type VARCHAR(50),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng POI (Phụ thuộc vào categories)
CREATE TABLE pois (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_default VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius INT DEFAULT 15,
    priority INT DEFAULT 1,
    cooldown_seconds INT DEFAULT 300,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    map_external_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng liên kết Tour - POI (Phụ thuộc vào tours và pois)
CREATE TABLE tour_pois (
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    PRIMARY KEY (tour_id, poi_id)
);

-- 6. Bảng nội dung đa ngôn ngữ & giọng (Phụ thuộc vào pois)
CREATE TABLE poi_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    accent VARCHAR(20) DEFAULT 'neutral',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tts_script TEXT,
    audio_url VARCHAR(500),
    audio_duration_seconds INT DEFAULT 0,
    UNIQUE (poi_id, language_code, accent)
);

-- 7. Bảng ghi log tọa độ Heatmap (Phụ thuộc vào user_sessions)
CREATE TABLE tracking_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng lịch sử nghe thuyết minh (Phụ thuộc user_sessions và pois)
CREATE TABLE play_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    language_code VARCHAR(10),
    accent VARCHAR(20),
    trigger_type VARCHAR(20) CHECK (trigger_type IN ('geofence', 'qr_code', 'manual')),
    duration_listened_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chỉ mục tối ưu truy vấn tọa độ
CREATE INDEX idx_pois_location ON pois (latitude, longitude);
