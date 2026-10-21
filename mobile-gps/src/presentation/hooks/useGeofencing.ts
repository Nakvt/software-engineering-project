import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '../../domain/models/Location';
import { POI, MultiLangString } from '../../domain/models/POI';
import { GeofenceService } from '../../domain/services/GeofenceService';
import { poiService } from '../../domain/services/poiService';
import { AudioQueueService } from '../../domain/services/AudioQueueService';
import { LocationLib } from '../../libs/location';
import { AudioLib } from '../../libs/audio';

// Định nghĩa danh sách các mã ngôn ngữ hỗ trợ
export type SupportedLanguage = 'vi' | 'en' | 'ja' | 'zh' | 'ko';

/**
 * Hàm hỗ trợ lấy chuỗi văn bản phù hợp theo ngôn ngữ được chọn
 */
function getTranslation(
  value?: string | MultiLangString,
  lang: SupportedLanguage = 'vi'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  // Nếu là đối tượng MultiLangString, ưu tiên lấy ngôn ngữ được chọn, fallback về tiếng Việt
  return value[lang] || value.vi || '';
}

export function useGeofencing(
  initialPois: POI[] = [],
  selectedLanguage: SupportedLanguage = 'vi'
) {
  const [pois, setPois] = useState<POI[]>(initialPois);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [activePOI, setActivePOI] = useState<POI | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // 1. Tải danh sách POIs qua Service (API hoặc Fallback Mock)
  useEffect(() => {
    let isMounted = true;
    const fetchPOIs = async () => {
      const data = await poiService.getAllPOIs();
      if (isMounted) {
        setPois(data);
      }
    };
    fetchPOIs();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Đánh giá vị trí và đẩy vào AudioQueueService thay vì phát trực tiếp
  const checkAndTriggerPOI = useCallback(
    (coords: Coordinates) => {
      console.log('Đang kiểm tra tọa độ:', coords);
      const evaluation = GeofenceService.evaluateGeofence(coords, pois);

      if (evaluation.shouldTrigger && evaluation.poi) {
        const poi = evaluation.poi;
        const poiName = getTranslation(poi.name, selectedLanguage);
        console.log(`>>> KÍCH HOẠT POI: ${poiName} (Ngôn ngữ: ${selectedLanguage})`);
        
        setActivePOI(poi);

        // Đẩy POI vào Hàng chờ thuyết minh để xử lý Cooldown & Priority
        AudioQueueService.enqueue(poi, selectedLanguage);
      } else {
        console.log('Không có POI nào trong bán kính hoặc đang trong Cooldown');
      }
    },
    [pois, selectedLanguage]
  );

  // 3. Hàm mô phỏng vị trí khi bấm các nút test trên giao diện
  const simulateLocation = useCallback(
    (coords: Coordinates) => {
      setCurrentLocation(coords);
      checkAndTriggerPOI(coords);
    },
    [checkAndTriggerPOI]
  );

  // 4. Khởi tạo theo dõi vị trí GPS
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
          timeInterval: 2000,
          distanceInterval: 2,
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
      // Dọn sạch hàng chờ âm thanh khi unmount
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