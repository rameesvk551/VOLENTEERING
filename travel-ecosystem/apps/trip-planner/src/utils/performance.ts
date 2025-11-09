/**
 * Performance Monitoring - NomadicNook
 * 
 * Implements UX checks #201-250 (Performance Optimization)
 * Monitors Core Web Vitals and provides insights
 */

// #201-203: Core Web Vitals
export interface WebVitals {
  LCP: number; // Largest Contentful Paint - Target: < 2.5s
  FID: number; // First Input Delay - Target: < 100ms
  CLS: number; // Cumulative Layout Shift - Target: < 0.1
  TTFB: number; // Time to First Byte
  FCP: number; // First Contentful Paint
  TTI: number; // Time to Interactive
}

interface PerformanceMetrics {
  navigation: PerformanceNavigationTiming | null;
  memory: any;
  resources: PerformanceResourceTiming[];
  vitals: Partial<WebVitals>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    navigation: null,
    memory: null,
    resources: [],
    vitals: {},
  };

  constructor() {
    this.initializeMonitoring();
  }

  // #201-203: Monitor Core Web Vitals
  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
          this.checkLCP();
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Monitor FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.vitals.FID = entry.processingStart - entry.startTime;
            this.checkFID();
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Monitor CLS (Cumulative Layout Shift)
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
              this.metrics.vitals.CLS = clsScore;
              this.checkCLS();
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectNavigationMetrics();
        this.collectResourceMetrics();
        this.collectMemoryMetrics();
        this.reportMetrics();
      }, 0);
    });
  }

  // #204-220: Collect navigation metrics
  private collectNavigationMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.navigation = navigation;
      
      // Calculate key metrics
      this.metrics.vitals.TTFB = navigation.responseStart - navigation.requestStart;
      this.metrics.vitals.FCP = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.vitals.TTI = navigation.domInteractive - navigation.fetchStart;
    }
  }

  // #221-235: Monitor resource loading
  private collectResourceMetrics() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    this.metrics.resources = resources;

    // Identify slow resources
    const slowResources = resources.filter((r) => r.duration > 1000);
    if (slowResources.length > 0) {
      console.warn('Slow resources detected:', slowResources);
    }

    // Check image sizes
    const images = resources.filter((r) => r.initiatorType === 'img');
    images.forEach((img) => {
      if (img.transferSize > 1500000) { // 1.5MB
        console.warn(`Large image detected: ${img.name} (${(img.transferSize / 1024 / 1024).toFixed(2)}MB)`);
      }
    });
  }

  // #249: Monitor memory usage
  private collectMemoryMetrics() {
    if ('memory' in performance) {
      this.metrics.memory = (performance as any).memory;
      
      const memoryMB = this.metrics.memory.usedJSHeapSize / 1024 / 1024;
      if (memoryMB > 50) {
        console.warn(`High memory usage: ${memoryMB.toFixed(2)}MB`);
      }
    }
  }

  // #201: Check LCP threshold
  private checkLCP() {
    const lcp = this.metrics.vitals.LCP;
    if (lcp !== undefined) {
      if (lcp > 4000) {
        console.error(`❌ LCP is poor: ${(lcp / 1000).toFixed(2)}s (target: < 2.5s)`);
      } else if (lcp > 2500) {
        console.warn(`⚠️ LCP needs improvement: ${(lcp / 1000).toFixed(2)}s (target: < 2.5s)`);
      } else {
        console.log(`✅ LCP is good: ${(lcp / 1000).toFixed(2)}s`);
      }
    }
  }

  // #202: Check FID threshold
  private checkFID() {
    const fid = this.metrics.vitals.FID;
    if (fid !== undefined) {
      if (fid > 300) {
        console.error(`❌ FID is poor: ${fid.toFixed(2)}ms (target: < 100ms)`);
      } else if (fid > 100) {
        console.warn(`⚠️ FID needs improvement: ${fid.toFixed(2)}ms (target: < 100ms)`);
      } else {
        console.log(`✅ FID is good: ${fid.toFixed(2)}ms`);
      }
    }
  }

  // #203: Check CLS threshold
  private checkCLS() {
    const cls = this.metrics.vitals.CLS;
    if (cls !== undefined) {
      if (cls > 0.25) {
        console.error(`❌ CLS is poor: ${cls.toFixed(3)} (target: < 0.1)`);
      } else if (cls > 0.1) {
        console.warn(`⚠️ CLS needs improvement: ${cls.toFixed(3)} (target: < 0.1)`);
      } else {
        console.log(`✅ CLS is good: ${cls.toFixed(3)}`);
      }
    }
  }

  // Report all metrics
  private reportMetrics() {
    console.group('📊 Performance Metrics');
    
    console.log('Core Web Vitals:', {
      LCP: this.metrics.vitals.LCP ? `${(this.metrics.vitals.LCP / 1000).toFixed(2)}s` : 'N/A',
      FID: this.metrics.vitals.FID ? `${this.metrics.vitals.FID.toFixed(2)}ms` : 'N/A',
      CLS: this.metrics.vitals.CLS ? this.metrics.vitals.CLS.toFixed(3) : 'N/A',
      TTFB: this.metrics.vitals.TTFB ? `${this.metrics.vitals.TTFB.toFixed(2)}ms` : 'N/A',
      FCP: this.metrics.vitals.FCP ? `${(this.metrics.vitals.FCP / 1000).toFixed(2)}s` : 'N/A',
      TTI: this.metrics.vitals.TTI ? `${(this.metrics.vitals.TTI / 1000).toFixed(2)}s` : 'N/A',
    });

    if (this.metrics.memory) {
      console.log('Memory:', {
        used: `${(this.metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(this.metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(this.metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      });
    }

    console.log(`Resources loaded: ${this.metrics.resources.length}`);
    
    console.groupEnd();

    // Send to analytics (implement your analytics service)
    this.sendToAnalytics();
  }

  // #125: Send metrics to analytics
  private sendToAnalytics() {
    // Implement analytics integration here
    // Example: Google Analytics, Sentry, etc.
    if (process.env.NODE_ENV === 'production') {
      // window.gtag?.('event', 'web_vitals', { ...this.metrics.vitals });
    }
  }

  // Public API
  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  public markFeature(name: string) {
    performance.mark(name);
  }

  public measureFeature(name: string, startMark: string, endMark: string) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// #222: Lazy loading utility
export const lazyLoadImage = (img: HTMLImageElement) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          if (target.dataset.src) {
            target.src = target.dataset.src;
            target.removeAttribute('data-src');
          }
          if (target.dataset.srcset) {
            target.srcset = target.dataset.srcset;
            target.removeAttribute('data-srcset');
          }
          observer.unobserve(target);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );

  observer.observe(img);
};

// #240: Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// #240: Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// #210: Bundle size warning (development only)
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter((r) => r.name.endsWith('.js'));
    const totalJsSize = jsResources.reduce((acc, r) => acc + r.transferSize, 0);
    const totalSizeMB = totalJsSize / 1024 / 1024;

    if (totalSizeMB > 1) {
      console.warn(`⚠️ Total JS bundle size: ${totalSizeMB.toFixed(2)}MB (target: < 1MB)`);
    } else {
      console.log(`✅ Total JS bundle size: ${totalSizeMB.toFixed(2)}MB`);
    }
  });
}

export default performanceMonitor;
