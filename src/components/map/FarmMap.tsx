import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MapData, ZonePolygon } from '../../lib/types';

interface FarmMapProps {
  data: MapData;
  onZoneClick?: (zone: ZonePolygon) => void;
}

const zoneColors: Record<string, { fill: string; stroke: string }> = {
  healthy: { fill: '#16a34a', stroke: '#15803d' },
  warning: { fill: '#d97706', stroke: '#b45309' },
  critical: { fill: '#dc2626', stroke: '#b91c1c' },
};

const markerColors: Record<string, string> = {
  critical: '#dc2626',
  high: '#d97706',
  medium: '#eab308',
  low: '#16a34a',
};

export function FarmMap({ data, onZoneClick }: FarmMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [data.center_lat, data.center_lng],
        zoom: data.zoom_default,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      data.zones.forEach((zone) => {
        const colors = zoneColors[zone.status];
        const latlngs = zone.polygon.map(
          (p) => [p.lat, p.lng] as [number, number]
        );
        const poly = L.polygon(latlngs, {
          color: colors.stroke,
          fillColor: colors.fill,
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map);

        poly.on('click', () => {
          if (onZoneClick) onZoneClick(zone);
        });

        const center = poly.getBounds().getCenter();
        L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'zone-label',
        })
          .setContent(
            `<span style="font-weight:600;font-size:11px;color:#1c1917">${zone.zone_name.split('–')[0].trim()}</span>`
          )
          .setLatLng(center)
          .addTo(map);
      });

      data.detection_markers.forEach((marker) => {
        const color = markerColors[marker.severity];
        const icon = L.divIcon({
          html: `<div style="
            width:24px;height:24px;border-radius:50%;
            background:${color};border:2px solid white;
            box-shadow:0 2px 4px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
          "></div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([marker.lat, marker.lng], { icon })
          .addTo(map)
          .on('click', () => {
            navigate(`/detections/${marker.detection_id}`);
          });
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data, navigate, onZoneClick]);

  return <div ref={mapRef} className="w-full h-full" />;
}
