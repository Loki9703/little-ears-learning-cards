export const EXCAVATOR_ACTION_SECONDS = 5.6;
export const BOOM_LENGTH = 78;
export const STICK_LENGTH = 63;
export const SHOULDER = { x: 112, y: 77 };

// Absolute joint angles: reach the ground, curl inward, lift the load, tip it out.
const beats = [
  { at: 0, boom: -145, stick: 122, bucket: 0, load: 0 },
  { at: .4, boom: -145, stick: 120, bucket: 4, load: 0 },
  { at: 1.35, boom: -163, stick: 110, bucket: 0, load: 0 },
  { at: 2.05, boom: -165, stick: 120, bucket: -65, load: 1 },
  { at: 2.55, boom: -153, stick: 128, bucket: -65, load: 1 },
  { at: 3.15, boom: -140, stick: 112, bucket: -65, load: 1 },
  { at: 3.65, boom: -140, stick: 112, bucket: 30, load: 1 },
  { at: 4.25, boom: -140, stick: 112, bucket: 35, load: 0 },
  { at: 5.2, boom: -145, stick: 122, bucket: 0, load: 0 },
  { at: EXCAVATOR_ACTION_SECONDS, boom: -145, stick: 122, bucket: 0, load: 0 },
];

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
const radians = (degrees: number) => degrees * Math.PI / 180;
const release = {
  x: SHOULDER.x + Math.cos(radians(-140)) * BOOM_LENGTH + Math.cos(radians(112)) * STICK_LENGTH - 4 * Math.cos(radians(30)) - 24 * Math.sin(radians(30)),
  y: SHOULDER.y + Math.sin(radians(-140)) * BOOM_LENGTH + Math.sin(radians(112)) * STICK_LENGTH - 4 * Math.sin(radians(30)) + 24 * Math.cos(radians(30)),
};

export function excavatorPose(time: number) {
  const age = Math.max(0, Math.min(EXCAVATOR_ACTION_SECONDS, time));
  const end = beats.findIndex((beat) => beat.at >= age);
  const from = beats[Math.max(0, end - 1)];
  const to = beats[Math.max(0, end)];
  const mix = smooth((age - from.at) / (to.at - from.at || 1));
  const boom = from.boom + (to.boom - from.boom) * mix;
  const stick = from.stick + (to.stick - from.stick) * mix;
  const bucket = from.bucket + (to.bucket - from.bucket) * mix;
  const load = from.load + (to.load - from.load) * mix;
  const elbow = {
    x: SHOULDER.x + Math.cos(radians(boom)) * BOOM_LENGTH,
    y: SHOULDER.y + Math.sin(radians(boom)) * BOOM_LENGTH,
  };
  const wrist = {
    x: elbow.x + Math.cos(radians(stick)) * STICK_LENGTH,
    y: elbow.y + Math.sin(radians(stick)) * STICK_LENGTH,
  };
  const pistonEnd = {
    x: SHOULDER.x + Math.cos(radians(boom)) * 40,
    y: SHOULDER.y + Math.sin(radians(boom)) * 40,
  };
  return {
    boom, stick: stick - boom, bucket: bucket - stick, load, elbow, wrist,
    pistonLength: Math.hypot(pistonEnd.x - 104, pistonEnd.y - 87),
    pistonAngle: Math.atan2(pistonEnd.y - 87, pistonEnd.x - 104) * 180 / Math.PI - 90,
    // Soil leaves the lip at the dumping pose, then falls under gravity.
    soil: Array.from({ length: 5 }, (_, index) => {
      const fall = (age - 3.63 - index * .075) / .58;
      const t = Math.max(0, Math.min(1, fall));
      return {
        x: release.x + index * 2.8 + t * (index - 1) * 2,
        y: release.y + index * 1.2 + 32 * t * t,
        opacity: fall > 0 && fall < 1 ? Math.min(1, fall * 12, (1 - fall) * 8) : 0,
      };
    }),
  };
}
