import fc from 'fast-check';
import {
  COLORS,
  getContrastColor,
  getDarkModeColor,
  getThemeAwareColor,
} from '@/shared/lib/colors';

describe('colors property-based tests', () => {
  // Generator for valid hex color components (0-255)
  const hexComponent = fc.integer({ min: 0, max: 255 });

  // Generator for valid hex colors
  const hexColor = fc.tuple(hexComponent, hexComponent, hexComponent).map(([r, g, b]) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

  describe('getDarkModeColor', () => {
    it('should always return a valid hex color', () => {
      fc.assert(
        fc.property(hexColor, (color) => {
          const result = getDarkModeColor(color);
          return /^#[0-9a-f]{6}$/.test(result);
        }),
        { numRuns: 100 },
      );
    });

    it('should always return a color darker than or equal to input', () => {
      fc.assert(
        fc.property(hexColor, (color) => {
          const input = color.replace('#', '');
          const result = getDarkModeColor(color).replace('#', '');

          const inputR = parseInt(input.substr(0, 2), 16);
          const inputG = parseInt(input.substr(2, 2), 16);
          const inputB = parseInt(input.substr(4, 2), 16);

          const resultR = parseInt(result.substr(0, 2), 16);
          const resultG = parseInt(result.substr(2, 2), 16);
          const resultB = parseInt(result.substr(4, 2), 16);

          return resultR <= inputR && resultG <= inputG && resultB <= inputB;
        }),
        { numRuns: 100 },
      );
    });

    it('should be idempotent for black', () => {
      expect(getDarkModeColor('#000000')).toBe('#000000');
    });
  });

  describe('getContrastColor', () => {
    it('should always return LIGHT_TEXT in dark mode', () => {
      fc.assert(
        fc.property(hexColor, (color) => {
          return getContrastColor(color, true) === COLORS.LIGHT_TEXT;
        }),
        { numRuns: 100 },
      );
    });

    it('should only return LIGHT_TEXT or DARK_TEXT in light mode', () => {
      fc.assert(
        fc.property(hexColor, (color) => {
          const result = getContrastColor(color, false);
          return result === COLORS.LIGHT_TEXT || result === COLORS.DARK_TEXT;
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('getThemeAwareColor', () => {
    it('should return input unchanged in light mode', () => {
      fc.assert(
        fc.property(hexColor, (color) => {
          return getThemeAwareColor(color, false) === color;
        }),
        { numRuns: 100 },
      );
    });

    it('should return darkened color in dark mode', () => {
      fc.assert(
        fc.property(hexColor, (color) => {
          const result = getThemeAwareColor(color, true);
          // Should be same as getDarkModeColor
          return result === getDarkModeColor(color);
        }),
        { numRuns: 100 },
      );
    });
  });
});
