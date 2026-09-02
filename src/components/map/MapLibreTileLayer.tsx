'use client';

// MapLibre vector tile layer wrapped as a Leaflet layer via @maplibre/maplibre-gl-leaflet.
// Pattern from the official docs / Stadia Maps tutorial.
//
// maplibre-gl is constrained to the 4.x line (^4.7.1, NOT the latest v6.x) on purpose:
// v5+ changed its worker reload behavior in a way that conflicts with Next.js 16's
// Turbopack dev/build server, silently failing to load vector tiles (blank map, no error).
// See https://github.com/vercel/next.js/issues/86495 — unresolved upstream as of
// writing. Do not upgrade past the 4.x line until that issue is fixed.
import {
  type LayerProps,
  createElementObject,
  createLayerComponent,
  withPane,
} from '@react-leaflet/core';
import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';

interface MapLibreTileLayerProps extends LayerProps {
  url: string;
  attribution?: string;
}

// MaplibreGL extends L.Layer (not GridLayer), so we use createLayerComponent
// rather than createTileLayerComponent/updateGridLayer.
export const MapLibreTileLayer = createLayerComponent<L.MaplibreGL, MapLibreTileLayerProps>(
  function createTileLayer({ url, attribution, ...options }, context) {
    const layer = L.maplibreGL(
      withPane({ style: url, attribution, noWrap: true, ...options }, context)
    );
    return createElementObject(layer, context);
  },
  function updateTileLayer(layer, props, prevProps) {
    if (props.url !== prevProps.url) {
      layer.getMaplibreMap().setStyle(props.url);
    }
  }
);
