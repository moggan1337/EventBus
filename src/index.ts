type Handler = (...args: any[]) => void;
export class EventBus {
  private handlers = new Map<string, Handler[]>();
  on(event: string, fn: Handler) { if (!this.handlers.has(event)) this.handlers.set(event, []); this.handlers.get(event)!.push(fn); }
  emit(event: string, ...args: any[]) { this.handlers.get(event)?.forEach(h => h(...args)); }
  off(event: string, fn: Handler) { this.handlers.get(event)?.filter(h => h !== fn); }
}
export default EventBus;
