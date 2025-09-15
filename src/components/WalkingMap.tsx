import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface WalkingMapProps {
  currentPosition: Position | null;
  route: Position[];
  isTracking: boolean;
}

// TEMPORÁRIO: Token público do Mapbox para demonstração
// IMPORTANTE: Em produção, este token deve ser obtido via secrets do Supabase
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export const WalkingMap: React.FC<WalkingMapProps> = ({ 
  currentPosition, 
  route, 
  isTracking 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Inicializar mapa
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: currentPosition ? [currentPosition.longitude, currentPosition.latitude] : [-46.6333, -23.5505], // São Paulo como padrão
      zoom: 16,
      pitch: 0,
      bearing: 0
    });

    // Adicionar controles
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Adicionar controle de geolocalização
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    map.current.on('load', () => {
      // Adicionar source para a rota
      map.current?.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Adicionar layer para a rota
      map.current?.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#E11D48', // Cor primária
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Adicionar layer de pontos da rota
      map.current?.addLayer({
        id: 'route-points',
        type: 'circle',
        source: 'route',
        paint: {
          'circle-radius': 3,
          'circle-color': '#FFFFFF',
          'circle-stroke-color': '#E11D48',
          'circle-stroke-width': 2
        }
      });
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Atualizar posição atual
  useEffect(() => {
    if (!map.current || !currentPosition) return;

    // Atualizar/criar marcador da posição atual
    if (markerRef.current) {
      markerRef.current.setLngLat([currentPosition.longitude, currentPosition.latitude]);
    } else {
      // Criar elemento customizado para o marcador
      const el = document.createElement('div');
      el.className = 'current-position-marker';
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #E11D48;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(225, 29, 72, 0.6);
        animation: pulse 2s infinite;
      `;

      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([currentPosition.longitude, currentPosition.latitude])
        .addTo(map.current);

      // Adicionar animação CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    // Centralizar no usuário se estiver rastreando
    if (isTracking) {
      map.current.easeTo({
        center: [currentPosition.longitude, currentPosition.latitude],
        duration: 1000
      });
    }
  }, [currentPosition, isTracking]);

  // Atualizar rota
  useEffect(() => {
    if (!map.current || route.length === 0) return;

    const coordinates = route.map(pos => [pos.longitude, pos.latitude]);
    
    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });

      // Ajustar visualização para mostrar toda a rota
      if (coordinates.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord as [number, number]));
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 17
        });
      }
    }
  }, [route]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg shadow-lg" 
      />
      
      {/* Overlay de informações */}
      {!currentPosition && !isTracking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
          <div className="text-center text-white">
            <div className="text-xl font-semibold mb-2">GPS não ativo</div>
            <div className="text-sm opacity-80">
              Inicie uma caminhada para ver sua localização
            </div>
          </div>
        </div>
      )}

      {/* Indicador de precisão GPS */}
      {currentPosition && currentPosition.accuracy && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
          GPS: ±{Math.round(currentPosition.accuracy)}m
        </div>
      )}
    </div>
  );
};