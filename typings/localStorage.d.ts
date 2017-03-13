interface Storage {
  clear(): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, data: string): void;
}

declare var localStorage: Storage;
