import { calFigures, calFigure, WindowData } from './window';

// Mock static context for consistent testing
const mockStaticContext = {
  screenWidth: 1920,
  screenHeight: 1080,
  xOffset: 0,
  yOffset: 24
};

// Mock base context for testing
const mockContext = {
  windowWidth: 800,
  windowHeight: 600,
  ...mockStaticContext
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
    staticContext: mockStaticContext,
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
      data.staticContext = mockStaticContext;
      
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
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 800, // 800 + 0
        top: 24,   // 24
        width: 1120, // 1920 - 800 - 0
        height: 1056 // 1080 - 24
      });
    });
  });

  describe('Dynamic calculations - left dynamic', () => {
    it('should calculate dynamic left based on static width', () => {
      const data = createTestWindow();
      data.left = '(screenWidth - width) / 2';
      data.top = '100';
      data.width = '600';
      data.height = '400';
      data.dynamicLeft = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 660, // (1920 - 600) / 2 = 660
        top: 100,
        width: 600,
        height: 400
      });
    });

    it('should calculate dynamic left based on static height', () => {
      const data = createTestWindow();
      data.left = 'height + 50';
      data.top = '100';
      data.width = '600';
      data.height = '400';
      data.dynamicLeft = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 450, // 400 + 50
        top: 100,
        width: 600,
        height: 400
      });
    });
  });

  describe('Dynamic calculations - top dynamic', () => {
    it('should calculate dynamic top based on static height', () => {
      const data = createTestWindow();
      data.left = '100';
      data.top = '(screenHeight - height) / 2';
      data.width = '600';
      data.height = '400';
      data.dynamicTop = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 100,
        top: 340, // (1080 - 400) / 2 = 340
        width: 600,
        height: 400
      });
    });
  });

  describe('Dynamic calculations - width dynamic', () => {
    it('should calculate dynamic width based on static left', () => {
      const data = createTestWindow();
      data.left = '200';
      data.top = '100';
      data.width = 'screenWidth - left - 100';
      data.height = '400';
      data.dynamicWidth = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 200,
        top: 100,
        width: 1620, // 1920 - 200 - 100 = 1620
        height: 400
      });
    });

    it('should calculate dynamic width based on static top', () => {
      const data = createTestWindow();
      data.left = '200';
      data.top = '100';
      data.width = 'screenWidth - top * 2';
      data.height = '400';
      data.dynamicWidth = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 200,
        top: 100,
        width: 1720, // 1920 - 100 * 2 = 1720
        height: 400
      });
    });
  });

  describe('Dynamic calculations - height dynamic', () => {
    it('should calculate dynamic height based on static top', () => {
      const data = createTestWindow();
      data.left = '200';
      data.top = '100';
      data.width = '600';
      data.height = 'screenHeight - top - 50';
      data.dynamicHeight = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 200,
        top: 100,
        width: 600,
        height: 930 // 1080 - 100 - 50 = 930
      });
    });
  });

  describe('Multiple dynamic calculations', () => {
    it('should handle left and top both dynamic', () => {
      const data = createTestWindow();
      data.left = '(screenWidth - width) / 2';
      data.top = '(screenHeight - height) / 2';
      data.width = '600';
      data.height = '400';
      data.dynamicLeft = true;
      data.dynamicTop = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        left: 660, // (1920 - 600) / 2 = 660
        top: 340,  // (1080 - 400) / 2 = 340
        width: 600,
        height: 400
      });
    });

    it('should handle width and height both dynamic', () => {
      const data = createTestWindow();
      data.left = '100';
      data.top = '50';
      data.width = 'screenWidth - left - 200';
      data.height = 'screenHeight - top - 100';
      data.dynamicWidth = true;
      data.dynamicHeight = true;
      data.staticContext = mockStaticContext;
      
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
      data.dynamicLeft = true;
      data.dynamicTop = true;
      data.staticContext = mockStaticContext;
      
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
    it('should handle empty expressions in dynamic calculations', () => {
      const data = createTestWindow();
      data.left = '';
      data.top = '100';
      data.width = '600';
      data.height = '400';
      data.dynamicLeft = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result).toEqual({
        top: 100,
        width: 600,
        height: 400
        // left should be undefined/missing
      });
      expect(result.left).toBeUndefined();
    });

    it('should handle invalid expressions in dynamic calculations', () => {
      const data = createTestWindow();
      data.left = 'invalid + expression';
      data.top = '100';
      data.width = '600';
      data.height = '400';
      data.dynamicLeft = true;
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      expect(result.left).toBeNaN();
      expect(result.top).toBe(100);
      expect(result.width).toBe(600);
      expect(result.height).toBe(400);
    });

    it('should prevent circular dependencies by calculating non-dynamic first', () => {
      const data = createTestWindow();
      // This would be circular if both were dynamic
      data.left = 'width + 100';
      data.top = '100';
      data.width = 'left + 200'; // Would reference left, but left isn't available in static phase
      data.height = '400';
      data.dynamicLeft = true; // Only left is dynamic
      data.staticContext = mockStaticContext;
      
      const result = calFigures(data, mockContext);
      
      // Width is calculated first as static: NaN (because left isn't available in context yet)
      // But NaN gets converted to 0 in the enhanced context
      // Then left is calculated as dynamic: 0 + 100 = 100
      expect(result.width).toBeNaN();
      expect(result.left).toBe(100); // 0 + 100 (since width defaulted to 0)
      expect(result.top).toBe(100);
      expect(result.height).toBe(400);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle "center on screen" scenario', () => {
      const data = createTestWindow();
      data.left = '(screenWidth - width) / 2';
      data.top = '(screenHeight - height) / 2';
      data.width = '600';
      data.height = '500';
      data.dynamicLeft = true;
      data.dynamicTop = true;
      data.staticContext = mockStaticContext;
      
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
      data.dynamicLeft = true;
      data.dynamicTop = true;
      data.dynamicWidth = true;
      data.dynamicHeight = true;
      data.staticContext = mockStaticContext;
      
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