import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '../../domain/models/Location';
import { POI } from '../../domain/models/POI';
import { poiService } from '../../domain/services/poiService';
import { AudioQueueService } from '../../domain/services/AudioQueueService';
import { SessionService } from '../../domain/services/sessionService'; // Giả định service lấy sessionId hiện tại
import { LocationLib } from '../../libs/location';

export type SupportedLanguage = 'vi' | 'en' | 'ja' | 'zh' | 'ko';

export function useGeofencing(
  initialPois: POI[] = [],
  selectedLanguage: SupportedLanguage = 'vi'
) {
  const [pois, setPois] = useState<POI[]>(initialPois);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [activePOI, setActivePOI] = useState<POI | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const isPingingRef = useRef<boolean>(false); // Cờ chặn gọi API dồn dập

  // 1. Tải danh sách POIs qua Service
  useEffect(() => {
    let isMounted = true;
    const fetchPOIs = async () => {
      const data = await poiService.getAllPOIs(selectedLanguage);
      if (isMounted) {
        setPois(data);
      }
    };
    fetchPOIs();
    return () => {
      isMounted = false;
    };
  }, [selectedLanguage]);

  // 2. GỬI TRACKING PING LÊN BACKEND (API THỨ 3) & TỰ ĐỘNG BẬT TTS
  const checkAndTriggerPOI = useCallback(
    async (coords: Coordinates) => {
      if (isPingingRef.current) return;

      try {
        isPingingRef.current = true;
        console.log('📍 [Tracking Ping] Đang gửi tọa độ lên Backend:', coords);

        // Lấy Session ID từ Service hoặc dùng ID dự phòng
        const sessionId = SessionService.getSessionId() || 'a73985d2-f67a-42c2-8419-58b9f36fba7c';

        // Gọi API thứ 3: POST /api/v1/tracking/ping
        const response = await poiService.sendTrackingPing(
          sessionId,
          coords.lat,
          coords.lng,
          selectedLanguage
        );

        // Logic xử lý khi Backend trả về Trigger = true
        if (response.shouldTrigger && response.poi) {
          const triggeredPoi = response.poi;
          console.log(`>>> 🟢 [KÍCH HOẠT GEOFENCE API 3]: ${triggeredPoi.name} (Ngôn ngữ: ${selectedLanguage})`);

          setActivePOI(triggeredPoi);

          // 🚀 TỰ ĐỘNG ĐẨY VÀO HÀNG CHỜ VÀ PHÁT TTS
          AudioQueueService.enqueue(triggeredPoi, selectedLanguage);
        } else {
          console.log('⚪ [Tracking Ping] Không chạm bán kính POI hoặc đang trong Cooldown DB.');
        }
      } catch (error) {
        console.error('❌ [Tracking Ping Error]:', error);
      } finally {
        isPingingRef.current = false;
      }
    },
    [selectedLanguage]
  );

  // 3. Hàm mô phỏng vị trí GPS cho nút test
  const simulateLocation = useCallback(
    (coords: Coordinates) => {
      setCurrentLocation(coords);
      checkAndTriggerPOI(coords);
    },
    [checkAndTriggerPOI]
  );

  // 4. Khởi tạo và lắng nghe GPS thời gian thực
  useEffect(() => {
    let isMounted = true;

    async function initTracking() {
      const granted = await LocationLib.requestPermissions();
      if (!isMounted) return;
      setHasPermission(granted);

      if (!granted) {
        console.warn('Quyền truy cập GPS bị từ chối!');
        return;
      }

      await LocationLib.startBackgroundTracking();

      const initialPos = await LocationLib.getCurrentLocation();
      if (initialPos && isMounted) {
        setCurrentLocation(initialPos);
        checkAndTriggerPOI(initialPos);
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 3,
        },
        (loc) => {
          if (!isMounted) return;
          const coords: Coordinates = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          };
          setCurrentLocation(coords);
          checkAndTriggerPOI(coords);
        }
      );

      subscriptionRef.current = sub;
    }

    initTracking();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
      AudioQueueService.clearQueue();
    };
  }, [checkAndTriggerPOI]);

  return {
    currentLocation,
    activePOI,
    hasPermission,
    simulateLocation,
    pois,
  };
}