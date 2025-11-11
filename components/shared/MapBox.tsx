"use client";

import { useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MarkerDragEvent,
  type MapLayerMouseEvent,
} from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

export interface MarkerData {
  lng: number;
  lat: number;
  label?: string;
}

interface MapBoxProps {
  // Legacy props (single marker mode)
  latitude?: number;
  longitude?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  draggableMarker?: boolean;
  
  // New props (multiple markers mode)
  center?: [number, number]; // [lng, lat]
  markers?: MarkerData[];
  onClick?: (lng: number, lat: number) => void;
  height?: string;
  
  // Common props
  className?: string;
  zoom?: number;
}

/**
 * MapBox Component
 * Interactive map component using Mapbox GL JS
 *
 * Supports two modes:
 * 1. Single marker mode: Use latitude/longitude props with draggableMarker
 * 2. Multiple markers mode: Use center and markers array
 *
 * @param latitude - Center latitude (single marker mode)
 * @param longitude - Center longitude (single marker mode)
 * @param onLocationChange - Callback when marker is dragged (single marker mode)
 * @param draggableMarker - Whether the marker can be dragged (single marker mode)
 * @param center - Map center as [lng, lat] (multiple markers mode)
 * @param markers - Array of markers to display (multiple markers mode)
 * @param onClick - Callback when map is clicked (multiple markers mode)
 * @param height - Map height (default: 100%)
 * @param className - Additional CSS classes
 * @param zoom - Initial zoom level (default: 13)
 */
export default function MapBox({
  latitude,
  longitude,
  onLocationChange,
  draggableMarker = false,
  center,
  markers,
  onClick,
  height,
  className = "",
  zoom = 13,
}: MapBoxProps) {
  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Determine map center
  const mapCenter = center 
    ? { lng: center[0], lat: center[1] }
    : { lng: longitude || 0, lat: latitude || 0 };

  // Single marker mode state
  const [markerPosition, setMarkerPosition] = useState({
    latitude: latitude || 0,
    longitude: longitude || 0,
  });

  const handleMarkerDragEnd = (event: MarkerDragEvent) => {
    const { lngLat } = event;
    const newLat = lngLat.lat;
    const newLng = lngLat.lng;

    setMarkerPosition({
      latitude: newLat,
      longitude: newLng,
    });

    if (onLocationChange) {
      onLocationChange(newLat, newLng);
    }
  };

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (onClick && event.lngLat) {
      onClick(event.lngLat.lng, event.lngLat.lat);
    }
  };

  if (!mapToken) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mapbox token not configured
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  // Check for valid coordinates
  const hasValidCenter = 
    !isNaN(mapCenter.lng) && 
    !isNaN(mapCenter.lat) && 
    mapCenter.lng !== 0 && 
    mapCenter.lat !== 0;

  if (!hasValidCenter) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ height: height || "400px" }}
      >
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click &quot;Get Current Location&quot; or click on the map to set a location
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ height: height || "100%" }}
    >
      <Map
        latitude={mapCenter.lat}
        longitude={mapCenter.lng}
        zoom={zoom}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapToken}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />

        {/* Single marker mode */}
        {!markers && latitude !== undefined && longitude !== undefined && (
        <Marker
          latitude={markerPosition.latitude}
          longitude={markerPosition.longitude}
          draggable={draggableMarker}
          onDragEnd={handleMarkerDragEnd}
        >
          <div className="relative">
            <div className="absolute -top-10 -left-4">
              <MapPin
                className="h-10 w-10 text-indigo-600 drop-shadow-lg"
                fill="currentColor"
                strokeWidth={1}
              />
            </div>
          </div>
        </Marker>
        )}

        {/* Multiple markers mode */}
        {markers &&
          markers.map((marker, index) => (
            <Marker
              key={index}
              latitude={marker.lat}
              longitude={marker.lng}
            >
              <div className="relative">
                <div className="absolute -top-10 -left-4">
                  <MapPin
                    className="h-10 w-10 text-indigo-600 drop-shadow-lg"
                    fill="currentColor"
                    strokeWidth={1}
                  />
                </div>
                {marker.label && (
                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap">
                    {marker.label}
                  </div>
                )}
              </div>
            </Marker>
          ))}
      </Map>

      {draggableMarker && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Drag the marker to adjust location
          </p>
        </div>
      )}

      {onClick && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Click on the map to set location
          </p>
        </div>
      )}
    </div>
  );
}
