import { useEffect, useRef } from 'react';
import { performanceMonitor } from '../utils/performance';

// Hook for monitoring component performance
export const usePerformanceMonitoring = (componentName) => {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    performanceMonitor.recordMetric('component_render', componentName, renderTime);
    
    return () => {
      // Record component unmount time
      const unmountTime = performance.now();
      performanceMonitor.recordMetric('component_unmount', componentName, unmountTime - renderEndTime);
    };
  }, [componentName]);

  const measureAction = (actionName, actionFunction) => {
    return performanceMonitor.measureRender(`${componentName}_${actionName}`, actionFunction);
  };

  const measureAsyncAction = async (actionName, asyncFunction) => {
    return performanceMonitor.measureApiCall(`${componentName}_${actionName}`, asyncFunction);
  };

  return { measureAction, measureAsyncAction };
};

// Hook for monitoring API calls
export const useApiPerformance = () => {
  const measureApiCall = async (apiName, apiFunction) => {
    return performanceMonitor.measureApiCall(apiName, apiFunction);
  };

  const getApiMetrics = (apiName) => {
    return performanceMonitor.getMetrics('api', apiName);
  };

  const getAverageApiTime = (apiName) => {
    return performanceMonitor.getAverageMetric('api', apiName);
  };

  return { measureApiCall, getApiMetrics, getAverageApiTime };
};

// Hook for device detection
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    touchSupport: false,
    viewport: { width: 0, height: 0 },
    orientation: 0,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024,
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        orientation: screen.orientation?.angle || window.orientation || 0,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// Hook for network monitoring
export const useNetworkMonitoring = () => {
  const [networkInfo, setNetworkInfo] = useState({
    online: navigator.onLine,
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: false,
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      setNetworkInfo({
        online: navigator.onLine,
        effectiveType: navigator.connection?.effectiveType || null,
        downlink: navigator.connection?.downlink || null,
        rtt: navigator.connection?.rtt || null,
        saveData: navigator.connection?.saveData || false,
      });
    };

    updateNetworkInfo();

    const handleOnline = () => setNetworkInfo(prev => ({ ...prev, online: true }));
    const handleOffline = () => setNetworkInfo(prev => ({ ...prev, online: false }));
    const handleConnectionChange = updateNetworkInfo;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkInfo;
};

// Hook for memory monitoring
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usagePercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};