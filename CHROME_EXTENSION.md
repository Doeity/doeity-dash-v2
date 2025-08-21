# Chrome Extension Setup

## Overview

To convert this mindful dashboard into a Chrome extension that replaces your new tab page, you'll need to create a manifest file and build a static version.

## Steps to Create Chrome Extension

### 1. Create Extension Manifest

Create `manifest.json` in your project root:

```json
{
  "manifest_version": 3,
  "name": "Mindful Dashboard",
  "version": "1.0.0",
  "description": "A zen-inspired new tab replacement with productivity tools",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [
    "storage",
    "geolocation"
  ],
  "host_permissions": [
    "https://api.quotable.io/*",
    "https://api.openweathermap.org/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 2. Modify for Static Build

Since Chrome extensions can't run a server, you'll need to:

**A. Remove Backend Dependencies**
- Replace server API calls with Chrome storage API
- Use `chrome.storage.local` for data persistence
- Handle weather/quotes with client-side API calls

**B. Update Data Storage**
Replace React Query API calls with Chrome storage:

```javascript
// Instead of API calls, use:
const saveToStorage = (key, data) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({[key]: data}, resolve);
  });
};

const getFromStorage = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || []);
    });
  });
};
```

### 3. Build Process

1. **Install additional dependencies:**
   ```bash
   npm install @types/chrome
   ```

2. **Update vite.config.ts for extension build:**
   ```typescript
   export default defineConfig({
     build: {
       rollupOptions: {
         input: {
           index: 'client/index.html'
         }
       },
       outDir: 'extension-build'
     }
   });
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Copy manifest and icons:**
   ```bash
   cp manifest.json extension-build/
   mkdir extension-build/icons
   # Add your icon files to extension-build/icons/
   ```

### 4. Install Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select your `extension-build` folder
5. The extension will now replace your new tab page

### 5. Required Code Changes for Extension

**Storage Adapter (create `client/src/lib/chromeStorage.ts`):**
```typescript
export class ChromeStorage {
  async getTasks() {
    return this.getFromStorage('tasks');
  }
  
  async saveTasks(tasks: any[]) {
    return this.saveToStorage('tasks', tasks);
  }
  
  // Similar methods for habits, schedule, etc.
  
  private saveToStorage(key: string, data: any) {
    return new Promise((resolve) => {
      chrome.storage.local.set({[key]: data}, resolve);
    });
  }
  
  private getFromStorage(key: string) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || []);
      });
    });
  }
}
```

**Weather API (direct calls):**
```typescript
// Replace server weather calls with direct API calls
const getWeather = async (lat: number, lon: number) => {
  const API_KEY = 'your-openweather-api-key';
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  return response.json();
};
```

## Benefits of Extension Version

- Instant loading (no server startup)
- Offline functionality
- True new tab replacement
- Data persists across browser sessions
- No need for server hosting

## Limitations

- Requires code modifications to remove server dependency
- Weather API calls need your own API key
- Storage limited to Chrome's storage quota
- Must rebuild and reload extension for updates

Would you like me to help you implement these changes to create the Chrome extension version?