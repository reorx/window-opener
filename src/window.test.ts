import { calFigures, calFigure, WindowData } from './window';

// Mock context for testing
const mockContext = {
  screenWidth: 1920,
  screenHeight: 1080,
  xOffset: 0,
  yOffset: 24,
  windowWidth: 800,
  windowHeight: 600,
};

// Helper function to create test window data
function createTestWindow(): WindowData {
  return {
    id: new Date().getTime().toString(),
    name: '',
    url: '',
    type: 'normal',
    focused: true,
    default: false,
    left: '',
    top: '',
    width: '',
    height: '',
  };
}

describe('Figure Calculation Logic', () => {
  describe('calFigure - Individual figure calculation', () => {
    it('should calculate simple numeric expressions', () => {
      const data = createTestWindow();
      data.left = '100';

      const result = calFigure(data, 'left', mockContext);
      expect(result).toBe(100);
    });

    it('should calculate expressions with context variables', () => {
      const data = createTestWindow();
      data.left = 'windowWidth + 50';

      const result = calFigure(data, 'left', mockContext);
      expect(result).toBe(850); // 800 + 50
    });

    it('should handle complex mathematical expressions', () => {
      const data = createTestWindow();
      data.left = '(screenWidth - 700) / 2';

      const result = calFigure(data, 'left', mockContext);
      expect(result).toBe(610); // (1920 - 700) / 2 = 610
    });

    it('should return undefined for empty expressions', () => {
      const data = createTestWindow();
      data.left = '';

      const result = calFigure(data, 'left', mockContext);
      expect(result).toBeUndefined();
    });

    it('should return NaN for invalid expressions', () => {
      const data = createTestWindow();
      data.left = 'invalid + expression';

      const result = calFigure(data, 'left', mockContext);
      expect(result).toBeNaN();
    });
  });

  describe('calFigures - All non-dynamic calculations', () => {
    it('should calculate all static figures', () => {
      const data = createTestWindow();
      data.left = '100';
      data.top = '200';
      data.width = '800';
      data.height = '600';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 100,
        top: 200,
        width: 800,
        height: 600
      });
    });

    it('should handle expressions with context variables', () => {
      const data = createTestWindow();
      data.left = 'windowWidth + xOffset';
      data.top = 'yOffset';
      data.width = 'screenWidth - windowWidth - xOffset';
      data.height = 'screenHeight - yOffset';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 800, // 800 + 0
        top: 24,   // 24
        width: 1120, // 1920 - 800 - 0
        height: 1056 // 1080 - 24
      });
    });
  });

  describe('Dependency resolution - left depends on width/height', () => {
    it('should calculate left after width when left depends on width', () => {
      const data = createTestWindow();
      data.left = '(screenWidth - width) / 2';
      data.top = '100';
      data.width = '600';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 660, // (1920 - 600) / 2 = 660
        top: 100,
        width: 600,
        height: 400
      });
    });

    it('should calculate left after height when left depends on height', () => {
      const data = createTestWindow();
      data.left = 'height + 50';
      data.top = '100';
      data.width = '600';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 450, // 400 + 50
        top: 100,
        width: 600,
        height: 400
      });
    });
  });

  describe('Dependency resolution - top depends on height', () => {
    it('should calculate top after height when top depends on height', () => {
      const data = createTestWindow();
      data.left = '100';
      data.top = '(screenHeight - height) / 2';
      data.width = '600';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 100,
        top: 340, // (1080 - 400) / 2 = 340
        width: 600,
        height: 400
      });
    });
  });

  describe('Dependency resolution - width depends on left/top', () => {
    it('should calculate width after left when width depends on left', () => {
      const data = createTestWindow();
      data.left = '200';
      data.top = '100';
      data.width = 'screenWidth - left - 100';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 200,
        top: 100,
        width: 1620, // 1920 - 200 - 100 = 1620
        height: 400
      });
    });

    it('should calculate width after top when width depends on top', () => {
      const data = createTestWindow();
      data.left = '200';
      data.top = '100';
      data.width = 'screenWidth - top * 2';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 200,
        top: 100,
        width: 1720, // 1920 - 100 * 2 = 1720
        height: 400
      });
    });
  });

  describe('Dependency resolution - height depends on top', () => {
    it('should calculate height after top when height depends on top', () => {
      const data = createTestWindow();
      data.left = '200';
      data.top = '100';
      data.width = '600';
      data.height = 'screenHeight - top - 50';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 200,
        top: 100,
        width: 600,
        height: 930 // 1080 - 100 - 50 = 930
      });
    });
  });

  describe('Multiple dependency calculations', () => {
    it('should handle left and top both depending on width and height', () => {
      const data = createTestWindow();
      data.left = '(screenWidth - width) / 2';
      data.top = '(screenHeight - height) / 2';
      data.width = '600';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 660, // (1920 - 600) / 2 = 660
        top: 340,  // (1080 - 400) / 2 = 340
        width: 600,
        height: 400
      });
    });

    it('should handle width and height both depending on left and top', () => {
      const data = createTestWindow();
      data.left = '100';
      data.top = '50';
      data.width = 'screenWidth - left - 200';
      data.height = 'screenHeight - top - 100';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 100,
        top: 50,
        width: 1620, // 1920 - 100 - 200 = 1620
        height: 930  // 1080 - 50 - 100 = 930
      });
    });

    it('should handle complex cross-references', () => {
      const data = createTestWindow();
      data.left = 'width / 4';
      data.top = 'height / 3';
      data.width = '800';
      data.height = '600';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 200, // 800 / 4 = 200
        top: 200,  // 600 / 3 = 200
        width: 800,
        height: 600
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty expressions', () => {
      const data = createTestWindow();
      data.left = '';
      data.top = '100';
      data.width = '600';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        top: 100,
        width: 600,
        height: 400
        // left should be undefined/missing
      });
      expect(result.left).toBeUndefined();
    });

    it('should handle invalid expressions', () => {
      const data = createTestWindow();
      data.left = 'invalid + expression';
      data.top = '100';
      data.width = '600';
      data.height = '400';

      const result = calFigures(data, mockContext);

      expect(result.left).toBeNaN();
      expect(result.top).toBe(100);
      expect(result.width).toBe(600);
      expect(result.height).toBe(400);
    });

    it('should detect circular dependencies and throw error', () => {
      const data = createTestWindow();
      data.left = 'width + 100';
      data.top = '100';
      data.width = 'left + 200';
      data.height = '400';

      expect(() => {
        calFigures(data, mockContext);
      }).toThrow(/Circular dependency detected/);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle "center on screen" scenario', () => {
      const data = createTestWindow();
      data.left = '(screenWidth - width) / 2';
      data.top = '(screenHeight - height) / 2';
      data.width = '600';
      data.height = '500';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 660, // (1920 - 600) / 2
        top: 290,  // (1080 - 500) / 2
        width: 600,
        height: 500
      });
    });

    it('should handle "fill right of current window" scenario', () => {
      const data = createTestWindow();
      data.left = 'windowWidth + xOffset';
      data.top = 'yOffset';
      data.width = 'screenWidth - windowWidth - xOffset';
      data.height = 'screenHeight - yOffset';

      const result = calFigures(data, mockContext);

      expect(result).toEqual({
        left: 800,   // 800 + 0
        top: 24,     // 24
        width: 1120, // 1920 - 800 - 0
        height: 1056 // 1080 - 24
      });
    });
  });
});
