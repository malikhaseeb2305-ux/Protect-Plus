import { EventEmitter } from 'events';

export interface AlertEvent {
  id: string;
  message: string;
  triggeredAt: string;
  locationId: string;
  ruleId: string;
}

/**
 * Per-user in-memory pub/sub for real-time alert delivery via SSE.
 * Listeners are keyed by userId so each SSE connection only receives
 * alerts belonging to its authenticated user.
 */
class AlertEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  subscribe(userId: string, listener: (event: AlertEvent) => void): () => void {
    const channel = `alert:${userId}`;
    this.emitter.on(channel, listener);

    return () => {
      this.emitter.off(channel, listener);
    };
  }

  publish(userId: string, event: AlertEvent): void {
    this.emitter.emit(`alert:${userId}`, event);
  }

  listenerCount(userId: string): number {
    return this.emitter.listenerCount(`alert:${userId}`);
  }
}

export const alertEventBus = new AlertEventBus();
