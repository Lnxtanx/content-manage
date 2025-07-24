"use client";

/**
 * System Health Monitor
 * This utility provides tools to monitor the health of the application and refresh when necessary
 */

// Constants for health checking
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_FAILED_CHECKS = 3;
const API_HEALTH_ENDPOINT = '/api/health';

// State for health tracking
let failedChecksCount = 0;
let lastSuccessfulCheck = Date.now();
let isCheckingHealth = false;

/**
 * Health monitor for the application
 * Periodically checks system health and refreshes if needed
 */
export const healthMonitor = {
  // Initialize the health monitor
  init: () => {
    if (typeof window === 'undefined') return;
    
    // Start health checks
    setTimeout(() => {
      healthMonitor.startPeriodicChecks();
    }, 5000); // Start after 5 seconds
    
    // Log initialization
    console.log('[Health Monitor] Initialized');
  },
  
  // Start periodic health checks
  startPeriodicChecks: () => {
    // Don't start if already checking
    if (isCheckingHealth) return;
    isCheckingHealth = true;
    
    // Set up interval for checking
    const checkInterval = setInterval(() => {
      healthMonitor.checkHealth().catch(error => {
        console.error('[Health Monitor] Check failed:', error);
        healthMonitor.handleFailedCheck();
      });
    }, HEALTH_CHECK_INTERVAL);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
      isCheckingHealth = false;
    });
  },
  
  // Check health of the API
  checkHealth: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(API_HEALTH_ENDPOINT, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        // Reset failure count on success
        failedChecksCount = 0;
        lastSuccessfulCheck = Date.now();
        return true;
      } else {
        return healthMonitor.handleFailedCheck();
      }
    } catch (error) {
      return healthMonitor.handleFailedCheck();
    }
  },
  
  // Handle a failed health check
  handleFailedCheck: () => {
    failedChecksCount++;
    console.warn(`[Health Monitor] Failed check #${failedChecksCount}`);
    
    // Check if we've exceeded our threshold
    if (failedChecksCount >= MAX_FAILED_CHECKS) {
      console.error(`[Health Monitor] Health check failed ${failedChecksCount} times. Refreshing application...`);
      
      // Show a toast or notification if available
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Application Issue Detected', {
          body: 'The application is having trouble connecting. Refreshing the page...',
          icon: '/favicon.png'
        });
      }
      
      // Wait briefly, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return false;
    }
    
    // Check if it's been too long since our last successful check
    const timeSinceLastSuccess = Date.now() - lastSuccessfulCheck;
    if (timeSinceLastSuccess > HEALTH_CHECK_INTERVAL * 5) { // 5x the check interval
      console.error(`[Health Monitor] No successful health check in ${Math.round(timeSinceLastSuccess/1000)} seconds. Refreshing application...`);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return false;
    }
    
    return false;
  },
  
  // Force a refresh of the application
  forceRefresh: (delayMs = 0) => {
    console.log(`[Health Monitor] Forcing refresh in ${delayMs}ms`);
    setTimeout(() => {
      window.location.reload();
    }, delayMs);
  }
};

// Auto-init in browser
if (typeof window !== 'undefined') {
  // Initialize after page load
  if (document.readyState === 'complete') {
    healthMonitor.init();
  } else {
    window.addEventListener('load', healthMonitor.init);
  }
}

// Export a utility for checking component health
export const componentHealth = {
  // Check if a component is healthy
  check: (component: string, checkFn: () => boolean) => {
    try {
      const isHealthy = checkFn();
      if (!isHealthy) {
        console.warn(`[Component Health] ${component} reported unhealthy state`);
      }
      return isHealthy;
    } catch (error) {
      console.error(`[Component Health] ${component} health check failed:`, error);
      return false;
    }
  },
  
  // Report a component error
  reportError: (component: string, error: Error) => {
    console.error(`[Component Health] ${component} error:`, error);
    
    // Increment error count for this component
    const errorKey = `err_${component.replace(/\s+/g, '_')}`;
    const currentErrors = parseInt(sessionStorage.getItem(errorKey) || '0', 10);
    sessionStorage.setItem(errorKey, (currentErrors + 1).toString());
    
    // If too many errors for this component, suggest refresh
    if (currentErrors >= 3) {
      if (confirm(`The ${component} component is experiencing issues. Would you like to refresh the page?`)) {
        window.location.reload();
      }
    }
  }
};
