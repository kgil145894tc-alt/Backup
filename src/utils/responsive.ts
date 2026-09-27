import { Dimensions, PixelRatio } from "react-native";

const guidelineWidth = 390;
const { width } = Dimensions.get("window");

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return PixelRatio.roundToNearestPixel(value);
}

export function rs(size: number, min = size * 0.88, max = size * 1.12) {
  return round(clamp(size * (width / guidelineWidth), min, max));
}

export function rf(size: number, min = size * 0.9, max = size * 1.08) {
  return round(clamp(size * (width / guidelineWidth), min, max));
}

export function isCompactPhone() {
  return width < 360;
}
