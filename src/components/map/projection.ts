import type { MapCamera } from './MapHost';

// Flat equirectangular projection. Good enough at city zoom levels (z≥14)
// where the visible area is small and Mercator distortion is negligible.
// For Lille we operate at z≈15-17 where errors are sub-pixel.
//
// The camera surfaces `latitudeDelta` / `longitudeDelta` (the lat/lng span
// covered by the visible viewport), so we can map a coordinate to a
// pixel position by linear interpolation around the camera's center.
export function projectLatLng(
  lat: number,
  lng: number,
  cam: MapCamera,
  size: { width: number; height: number },
) {
  if (!size.width || !size.height || !cam.latitudeDelta || !cam.longitudeDelta) {
    return null;
  }
  const x = ((lng - cam.longitude) / cam.longitudeDelta) * size.width + size.width / 2;
  const y = ((cam.latitude - lat) / cam.latitudeDelta) * size.height + size.height / 2;
  return { x, y };
}

// At zoom z, a longitude span across W pixels ≈ (W / 256) * (360 / 2^z).
// Latitude span scales by cos(latitude). Used as a sensible *first*
// estimate before the native map fires its first onCameraMove.
export function deltasFromZoom(
  lat: number,
  zoom: number,
  size: { width: number; height: number },
) {
  const ZOOM_BASE = 256;
  const lngDelta = (size.width / ZOOM_BASE) * (360 / Math.pow(2, zoom));
  const latDelta = lngDelta * Math.cos((lat * Math.PI) / 180) * (size.height / size.width);
  return { latitudeDelta: latDelta, longitudeDelta: lngDelta };
}
