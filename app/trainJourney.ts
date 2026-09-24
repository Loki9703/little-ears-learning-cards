export const TRAIN_JOURNEY_SECONDS = 7.6;

export type TrainGeometry = {
  homeX: number;
  width: number;
  viewportX: number;
  viewportWidth: number;
};

// Wrap only after the entire consist has cleared the viewport, including its shadow.
export function trainJourneyX(progress: number, geometry: TrainGeometry) {
  const p = Math.max(0, Math.min(1, progress));
  if (p === 0 || p === 1) return geometry.homeX;
  const left = geometry.viewportX - geometry.width - 32;
  const right = geometry.viewportX + geometry.viewportWidth + 32;
  const distance = right - left;
  const eased = p * p * (3 - 2 * p);
  const x = geometry.homeX - distance * eased;
  return x < left ? x + distance : x;
}
