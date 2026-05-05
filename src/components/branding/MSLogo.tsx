import { Image } from 'expo-image';

const SOURCE = require('../../../assets/images/mystreet-logo.png');

type Props = {
  size?: number;
  /**
   * When set, tints the PNG with a solid color (mirrors web's
   * `[filter:brightness(0)_invert(1)]` trick used by `<Mark invert>`).
   * Leave undefined to show the original artwork (terracotta + cream).
   */
  color?: string;
  /** Kept for backward compatibility — ignored now that we use the PNG. */
  window?: string;
};

export function MSLogo({ size = 28, color }: Props) {
  return (
    <Image
      source={SOURCE}
      style={{ width: size, height: size }}
      contentFit="contain"
      tintColor={color}
    />
  );
}
