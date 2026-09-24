# REST API Specifications (Data Contract)

## 1. Chuẩn Envelope Response
Tất cả các API đều trả về kết quả theo cấu trúc chuẩn:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2026-09-15T06:29:23Z"
}
```

---

## 2. Nhóm API cho Mobile / Web Client

### 2.1. Lấy danh sách POI trên bản đồ
* **Endpoint:** `GET /api/v1/pois`
* **Query Params:**
  * `lat` (optional): Tọa độ vĩ độ hiện tại
  * `lng` (optional): Tọa độ kinh độ hiện tại
  * `lang`: Mã ngôn ngữ (mặc định: `vi`)
  * `accent`: Vùng miền giọng đọc (mặc định: `north`)
* **Response:**
```json
[
  {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "code": "POI_CHANHDIEN_01",
    "name": "Chánh Điện",
    "location": { "lat": 16.099123, "lng": 108.277456 },
    "radius": 20,
    "priority": 10,
    "cooldownSeconds": 300,
    "imageUrl": "[https://cdn.example.com/chanhdien.jpg](https://cdn.example.com/chanhdien.jpg)",
    "audio": {
      "audioUrl": "[https://cdn.example.com/audio/cd_vi_central.mp3](https://cdn.example.com/audio/cd_vi_central.mp3)",
      "ttsScript": "Chào mừng bạn đến với Chánh Điện...",
      "duration": 95
    }
  }
]
```

### 2.2. Quét QR Code để lấy chi tiết thuyết minh
* **Endpoint:** `GET /api/v1/pois/by-code/:code`
* **Query Params:** `lang`, `accent`
* **Response:** Trả về đối tượng POI đầy đủ kèm audio và script tương ứng để phát ngay lập tức.

### 2.3. Gửi tọa độ thời gian thực & Ping Geofence
* **Endpoint:** `POST /api/v1/tracking/ping`
* **Request Body:**
```json
{
  "sessionId": "a73985d2-f67a-42c2-8419-58b9f36fba7c",
  "latitude": 16.099120,
  "longitude": 108.277450,
  "lang": "vi",
  "accent": "central"
}
```
* **Response:**
```json
{
  "shouldTrigger": true,
  "poi": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Chánh Điện",
    "priority": 10,
    "audioUrl": "[https://cdn.example.com/audio/cd_vi_central.mp3](https://cdn.example.com/audio/cd_vi_central.mp3)"
  }
}
```

### 2.4. Ghi nhận nhật ký nghe (Analytics Log)
* **Endpoint:** `POST /api/v1/analytics/listen-event`
* **Request Body:**
```json
{
  "sessionId": "a73985d2-f67a-42c2-8419-58b9f36fba7c",
  "poiId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "triggerType": "geofence",
  "durationListenedSeconds": 45,
  "completed": false
}
```

---

## 3. Nhóm API cho Web CMS Quản trị & Thống kê

### 3.1. Quản lý POI (CRUD)
* `POST /api/v1/admin/pois`: Tạo mới POI kèm tọa độ, bán kính và nội dung.
* `PUT /api/v1/admin/pois/:id`: Cập nhật thông tin tọa độ, bán kính POI.
* `POST /api/v1/admin/pois/:id/contents`: Tải lên file ghi âm hoặc cập nhật script TTS theo ngôn ngữ.

### 3.2. API Heatmap & Thống kê Analytics
* `GET /api/v1/admin/analytics/heatmap`: Trả về mảng tọa độ kèm trọng số `[ [lat, lng, count], ... ]` để vẽ heatmap.
* `GET /api/v1/admin/analytics/dashboard`: Thống kê Top POI nghe nhiều nhất, thời lượng nghe trung bình.
