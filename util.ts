// calculate bearing between two coordinates
export const calculateBearing = (start: number[], end: number[]) => {
  const startLat = (start[1] * Math.PI) / 180;
  const startLng = (start[0] * Math.PI) / 180;
  const endLat = (end[1] * Math.PI) / 180;
  const endLng = (end[0] * Math.PI) / 180;

  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);

  return (Math.atan2(y, x) * 180) / Math.PI;
};
