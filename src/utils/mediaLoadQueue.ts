/**
 * Media Load Queue - Controls concurrent media downloads
 * Limits simultaneous downloads to prevent network congestion on mobile
 */

type MediaLoadCallback = () => void;

interface QueueItem {
  id: string;
  priority: 'high' | 'normal' | 'low';
  onReady: MediaLoadCallback;
  addedAt: number;
}

class MediaLoadQueue {
  private queue: QueueItem[] = [];
  private activeCount = 0;
  private readonly maxConcurrent: number;
  private readySet = new Set<string>();

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Request permission to load media
   * Returns true immediately if slot available, otherwise queues
   */
  request(id: string, priority: 'high' | 'normal' | 'low', onReady: MediaLoadCallback): boolean {
    // Already in ready set - allow immediately
    if (this.readySet.has(id)) {
      return true;
    }

    // Check if already in queue
    const existingIndex = this.queue.findIndex(item => item.id === id);
    if (existingIndex !== -1) {
      // Update priority if higher
      const existing = this.queue[existingIndex];
      if (this.getPriorityValue(priority) > this.getPriorityValue(existing.priority)) {
        this.queue[existingIndex].priority = priority;
        this.queue[existingIndex].onReady = onReady;
        this.sortQueue();
      }
      return false;
    }

    // If we have capacity, allow immediately
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      this.readySet.add(id);
      return true;
    }

    // Add to queue
    this.queue.push({
      id,
      priority,
      onReady,
      addedAt: Date.now(),
    });
    this.sortQueue();

    return false;
  }

  /**
   * Mark media as complete (loaded or failed)
   */
  complete(id: string): void {
    if (this.readySet.has(id)) {
      this.readySet.delete(id);
      this.activeCount = Math.max(0, this.activeCount - 1);
      this.processQueue();
    }
  }

  /**
   * Preload items at low priority
   */
  preload(ids: string[], onReady: (id: string) => void): void {
    ids.forEach(id => {
      if (!this.readySet.has(id) && !this.queue.some(item => item.id === id)) {
        this.request(id, 'low', () => onReady(id));
      }
    });
  }

  /**
   * Clear queue (e.g., on unmount)
   */
  clear(): void {
    this.queue = [];
    this.activeCount = 0;
    this.readySet.clear();
  }

  private getPriorityValue(priority: 'high' | 'normal' | 'low'): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
    }
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Higher priority first
      const priorityDiff = this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      // Earlier items first (FIFO within same priority)
      return a.addedAt - b.addedAt;
    });
  }

  private processQueue(): void {
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        this.activeCount++;
        this.readySet.add(item.id);
        item.onReady();
      }
    }
  }
}

// Singleton instance
export const mediaLoadQueue = new MediaLoadQueue(3);

// React hook for using the queue
import { useState, useEffect, useCallback } from 'react';

interface UseMediaQueueOptions {
  id: string;
  priority?: 'high' | 'normal' | 'low';
  enabled?: boolean;
}

interface UseMediaQueueResult {
  canLoad: boolean;
  markComplete: () => void;
}

export function useMediaQueue({ 
  id, 
  priority = 'normal',
  enabled = true 
}: UseMediaQueueOptions): UseMediaQueueResult {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    if (!enabled || !id) {
      setCanLoad(false);
      return;
    }

    const immediate = mediaLoadQueue.request(id, priority, () => {
      setCanLoad(true);
    });

    if (immediate) {
      setCanLoad(true);
    }

    return () => {
      // Don't complete on unmount - let actual load/error do that
    };
  }, [id, priority, enabled]);

  const markComplete = useCallback(() => {
    if (id) {
      mediaLoadQueue.complete(id);
    }
  }, [id]);

  return { canLoad, markComplete };
}
