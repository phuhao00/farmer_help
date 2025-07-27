// Performance monitoring utilities
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = {};
  }

  // Measure component render time
  measureRender(componentName, renderFunction) {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    this.recordMetric('render', componentName, endTime - startTime);
    return result;
  }

  // Measure API call performance
  async measureApiCall(apiName, apiFunction) {
    const startTime = performance.now();
    try {
      const result = await apiFunction();
      const endTime = performance.now();
      this.recordMetric('api', apiName, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric('api_error', apiName, endTime - startTime);
      throw error;
    }
  }

  // Record custom metrics
  recordMetric(type, name, value) {
    if (!this.metrics[type]) {
      this.metrics[type] = {};
    }
    if (!this.metrics[type][name]) {
      this.metrics[type][name] = [];
    }
    this.metrics[type][name].push({
      value,
      timestamp: Date.now(),
    });
  }

  // Get performance metrics
  getMetrics(type, name) {
    if (type && name) {
      return this.metrics[type]?.[name] || [];
    }
    if (type) {
      return this.metrics[type] || {};
    }
    return this.metrics;
  }

  // Calculate average performance
  getAverageMetric(type, name) {
    const metrics = this.getMetrics(type, name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Monitor Core Web Vitals
  initCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('core_web_vitals', 'lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.lcp = lcpObserver;

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('core_web_vitals', 'fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.fid = fidObserver;

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('core_web_vitals', 'cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.cls = clsObserver;
    }
  }

  // Monitor memory usage
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  // Monitor network performance
  getNetworkInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
      };
    }
    return null;
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      memory: this.getMemoryUsage(),
      network: this.getNetworkInfo(),
      averages: {},
    };

    // Calculate averages for each metric type
    Object.keys(this.metrics).forEach(type => {
      report.averages[type] = {};
      Object.keys(this.metrics[type]).forEach(name => {
        report.averages[type][name] = this.getAverageMetric(type, name);
      });
    });

    return report;
  }

  // Clean up observers
  disconnect() {
    Object.values(this.observers).forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers = {};
  }
}

// Device detection utilities
export const DeviceDetector = {
  isMobile() {
    return window.innerWidth <= 768;
  },

  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  isDesktop() {
    return window.innerWidth > 1024;
  },

  getTouchSupport() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },

  getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
  },

  getOrientation() {
    if (screen.orientation) {
      return screen.orientation.angle;
    }
    return window.orientation || 0;
  },
};

// Image optimization utilities
export const ImageOptimizer = {
  // Generate responsive image URLs
  getResponsiveImageUrl(baseUrl, width, quality = 80) {
    if (baseUrl.includes('unsplash.com')) {
      return `${baseUrl}&w=${width}&q=${quality}&fm=webp`;
    }
    if (baseUrl.includes('placehold.co')) {
      return baseUrl.replace(/\d+x\d+/, `${width}x${Math.round(width * 0.75)}`);
    }
    return baseUrl;
  },

  // Lazy load images
  lazyLoadImage(img, src) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.src = src;
            entry.target.classList.remove('lazy');
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(img);
    } else {
      // Fallback for older browsers
      img.src = src;
    }
  },

  // Preload critical images
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },
};

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize Core Web Vitals monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.initCoreWebVitals();
}