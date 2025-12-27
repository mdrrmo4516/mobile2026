// Cache manager for pre-caching critical data

const CRITICAL_ENDPOINTS = [
  '/api/hotlines',
  '/api/resources',
  '/api/checklist',
  '/api/map/locations',
];

class CacheManager {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || '';
  }

  // Pre-cache critical API endpoints
  async preCacheCriticalData() {
    console.log('[CacheManager] Pre-caching critical data...');
    
    const promises = CRITICAL_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        if (response.ok) {
          console.log('[CacheManager] Cached:', endpoint);
          return { endpoint, success: true };
        } else {
          console.warn('[CacheManager] Failed to cache:', endpoint, response.status);
          return { endpoint, success: false };
        }
      } catch (error) {
        console.error('[CacheManager] Error caching:', endpoint, error);
        return { endpoint, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    
    console.log(`[CacheManager] Pre-cached ${successCount}/${CRITICAL_ENDPOINTS.length} endpoints`);
    
    return results;
  }

  // Clear old cache data
  async clearOldCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('mdrrmo') && !name.includes('-v1')
      );
      
      await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
      console.log(`[CacheManager] Cleared ${oldCaches.length} old caches`);
    }
  }

  // Check if data is available in cache
  async isCached(endpoint) {
    if ('caches' in window) {
      const cache = await caches.open('mdrrmo-api-v1');
      const response = await cache.match(`${this.baseURL}${endpoint}`);
      return !!response;
    }
    return false;
  }

  // Get cache status for all critical endpoints
  async getCacheStatus() {
    const status = {};
    
    for (const endpoint of CRITICAL_ENDPOINTS) {
      status[endpoint] = await this.isCached(endpoint);
    }
    
    return status;
  }

  // Manually trigger cache refresh
  async refreshCache() {
    console.log('[CacheManager] Refreshing cache...');
    await this.clearOldCache();
    return await this.preCacheCriticalData();
  }
}

// Export singleton instance
const cacheManager = new CacheManager();
export default cacheManager;
