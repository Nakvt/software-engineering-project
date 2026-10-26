-- Kích hoạt extension hỗ trợ sinh UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng danh mục (Phân loại POI)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng tour lộ trình
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT DEFAULT 0,
    distance_km DECIMAL(5, 2) DEFAULT 0.0,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng phiên người dùng (Đã tích hợp theo dõi Real-time Active Users)
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type VARCHAR(50),
    is_online BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng POI (Điểm tham quan)
CREATE TABLE pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng liên kết Tour - POI (Thứ tự các điểm trong tour)
CREATE TABLE tour_pois (
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    PRIMARY KEY (tour_id, poi_id)
);

-- 6. Bảng nội dung đa ngôn ngữ & giọng đọc thuyết minh
CREATE TABLE poi_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    accent VARCHAR(20) DEFAULT 'neutral',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tts_script TEXT,
    audio_url VARCHAR(500),
    audio_duration_seconds INT DEFAULT 0,
    CONSTRAINT uq_poi_lang_accent UNIQUE (poi_id, language_code, accent)
);

-- 7. Bảng ghi log tọa độ Heatmap
CREATE TABLE tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng lịch sử nghe thuyết minh
CREATE TABLE play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    language_code VARCHAR(10),
    accent VARCHAR(20),
    trigger_type VARCHAR(20) CHECK (trigger_type IN ('geofence', 'qr_code', 'manual')),
    duration_listened_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    played_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng tài khoản quản trị viên Web CMS
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bảng lưu Refresh Token CMS
CREATE TABLE admin_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- CHỈ MỤC (INDEXES) TỐI ƯU TRUY VẤN
-- ========================================================

-- Tối ưu truy vấn người dùng Real-time
CREATE INDEX idx_user_sessions_active ON user_sessions(last_active_at) WHERE is_online = TRUE;

-- Tối ưu tìm kiếm tọa độ POI
CREATE INDEX idx_pois_location ON pois (latitude, longitude);

-- Tối ưu Khóa ngoại (Foreign Keys & Joins)
CREATE INDEX idx_pois_category ON pois (category_id);
CREATE INDEX idx_tour_pois_poi ON tour_pois (poi_id);
CREATE INDEX idx_poi_contents_poi ON poi_contents (poi_id);
CREATE INDEX idx_tracking_logs_session ON tracking_logs (session_id);
CREATE INDEX idx_play_history_session ON play_history (session_id);
CREATE INDEX idx_play_history_poi ON play_history (poi_id);
CREATE INDEX idx_refresh_token_admin ON admin_refresh_tokens (admin_id);