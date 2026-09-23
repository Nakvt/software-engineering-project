import { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinates } from '../../domain/models/Location';
import { POI } from '../../domain/models/POI';
import { GeofenceService } from '../../domain/services/GeofenceService';
import { LocationLib } from '../../libs/location';
import { AudioLib } from '../../libs/audio';
import * as Location from 'expo-location';

export function useGeofencing(pois: POI[], defaultLanguage: string = 'vi-VN') {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [activePOI, setActivePOI] = useState<POI | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Hàm cốt lõi: Đánh giá vị trí và kích hoạt phát âm thanh
  const checkAndTriggerPOI = useCallback(
    (coords: Coordinates) => {
      console.log('Đang kiểm tra tọa độ:', coords);
      const evaluation = GeofenceService.evaluateGeofence(coords, pois);

      if (evaluation.shouldTrigger && evaluation.poi) {
        const poi = evaluation.poi;
        console.log('>>> KÍCH HOẠT POI:', poi.name);
        setActivePOI(poi);

        // Ưu tiên đọc TTS hoặc audio
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

  // Hàm mô phỏng vị trí khi bấm nút trên giao diện
  const simulateLocation = useCallback(
    (coords: Coordinates) => {
      setCurrentLocation(coords);
      checkAndTriggerPOI(coords);
    },
    [checkAndTriggerPOI]
  );

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

      const initialPos = await LocationLib.getCurrentPosition();
      if (initialPos && isMounted) {
        setCurrentLocation(initialPos);
        checkAndTriggerPOI(initialPos);
      }

      const sub = await LocationLib.watchPosition((coords) => {
        if (!isMounted) return;
        setCurrentLocation(coords);
        checkAndTriggerPOI(coords);
      });

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
    simulateLocation, // Trả về hàm mô phỏng này cho nút bấm
  };
}