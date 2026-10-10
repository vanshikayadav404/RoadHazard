# RoadHazard Reporter 🚧⚠️

An interactive, lightweight web app designed for reporting and tracking real-time road conditions—such as potholes, waterlogging, accidents, broken traffic signals, and road obstructions—on an interactive dark-themed map.

Built with pure **HTML5, CSS3, and vanilla JavaScript** with zero dependencies, build steps, or frameworks.

---

## 🚀 Key Features

* **Interactive OpenStreetMap with Leaflet.js:**
  * Clean dark-mode map powered by OpenStreetMap tiles over HTTPS with proper attribution and security policies.
* **Click-to-Report Road Hazards:**
  * Click anywhere on roads or intersections to capture exact geographic coordinates.
  * Modal form with type selection, severity rating, and description.
* **Form Validation:**
  * Prevents empty submissions and highlights missing fields with clear, friendly error alerts.
* **Distinct Icons & Colors for Every Hazard Type:**
  * 🕳️ **Pothole / Road Damage** (`#f59e0b` — Amber)
  * 🌊 **Waterlogging / Flooding** (`#06b6d4` — Cyan)
  * 💥 **Accident / Crash Site** (`#ef4444` — Red)
  * 🚦 **Broken Traffic Signal** (`#eab308` — Yellow)
  * 🚧 **Road Debris / Obstruction** (`#854d0e` — Brown)
  * ⚠️ **Other Danger** (`#f97316` — Orange)
* **Custom Map Pins & Detailed Popups:**
  * Markers use pure CSS teardrop pins and emoji icons (guaranteed to render offline without broken asset links).
  * Click any marker to view report details, severity badge, report timestamp, and action buttons.
* **Resolve & Delete Actions:**
  * Each pin features **"✓ Resolve"** and **"🗑️ Delete"** buttons that immediately remove markers and persist changes.
* **Dynamic Active Hazards Counter & Empty State:**
  * Header counter updates dynamically in real time.
  * Shows a friendly empty-state banner (*"🎉 All roads are clear!"*) when zero hazards are active.
* **On-Map Hazard Legend:**
  * Floating legend on the bottom-left explaining all hazard icons and colors (collapsible on mobile).
* **"Use My Location" Geolocation:**
  * Floating button pans to the user's device GPS location with a pulsing radar pin and provides friendly guidance if GPS permissions are denied.
* **Automatic View Framing:**
  * Automatically calculates boundaries and zooms to fit all active hazards with padding (`maxZoom: 15`). If no hazards exist, defaults to a nationwide India overview.
* **Mobile-Responsive Design:**
  * Optimized for screens from 320px phone displays to desktop monitors without horizontal scrolling or overlapping controls.

---

## 🛠️ Tech Stack

* **Markup:** Semantic HTML5 (standard `<script>` tags, no ES modules so it runs directly from `file://`)
* **Styling:** CSS3 (Custom properties/variables, Flexbox, CSS Grid, media queries, dark theme palette)
* **Scripting:** Vanilla JavaScript (ES5/ES6, DOM manipulation, Geolocation API, Web Storage API)
* **Mapping Library:** [Leaflet.js](https://leafletjs.com/) v1.9.4 loaded via official unpkg CDN
* **Tile Provider:** [OpenStreetMap](https://www.openstreetmap.org/) over HTTPS (`referrerPolicy: 'strict-origin-when-cross-origin'`)

---

## 💻 How to Run Locally

Because this project uses vanilla JavaScript and standard script tags, **no installation, Node.js, or build step is required**:

### Option 1: Double-Click (Zero Setup)
1. Navigate to the project folder:
   `c:\Users\Admin\OneDrive\Downloads\RoadHazard`
2. **Double-click `index.html`** (or right-click `index.html` &rarr; **Open with** &rarr; Chrome, Edge, Firefox, Brave, or Safari).

### Option 2: Local HTTP Server (Optional)
If you prefer running through a local web server:
* **Python 3:**
  ```bash
  python -m http.server 8000
  ```
  Open `http://localhost:8000` in your browser.
* **Node.js (npx serve):**
  ```bash
  npx serve .
  ```
* **VS Code Live Server:**
  Right-click `index.html` &rarr; **Open with Live Server**.

---

## 💾 How Local Storage is Used

All hazard data is persisted using the browser's native `window.localStorage`:

* **Storage Key:** `roadhazard_reports_v1`
* **Format:** JSON serialized array of hazard objects:
  ```json
  [
    {
      "id": "hazard-1791641371887",
      "lat": 12.9352,
      "lng": 77.6245,
      "type": "pothole",
      "severity": "high",
      "description": "Deep potholes near Koramangala junction.",
      "reportedAt": "Today, 09:30 AM"
    }
  ]
  ```
* **Initialization Rule:** Sample starter hazards load **only** on the very first visit when `localStorage.getItem("roadhazard_reports_v1") === null`.
* **Persistence Guarantee:** Once saved or cleared, the user's data is never overwritten by starter samples, even if all hazards are resolved (`[]`).
* **Resetting Data:** To reset the application to fresh starter samples, open DevTools (`F12`) and run:
  ```javascript
  localStorage.clear();
  location.reload();
  ```

---

## ⚠️ Important Prototype Disclosures & Limitations

1. **Local-Only Storage (No Multi-User Sync):**
   * Reported hazards are stored **strictly inside your own browser's local storage**.
   * Hazards are **not shared** between different people, devices, or browsers. There is no backend server or cloud database.
2. **Map Viewport Position Not Persisted:**
   * By design, the map does not remember custom manual pans and zooms across page reloads. Instead, whenever the page loads, it automatically frames all current hazard pins (or defaults to the India overview if zero hazards exist).
3. **Prototype Status:**
   * This application is a client-side pair-programming prototype designed for demonstrations and education. It does not include user authentication, spam moderation, backend verification, or image uploads.

---

## 🌐 Deployment Steps

To publish this web application live on the internet for free:

### Deploy to GitHub Pages:
1. Create a new GitHub repository (e.g. `roadhazard-reporter`).
2. Push `index.html`, `style.css`, `script.js`, and `README.md` to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of RoadHazard Reporter"
   git remote add origin https://github.com/<your-username>/roadhazard-reporter.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub, go to **Settings** &rarr; **Pages**.
4. Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
5. Your app will be live at `https://<your-username>.github.io/roadhazard-reporter/`.

### Deploy to Netlify / Vercel / Cloudflare Pages:
* Simply drag and drop the `RoadHazard` folder onto [Netlify Drop](https://app.netlify.com/drop).
* No build command or publish directory configuration is required.
