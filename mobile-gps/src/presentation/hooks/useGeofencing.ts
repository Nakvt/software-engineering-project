import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '../../domain/models/Location';
import { POI } from '../../domain/models/POI';
import { GeofenceService } from '../../domain/services/GeofenceService';
import { poiService } from '../../domain/services/poiService';
import { LocationLib } from '../../libs/location';
import { AudioLib } from '../../libs/audio';

export function useGeofencing(initialPois: POI[] = [], defaultLanguage: string = 'vi-VN') {
  const [pois, setPois] = useState<POI[]>(initialPois);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [activePOI, setActivePOI] = useState<POI | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // 1. Tải danh sách POIs qua Service (Ưu tiên Backend API, tự động Fallback sang Mock)
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

  // 2. Hàm cốt lõi: Đánh giá vị trí và kích hoạt phát âm thanh
  const checkAndTriggerPOI = useCallback(
    (coords: Coordinates) => {
      console.log('Đang kiểm tra tọa độ:', coords);
      const evaluation = GeofenceService.evaluateGeofence(coords, pois);

      if (evaluation.shouldTrigger && evaluation.poi) {
        const poi = evaluation.poi;
        console.log('>>> KÍCH HOẠT POI:', poi.name);
        setActivePOI(poi);

        // Ưu tiên đọc giọng đọc TTS hoặc phát file audio URL
        if (poi.audio?.ttsScript) {
          AudioLib.playTTS(poi.audio.ttsScript, defaultLanguage);
        } else if (poi.audio?.audioUrl) {
          AudioLib.playAudio(poi.audio.audioUrl);
        }
      } else {
        console.log('Không có POI nào trong bán kính hoặc đang trong Cooldown');
      }
    },
    [pois, defaultLanguage]
  );

  // 3. Hàm mô phỏng vị trí khi bấm các nút test trên giao diện
  const simulateLocation = useCallback(
    (coords: Coordinates) => {
      setCurrentLocation(coords);
      checkAndTriggerPOI(coords);
    },
    [checkAndTriggerPOI]
  );

  // 4. Quản lý vòng đời GPS: Xin quyền, bật Background tracking và lắng nghe vị trí Foreground
  useEffect(() => {
    let isMounted = true;

    async function initTracking() {
      // Xin cả quyền Foreground lẫn Background
      const granted = await LocationLib.requestPermissions();
      if (!isMounted) return;
      setHasPermission(granted);

      if (!granted) {
        console.warn('Quyền truy cập GPS bị từ chối!');
        return;
      }

      // Kích hoạt dịch vụ GPS chạy ngầm
      await LocationLib.startBackgroundTracking();

      // Lấy vị trí ban đầu
      const initialPos = await LocationLib.getCurrentLocation();
      if (initialPos && isMounted) {
        setCurrentLocation(initialPos);
        checkAndTriggerPOI(initialPos);
      }

      // Lắng nghe thay đổi vị trí trực tiếp từ expo-location khi mở màn hình
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
      AudioLib.stopAll();
    };
  }, [checkAndTriggerPOI]);

  return {
    currentLocation,
    activePOI,
    hasPermission,
    simulateLocation,
    pois, // Trả về danh sách POIs động để MapScreen vẽ Marker
  };
}