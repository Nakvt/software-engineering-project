import React, { useState } from 'react';
import type { TourItem } from '../../data/api/tourApi';

interface PoiOption {
  id: string;
  name: string;
  code?: string;
}

export interface FullTourUpdatePayload {
  name: string;
  description: string;
  estimatedDurationMinutes: number | null;
  distanceKm: number | null;
  thumbnailUrl: string;
  poiIds: string[];
}

interface EditTourModalProps {
  tour: (TourItem & {
    description?: string;
    estimatedDurationMinutes?: number | null;
    distanceKm?: number | null;
    thumbnailUrl?: string;
  }) | null;
  isOpen: boolean;
  poiList: PoiOption[];
  initialSelectedPoiIds: string[];
  loadingPois: boolean;
  onClose: () => void;
  onSave: (tourId: string, payload: FullTourUpdatePayload) => Promise<void>;
}

export const EditTourModal: React.FC<EditTourModalProps> = ({
  tour,
  isOpen,
  poiList,
  initialSelectedPoiIds,
  loadingPois,
  onClose,
  onSave,
}) => {
  // Khởi tạo state trực tiếp từ props (không dùng useEffect để tránh lỗi set-state-in-effect)
  const [name, setName] = useState(() => tour?.name || '');
  const [description, setDescription] = useState(() => tour?.description || '');
  const [duration, setDuration] = useState(() =>
    tour?.estimatedDurationMinutes !== null && tour?.estimatedDurationMinutes !== undefined
      ? String(tour.estimatedDurationMinutes)
      : ''
  );
  const [distance, setDistance] = useState(() =>
    tour?.distanceKm !== null && tour?.distanceKm !== undefined ? String(tour.distanceKm) : ''
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(() => tour?.thumbnailUrl || '');
  const [selectedPoiIds, setSelectedPoiIds] = useState<string[]>(() => initialSelectedPoiIds);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !tour) return null;

  const togglePoi = (poiId: string) => {
    setSelectedPoiIds((prev) =>
      prev.includes(poiId) ? prev.filter((id) => id !== poiId) : [...prev, poiId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Tên Tour không được để trống!');
      return;
    }

    try {
      setSaving(true);
      await onSave(tour.id, {
        name: name.trim(),
        description: description.trim(),
        estimatedDurationMinutes: duration.trim() !== '' ? Number(duration) : null,
        distanceKm: distance.trim() !== '' ? Number(distance) : null,
        thumbnailUrl: thumbnailUrl.trim(),
        poiIds: selectedPoiIds,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
          Chỉnh Sửa Toàn Bộ Thông Tin Tour
        </h3>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', margin: '0 0 16px 0' }}>
          ID: {tour.id}
        </p>

        {/* Tên Tour */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
            Tên Tour du lịch *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Thời lượng & Khoảng cách */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Thời lượng dự kiến (phút)
            </label>
            <input
              type="number"
              min="0"
              placeholder="VD: 45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Khoảng cách lộ trình (km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="VD: 1.5"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Link ảnh bìa */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
            Link ảnh bìa (Thumbnail URL)
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Mô tả */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
            Mô tả lộ trình Tour
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Danh sách POI theo thứ tự */}
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
          📍 Tích chọn địa điểm POI theo thứ tự lịch trình (1, 2, 3...):
        </label>

        {loadingPois ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            Đang tải danh sách POI của Tour...
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #E2E8F0',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              marginBottom: '20px',
            }}
          >
            {poiList.map((poi) => {
              const orderIdx = selectedPoiIds.indexOf(poi.id);
              const isChecked = orderIdx !== -1;
              return (
                <div
                  key={poi.id}
                  onClick={() => togglePoi(poi.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${isChecked ? '#2563EB' : '#CBD5E1'}`,
                    backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#2563EB' : '#0F172A' }}>
                    {poi.name}
                  </span>
                  {isChecked && (
                    <span
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFF',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {orderIdx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', backgroundColor: '#FFF', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '8px 18px', border: 'none', borderRadius: '8px', backgroundColor: saving ? '#94A3B8' : '#2563EB', color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Đang lưu...' : '💾 Lưu toàn bộ thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};