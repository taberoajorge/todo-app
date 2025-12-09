import {
  COLORS,
  getContrastColor,
  getDarkModeColor,
  getThemeAwareColor,
  isLightColor,
  LIGHT_COLORS,
} from '@/shared/lib/colors';

describe('colors', () => {
  describe('getDarkModeColor', () => {
    it('should darken a color by 40%', () => {
      // White (#ffffff) should become #999999 (60% of 255)
      expect(getDarkModeColor('#ffffff')).toBe('#999999');
    });

    it('should handle colors without hash prefix', () => {
      expect(getDarkModeColor('ffffff')).toBe('#999999');
    });

    it('should darken the primary color correctly', () => {
      // #5f33e1 should become darker
      const result = getDarkModeColor('#5f33e1');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
      // Should be darker than original
      expect(result).not.toBe('#5f33e1');
    });

    it('should return black for black input', () => {
      expect(getDarkModeColor('#000000')).toBe('#000000');
    });
  });

  describe('getContrastColor', () => {
    it('should return light text for dark mode', () => {
      expect(getContrastColor('#000000', true)).toBe(COLORS.LIGHT_TEXT);
      expect(getContrastColor('#ffffff', true)).toBe(COLORS.LIGHT_TEXT);
    });

    it('should return dark text for light backgrounds in light mode', () => {
      expect(getContrastColor('#ffffff', false)).toBe(COLORS.DARK_TEXT);
      expect(getContrastColor('#eeeeee', false)).toBe(COLORS.DARK_TEXT);
    });

    it('should return light text for dark backgrounds in light mode', () => {
      expect(getContrastColor('#000000', false)).toBe(COLORS.LIGHT_TEXT);
      expect(getContrastColor('#333333', false)).toBe(COLORS.LIGHT_TEXT);
    });

    it('should handle colors without hash prefix', () => {
      expect(getContrastColor('ffffff', false)).toBe(COLORS.DARK_TEXT);
    });
  });

  describe('getThemeAwareColor', () => {
    it('should return original color in light mode', () => {
      expect(getThemeAwareColor('#5f33e1', false)).toBe('#5f33e1');
    });

    it('should return darkened color in dark mode', () => {
      const result = getThemeAwareColor('#5f33e1', true);
      expect(result).not.toBe('#5f33e1');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe('COLORS', () => {
    it('should have expected values', () => {
      expect(COLORS.PRIMARY).toBe('#5f33e1');
      expect(COLORS.DARK_TEXT).toBe('#1a1a2e');
      expect(COLORS.LIGHT_TEXT).toBe('#ffffff');
    });
  });

  describe('LIGHT_COLORS', () => {
    it('should contain expected light colors', () => {
      expect(LIGHT_COLORS).toContain('#ffe5a4');
      expect(LIGHT_COLORS).toContain('#ebe4ff');
      expect(LIGHT_COLORS).toContain('#7dc8e7');
      expect(LIGHT_COLORS).toContain('#77dd77');
    });

    it('should have exactly 4 colors', () => {
      expect(LIGHT_COLORS).toHaveLength(4);
    });
  });

  describe('isLightColor', () => {
    it('should return true for colors in LIGHT_COLORS', () => {
      expect(isLightColor('#ffe5a4')).toBe(true);
      expect(isLightColor('#ebe4ff')).toBe(true);
      expect(isLightColor('#7dc8e7')).toBe(true);
      expect(isLightColor('#77dd77')).toBe(true);
    });

    it('should return false for colors not in LIGHT_COLORS', () => {
      expect(isLightColor('#5f33e1')).toBe(false); // primary purple
      expect(isLightColor('#f77bba')).toBe(false); // pink
      expect(isLightColor('#000000')).toBe(false); // black
      expect(isLightColor('#ffffff')).toBe(false); // white (not in list)
    });

    it('should return false for arbitrary colors', () => {
      expect(isLightColor('#123456')).toBe(false);
      expect(isLightColor('#abcdef')).toBe(false);
    });
  });
});
