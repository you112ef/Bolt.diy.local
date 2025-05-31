// app/utils/network.ts
export function isNetworkAvailable(): boolean {
  // This is a placeholder.
  // In a browser environment, you can use:
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  // Default to true in non-browser environments or if navigator.onLine is not supported
  return true;
}

// You can add other network-related utility functions here
