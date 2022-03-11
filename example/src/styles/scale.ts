import clamp from 'lodash/clamp';
import { Dimensions, ScaledSize } from 'react-native';

type ScreenDimensions = Pick<ScaledSize, 'height' | 'width'> | ScaledSize;

/* screenDimensions calculated based on size of window */
export const screenDimensions = Dimensions.get('window');

/* base dimensions based on iPhone SE */
const baseDimensions: ScreenDimensions = {
  height: 568,
  width: 320,
};

interface NormalizeOptions {
  min?: number;
  max?: number;
  screenDimensions: ScreenDimensions;
}

const roundedClamp = (num: number, min: number, max: number) =>
  Math.round(clamp(num, min, max));

const scaleDimension = (
  dimension: number,
  dimensionName: 'height' | 'width',
  options: NormalizeOptions
) => {
  return roundedClamp(
    options.screenDimensions[dimensionName] *
      (dimension / baseDimensions[dimensionName]),
    options.min || 0,
    options.max || options.screenDimensions[dimensionName]
  );
};

export const normalizedHeight = (
  height: number,
  options: Partial<NormalizeOptions> = {}
) =>
  scaleDimension(height, 'height', {
    screenDimensions,
    ...options,
  });

export const normalizedWidth = (
  width: number,
  options: Partial<NormalizeOptions> = { screenDimensions }
) =>
  scaleDimension(width, 'width', {
    screenDimensions,
    ...options,
  });

export const normalizedDimensions = (
  height: number,
  width: number,
  scale = 1
) => {
  const apectRatio = height / width;

  return {
    height: normalizedWidth(width) * apectRatio * scale,
    width: normalizedWidth(width) * scale,
  };
};

/* scale fontsize by comparing the window's actual width to our base width */
export const normalizedFontSize = (
  fontSize: number,
  options: Partial<NormalizeOptions> = {}
) => {
  const currentDimensions = options.screenDimensions ?? screenDimensions;

  return Math.round(
    (fontSize * currentDimensions.width) / baseDimensions.width
  );
};
