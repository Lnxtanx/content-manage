// Custom performance interface that includes memory property
interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

// Extend Window interface to include the non-standard memory property
declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

export {};
