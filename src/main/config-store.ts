/**
 * Cognition WP — Configuration Store
 * Persistent settings management with VS Code-style dotted keys.
 */

// electron-store v10 has type resolution issues with conf module
// Using untyped import workaround
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Store = require('electron-store');
import { DEFAULT_CONFIG } from '../shared/constants';

export class ConfigStore {
  private store: any;

  constructor() {
    this.store = new Store({
      name: 'cognition-wp-config',
      defaults: DEFAULT_CONFIG,
      clearInvalidConfig: true,
    });
  }

  get<T = unknown>(key: string): T {
    return this.store.get(key) as T;
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  getAll(): Record<string, unknown> {
    return this.store.store;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  reset(key: string): void {
    if (key in DEFAULT_CONFIG) {
      this.store.set(key, DEFAULT_CONFIG[key]);
    }
  }

  resetAll(): void {
    this.store.store = DEFAULT_CONFIG as Record<string, unknown>;
  }

  watch(key: string, callback: (newValue: unknown, oldValue: unknown) => void): void {
    this.store.onDidChange(key, callback);
  }
}
