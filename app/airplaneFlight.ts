export const AIRPLANE_FLIGHT_SECONDS = 7.6;
type Point = { x: number; y: number };
export type FlightGeometry = {
  home: Point;
  size: number;
  viewport: { x: number; y: number; width: number; height: number };
};
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smooth = (value: number) => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };

function bezier(points: Point[], t: number) {
  const u = 1 - t;
  const [a, b, c, d] = points;
  const x = u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x;
  const y = u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y;
  const dx = 3 * u * u * (b.x - a.x) + 6 * u * t * (c.x - b.x) + 3 * t * t * (d.x - c.x);
  const dy = 3 * u * u * (b.y - a.y) + 6 * u * t * (c.y - b.y) + 3 * t * t * (d.y - c.y);
  return { x, y, rotation: Math.atan2(dy, dx) * 180 / Math.PI + 45 };
}

export function airplaneFlightPose(progress: number, geometry: FlightGeometry) {
  const { home, size, viewport: v } = geometry;
  const cruiseScale = Math.min(.72, Math.max(1, Math.min(v.width, v.height) - 32) / (size * Math.SQRT2));
  // All curve controls lie inside the viewport, with space for a rotated plane.
  const radius = size * cruiseScale / Math.SQRT2 + 12;
  const left = v.x + radius, right = v.x + v.width - radius;
  const top = v.y + radius, bottom = v.y + v.height - radius;
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  const rx = (right - left) / 2, ry = (bottom - top) / 2;
  const k = .55228475;
  const h = { x: clamp(home.x, left, right), y: clamp(home.y, top, bottom) };
  if (progress <= .08 || progress >= .92) {
    const blend = progress <= .08 ? smooth(progress / .08) : smooth((1 - progress) / .08);
    return {
      x: home.x + (h.x - home.x) * blend, y: home.y + (h.y - home.y) * blend,
      scale: 1 + (cruiseScale - 1) * blend, rotation: 0,
    };
  }
  const r = { x: right, y: cy }, t = { x: cx, y: top };
  const l = { x: left, y: cy }, b = { x: cx, y: bottom };
  const reach = Math.min(rx, ry) * .45;
  const bounded = (x: number, y: number) => ({ x: clamp(x, left, right), y: clamp(y, top, bottom) });
  const curves = [
    [h, bounded(h.x + reach, h.y - reach), { x: right, y: cy + ry * .5 }, r],
    [r, { x: right, y: cy - k * ry }, { x: cx + k * rx, y: top }, t],
    [t, { x: cx - k * rx, y: top }, { x: left, y: cy - k * ry }, l],
    [l, { x: left, y: cy + k * ry }, { x: cx - k * rx, y: bottom }, b],
    [b, { x: cx + k * rx, y: bottom }, { x: right, y: cy + k * ry }, r],
    [r, { x: right, y: cy - ry * .5 }, bounded(h.x - reach, h.y + reach), h],
  ];
  const route = clamp((progress - .08) / .84, 0, 1) * curves.length;
  const index = Math.min(curves.length - 1, Math.floor(route));
  const pose = bezier(curves[index], smooth(route - index));
  // Ease into the original heading if a narrow viewport constrains a home handle.
  const heading = ((pose.rotation + 180) % 360 + 360) % 360 - 180;
  const edge = smooth((progress - .08) / .035) * smooth((.92 - progress) / .035);
  return { ...pose, rotation: heading * edge, scale: cruiseScale };
}
