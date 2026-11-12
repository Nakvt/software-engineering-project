import React, { useState } from 'react';
import type { UpdatePoiPayload } from '../../data/api/poiApi';

export interface EditablePoi extends Partial<UpdatePoiPayload> {
  id: string;
  name_default?: string;
  description_default?: string;
  radius_meters?: number;
  name?: string;
  description?: string;
  radius?: number;
}

interface EditPoiModalProps {
  poi: EditablePoi | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: UpdatePoiPayload & { id: string }) => void;
}

function EditPoiModalForm({
  poi,
  onClose,
  onSave,
}: Omit<EditPoiModalProps, 'isOpen'> & { poi: EditablePoi }) {
  // 1. Khởi tạo state dữ liệu Form với giá trị mặc định chắc chắn là String
  const [formData, setFormData] = useState({
    name_default: poi.name_default || poi.name || '',
    description_default: poi.description_default || poi.description || '',
    radius_meters: poi.radius_meters ?? poi.radius ?? 30,
    audio_url: poi.audio_url || '',
    image_url: poi.image_url || '',
  });

  // State quản lý text nhập liệu thô cho Latitude/Longitude
  const [latInput, setLatInput] = useState<string>(String(poi.latitude ?? poi.location?.lat ?? 0));
  const [lngInput, setLngInput] = useState<string>(String(poi.longitude ?? poi.location?.lng ?? 0));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 2. Chuẩn hóa tọa độ (chuyển ',' thành '.', chống NaN)
    const cleanLat = Number.parseFloat(latInput.replace(',', '.'));
    const cleanLng = Number.parseFloat(lngInput.replace(',', '.'));

    if (Number.isNaN(cleanLat) || cleanLat < -90 || cleanLat > 90) {
      alert('Vĩ độ (Latitude) không hợp lệ! Vui lòng nhập từ -90 đến 90.');
      return;
    }

    if (Number.isNaN(cleanLng) || cleanLng < -180 || cleanLng > 180) {
      alert('Kinh độ (Longitude) không hợp lệ! Vui lòng nhập từ -180 đến 180.');
      return;
    }

    const safeRadius = Number(formData.radius_meters ?? poi.radius_meters ?? poi.radius ?? 30);
    const finalName = formData.name_default.trim();
    const finalDescription = formData.description_default.trim();

    // 3. Gửi Payload chứa ĐỦ CẢ 2 CẶP KEY (cả key có _default lẫn không có _default)
    onSave({
      ...formData,
      id: poi.id,
      name_default: finalName,
      name: finalName, // 🟢 Bắt buộc có để Backend fallback nếu dùng req.body.name
      description_default: finalDescription,
      description: finalDescription, // 🟢 Bắt buộc có để Backend fallback nếu dùng req.body.description
      latitude: cleanLat,
      longitude: cleanLng,
      location: { lat: cleanLat, lng: cleanLng },
      radius: safeRadius,
      radius_meters: safeRadius,
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>Chỉnh sửa thông tin POI</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Tên địa điểm POI:</label>
            <input
              type="text"
              value={formData.name_default}
              onChange={(event) => setFormData({ ...formData, name_default: event.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Vĩ độ (Latitude):</label>
              <input
                type="text"
                value={latInput}
                onChange={(event) => setLatInput(event.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Kinh độ (Longitude):</label>
              <input
                type="text"
                value={lngInput}
                onChange={(event) => setLngInput(event.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Nội dung thuyết minh:</label>
            <textarea
              rows={4}
              value={formData.description_default}
              onChange={(event) => setFormData({ ...formData, description_default: event.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" style={{ padding: '8px 16px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const EditPoiModal: React.FC<EditPoiModalProps> = ({ poi, isOpen, onClose, onSave }) => {
  if (!isOpen || !poi) return null;

  return (
    <EditPoiModalForm
      key={poi.id}
      poi={poi}
      onClose={onClose}
      onSave={onSave}
    />
  );
};