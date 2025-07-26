import { calFigures, calFigure, WindowData } from './window';

/*
Multi-Monitor Test Setup:

In a multi-monitor setup, Chrome calculates screen and window bounds within a large virtual canvas
that encompasses all connected monitors. The coordinate system (0, 0) represents the top-left 
corner of the topmost-leftmost monitor.

For our test scenarios, we simulate two monitors:

1. Top Monitor (Primary): 1920x1080 resolution
   - Position: _screenLeftAbs = 0, _screenTopAbs = 0
   - Available area: full screen (assuming no system UI offsets for simplicity)

2. Bottom Monitor (Secondary): 1440x720 resolution  
   - Position: _screenLeftAbs = 240, _screenTopAbs = 1080
   - The horizontal offset (240) centers this narrower monitor below the primary monitor:
     (1920 - 1440) / 2 = 240

This setup allows us to test window positioning calculations across different monitor 
configurations, ensuring expressions work correctly regardless of which monitor contains 
the current window.
*/

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

describe('Multi-Monitor Window Positioning Tests', () => {
  describe('Top Monitor (1920x1080 at 0,0) - Window positioned on primary monitor', () => {
    const topMonitorContext = {
      screenWidth: 1920,
      screenHeight: 1080,
      _screenLeftAbs: 0,
      _screenTopAbs: 0,
      _windowLeftAbs: 100,
      _windowTopAbs: 124,
      xOffset: 0,
      yOffset: 24, // macOS menubar
      windowWidth: 800,
      windowHeight: 600,
      windowLeft: 100, // relative to screen: _windowLeftAbs - _screenLeftAbs
      windowTop: 100,  // relative to screen: _windowTopAbs - _screenTopAbs
    };

    it('should handle "Fill Right of Current Window" example', () => {
      const data = createTestWindow();
      data.name = 'Fill Right Side';
      data.left = 'windowWidth + xOffset';
      data.top = 'yOffset';
      data.width = 'screenWidth - windowWidth - xOffset';
      data.height = 'screenHeight - yOffset';

      const result = calFigures(data, topMonitorContext);

      expect(result).toEqual({
        left: 800,   // 800 + 0
        top: 24,     // 24 (menubar offset)
        width: 1120, // 1920 - 800 - 0
        height: 1056 // 1080 - 24
      });
    });

    it('should handle "Center on Screen" example', () => {
      const data = createTestWindow();
      data.name = 'Centered Window';
      data.width = 'screenWidth / 3';
      data.height = 'screenHeight / 2';
      data.left = '(screenWidth - width) / 2';
      data.top = '(screenHeight - height) / 2';

      const result = calFigures(data, topMonitorContext);

      expect(result).toEqual({
        left: 640,  // (1920 - 640) / 2
        top: 270,   // (1080 - 540) / 2
        width: 640, // 1920 / 3
        height: 540 // 1080 / 2
      });
    });

    it('should position window relative to current window on top monitor', () => {
      const data = createTestWindow();
      data.name = 'Next to Current';
      data.left = 'windowLeft + windowWidth + 20';
      data.top = 'windowTop';
      data.width = '400';
      data.height = 'windowHeight';

      const result = calFigures(data, topMonitorContext);

      expect(result).toEqual({
        left: 920,  // 100 + 800 + 20
        top: 100,   // same as current window
        width: 400,
        height: 600
      });
    });

    it('should fill bottom area under current window on top monitor', () => {
      const data = createTestWindow();
      data.name = 'Fill Bottom Area';
      data.left = 'windowLeft';
      data.top = 'windowTop + windowHeight';
      data.width = 'windowWidth';
      data.height = 'screenHeight - windowTop - windowHeight';

      const result = calFigures(data, topMonitorContext);

      expect(result).toEqual({
        left: 100,  // same as current window
        top: 700,   // 100 + 600
        width: 800, // same width as current window
        height: 380 // 1080 - 100 - 600 - remaining available height
      });
    });
  });

  describe('Bottom Monitor (1440x720 at 240,1080) - Window positioned on secondary monitor', () => {
    const bottomMonitorContext = {
      screenWidth: 1440,
      screenHeight: 720,
      _screenLeftAbs: 240,
      _screenTopAbs: 1080,
      _windowLeftAbs: 440, // absolute position: 240 + 200
      _windowTopAbs: 1230, // absolute position: 1080 + 150
      xOffset: 0,
      yOffset: 0, // no system UI on secondary monitor
      windowWidth: 600,
      windowHeight: 400,
      windowLeft: 200, // relative to screen: _windowLeftAbs - _screenLeftAbs = 440 - 240
      windowTop: 150,  // relative to screen: _windowTopAbs - _screenTopAbs = 1230 - 1080
    };

    it('should handle "Fill Right of Current Window" example on bottom monitor', () => {
      const data = createTestWindow();
      data.name = 'Fill Right Side';
      data.left = 'windowWidth + xOffset';
      data.top = 'yOffset';
      data.width = 'screenWidth - windowWidth - xOffset';
      data.height = 'screenHeight - yOffset';

      const result = calFigures(data, bottomMonitorContext);

      expect(result).toEqual({
        left: 600,  // 600 + 0
        top: 0,     // 0 (no system UI offset)
        width: 840, // 1440 - 600 - 0
        height: 720 // 720 - 0
      });
    });

    it('should handle "Center on Screen" example on bottom monitor', () => {
      const data = createTestWindow();
      data.name = 'Centered Window';
      data.width = 'screenWidth / 3';
      data.height = 'screenHeight / 2';
      data.left = '(screenWidth - width) / 2';
      data.top = '(screenHeight - height) / 2';

      const result = calFigures(data, bottomMonitorContext);

      expect(result).toEqual({
        left: 480,  // (1440 - 480) / 2
        top: 180,   // (720 - 360) / 2
        width: 480, // 1440 / 3
        height: 360 // 720 / 2
      });
    });

    it('should position window relative to current window on bottom monitor', () => {
      const data = createTestWindow();
      data.name = 'Below Current';
      data.left = 'windowLeft';
      data.top = 'windowTop + windowHeight + 20';
      data.width = 'windowWidth';
      data.height = '200';

      const result = calFigures(data, bottomMonitorContext);

      expect(result).toEqual({
        left: 200,  // same x position as current window
        top: 570,   // 150 + 400 + 20
        width: 600,
        height: 200
      });
    });

    it('should fill bottom area under current window on bottom monitor', () => {
      const data = createTestWindow();
      data.name = 'Fill Bottom Area';
      data.left = 'windowLeft';
      data.top = 'windowTop + windowHeight';
      data.width = 'windowWidth';
      data.height = 'screenHeight - windowTop - windowHeight';

      const result = calFigures(data, bottomMonitorContext);

      expect(result).toEqual({
        left: 200,  // same as current window
        top: 550,   // 150 + 400
        width: 600, // same width as current window
        height: 170 // 720 - 150 - 400 - remaining available height
      });
    });
  });
});
