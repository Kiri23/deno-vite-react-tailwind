// Test setup file for Vitest
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup deterministic testing environment
beforeEach(() => {
  // Fix timezone for consistent date testing
  process.env.TZ = "America/New_York";

  // Mock Date.now() for temporal consistency
  const mockDate = new Date("2025-01-15T10:00:00.000Z");
  vi.setSystemTime(mockDate);
});

// Global test utilities
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for chart components
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock FileReader for testing
global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;

  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;
  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;
  onloadstart:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
    | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;
  onprogress:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
    | null = null;

  readAsText(file: Blob, encoding?: string) {
    setTimeout(async () => {
      try {
        // Use the Response API to read the blob content
        const text = await file.text();
        this.result = text;
        this.readyState = 2; // DONE
        if (this.onload) {
          this.onload({ target: this } as any);
        }
      } catch (error) {
        this.error = error as DOMException;
        if (this.onerror) {
          this.onerror({ target: this } as any);
        }
      }
    }, 0);
  }

  readAsArrayBuffer(file: Blob) {
    // Not implemented for our tests
  }

  readAsDataURL(file: Blob) {
    // Not implemented for our tests
  }

  readAsBinaryString(file: Blob) {
    // Not implemented for our tests
  }

  abort() {
    // Not implemented for our tests
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }

  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;

  readonly EMPTY = 0;
  readonly LOADING = 1;
  readonly DONE = 2;
} as any;
