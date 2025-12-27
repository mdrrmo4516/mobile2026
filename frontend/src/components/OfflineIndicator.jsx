import { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';
import offlineQueue from '../utils/offlineQueue';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const handleSync = useCallback(async () => {
    if (syncing || !isOnline) return;

    setSyncing(true);
    try {
      const results = await offlineQueue.syncAll();
      console.log('[OfflineIndicator] Sync results:', results);
      
      // Show success message
      if (results.success > 0) {
        alert(`Successfully synced ${results.success} incident report(s)!`);
      }
      
      if (results.failed > 0) {
        console.error('[OfflineIndicator] Failed to sync some incidents:', results.errors);
      }
    } catch (error) {
      console.error('[OfflineIndicator] Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [syncing, isOnline]);

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Auto-sync when coming back online
      handleSync();
      // Hide banner after 5 seconds
      setTimeout(() => setShowBanner(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize offline queue and get count
    offlineQueue.init().then(() => {
      offlineQueue.getQueueCount().then(count => {
        setQueueCount(count);
      });
    });

    // Listen for queue changes
    const handleQueueChange = (count) => {
      setQueueCount(count);
    };
    offlineQueue.addListener(handleQueueChange);

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          console.log('[OfflineIndicator] Sync complete:', event.data);
          setSyncing(false);
          // Refresh queue count
          offlineQueue.getQueueCount().then(count => {
            setQueueCount(count);
          });
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineQueue.removeListener(handleQueueChange);
    };
  }, [handleSync]);

  // Don't show anything if online and no queue
  if (isOnline && queueCount === 0 && !showBanner) {
    return null;
  }

  return (
    <>
      {/* Status Banner */}
      {showBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-white text-center text-sm font-medium animate-slideDown ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
          data-testid="connection-status-banner"
        >
          <div className="flex items-center justify-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Back online - Syncing queued reports...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>No internet connection - Reports will be queued</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Queue Indicator */}
      {queueCount > 0 && (
        <div
          className="fixed bottom-20 left-4 right-4 bg-yellow-500 text-white rounded-xl shadow-lg p-4 z-40 animate-slideUp"
          data-testid="queue-indicator"
        >
          <div className="flex items-start gap-3">
            <CloudOff className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {queueCount} Incident Report{queueCount !== 1 ? 's' : ''} Queued
              </p>
              <p className="text-xs mt-1 opacity-90">
                {isOnline
                  ? 'These reports will be synced automatically'
                  : 'Will sync when connection is restored'}
              </p>
            </div>
            {isOnline && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-lg p-2 transition-colors"
                data-testid="manual-sync-btn"
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
                />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Persistent Offline Indicator */}
      {!isOnline && queueCount === 0 && (
        <div
          className="fixed bottom-20 left-4 right-4 bg-slate-700 text-white rounded-xl shadow-lg p-3 z-40 flex items-center gap-3"
          data-testid="offline-mode-indicator"
        >
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline Mode</span>
        </div>
      )}
    </>
  );
}
