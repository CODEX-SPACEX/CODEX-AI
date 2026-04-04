
## [2.0.0] - 2026-03-26
### 🪐 System Architecture
- **Local Asset Engine:** Moved from external URLs to a dedicated `/Public/images/` directory for `menu.jpg` and `loading.jpg`.
- **Command Loader V2:** Implemented dynamic command discovery and categorization via `Handlers/CommandLoader.js`.
- **Database Integration:** Initialized `LocalDb.json` for persistent storage of group settings and user data.

### ✨ Features & UI
- **Premium Menu:** Created a high-end interface using the `▸ ❍` design and box-drawing characters.
- **Smart Reactions:** Integrated a "React-Process-Unreact" flow:
  - 💬 : Triggered on command start.
  - "" : Automatically removed upon task completion to keep the chat clean.
- **Live Stats:** Added real-time monitoring for:
  - **RAM/Storage:** Active memory usage calculation.
  - **Uptime:** Accurate session tracking.
  - **CMDs:** Automatic total command count.

### 🔧 Optimization
- **Error Shield:** Added `try-catch` blocks to reactions, ensuring the "Loading" emoji never gets stuck if a command fails.
- **Buffer Handling:** Implemented `fs.readFileSync` for instant local image rendering.





