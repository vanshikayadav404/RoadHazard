/**
 * RoadHazard Reporter - Main Application Logic
 * Simple Vanilla JavaScript (No frameworks, No build steps, No ES modules)
 */

// =========================================================================
// 1. GLOBAL STATE & CONFIGURATION
// =========================================================================

// Storage key for keeping hazards saved in the user's browser
var STORAGE_KEY = "roadhazard_reports_v1";

// Holds the Leaflet Map instance
var map = null;

// Holds the user's current location marker (if found)
var userLocationMarker = null;

// Temporary coordinates when a user clicks on the map to report a hazard
var pendingLocation = null;

// Array of all active hazard objects
var hazards = [];

// Dictionary mapping marker IDs to actual Leaflet marker objects
var mapMarkers = {};

// Hazard type metadata (icons and readable labels)
var HAZARD_TYPES = {
  pothole: { label: "Pothole / Road Damage", icon: "🕳️", className: "pin-pothole" },
  waterlogging: { label: "Waterlogging / Flooding", icon: "🌊", className: "pin-waterlogging" },
  accident: { label: "Accident / Crash Site", icon: "💥", className: "pin-accident" },
  broken_signal: { label: "Broken Traffic Signal", icon: "🚦", className: "pin-broken_signal" },
  debris: { label: "Road Debris / Obstruction", icon: "🚧", className: "pin-debris" },
  other: { label: "Other Hazard", icon: "⚠️", className: "pin-other" }
};

// Initial starter hazards across India so the map is never empty on first load
var STARTER_HAZARDS = [
  {
    id: "starter-1",
    lat: 12.9352,
    lng: 77.6245,
    type: "pothole",
    severity: "high",
    description: "Deep potholes near Koramangala 80 Feet Road junction. Heavy traffic slowdown.",
    reportedAt: "Today, 09:30 AM"
  },
  {
    id: "starter-2",
    lat: 19.0176,
    lng: 72.8561,
    type: "waterlogging",
    severity: "medium",
    description: "Waterlogging under Hindmata Flyover after recent downpour. Bikes advised to take detour.",
    reportedAt: "Today, 11:15 AM"
  },
  {
    id: "starter-3",
    lat: 28.6315,
    lng: 77.2167,
    type: "broken_signal",
    severity: "medium",
    description: "Traffic signal blinking amber at Connaught Place outer circle. Traffic police managing manually.",
    reportedAt: "Yesterday, 05:45 PM"
  },
  {
    id: "starter-4",
    lat: 18.7515,
    lng: 73.4087,
    type: "accident",
    severity: "high",
    description: "Broken down truck blocking right lane on Mumbai-Pune Expressway ghat section.",
    reportedAt: "Today, 02:20 PM"
  }
];

// =========================================================================
// 2. DOM ELEMENTS
// =========================================================================
var locateBtn = document.getElementById("locateBtn");
var reportModal = document.getElementById("reportModal");
var modalCloseBtn = document.getElementById("modalCloseBtn");
var modalCancelBtn = document.getElementById("modalCancelBtn");
var hazardForm = document.getElementById("hazardForm");
var hazardTypeSelect = document.getElementById("hazardType");
var hazardSeveritySelect = document.getElementById("hazardSeverity");
var hazardDescInput = document.getElementById("hazardDescription");
var coordsDisplay = document.getElementById("coordsDisplay");
var counterNumber = document.getElementById("counterNumber");
var notificationToast = document.getElementById("notificationToast");
var toastMessage = document.getElementById("toastMessage");
var toastIcon = document.getElementById("toastIcon");
var toastCloseBtn = document.getElementById("toastCloseBtn");
var toastTimeoutId = null;

// =========================================================================
// 3. MAP INITIALIZATION (Centered on India)
// =========================================================================
function initMap() {
  // Center coordinates for India [Latitude, Longitude], Zoom level 5
  var indiaCenter = [20.5937, 78.9629];
  var initialZoom = 5;

  // Create the Leaflet map inside the #map div
  map = L.map("map", {
    zoomControl: true
  }).setView(indiaCenter, initialZoom);

  // Add standard OpenStreetMap tiles over HTTPS
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    referrerPolicy: 'strict-origin-when-cross-origin'
  }).addTo(map);

  // Listen for clicks on the map to trigger hazard reporting
  map.on("click", onMapClick);

  // Load saved hazards or starter data
  loadHazards();
}

// =========================================================================
// 4. CUSTOM MARKER CREATION (Uses CSS DivIcon for 100% offline & local file reliability)
// =========================================================================
function createHazardIcon(type) {
  var meta = HAZARD_TYPES[type] || HAZARD_TYPES.other;
  return L.divIcon({
    className: "custom-div-icon",
    html: '<div class="hazard-marker-pin ' + meta.className + '">' +
            '<span>' + meta.icon + '</span>' +
          '</div>',
    iconSize: [38, 38],
    iconAnchor: [19, 38],   // Point of the teardrop pin aligns with coordinate
    popupAnchor: [0, -36]   // Popup opens right above the pin tip
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "custom-div-icon",
    html: '<div class="user-location-pin">' +
            '<div class="user-location-pulse"></div>' +
          '</div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12]
  });
}

// =========================================================================
// 5. RENDERING HAZARDS ON THE MAP
// =========================================================================
function renderHazardMarker(hazard) {
  var icon = createHazardIcon(hazard.type);
  var marker = L.marker([hazard.lat, hazard.lng], { icon: icon }).addTo(map);

  var typeMeta = HAZARD_TYPES[hazard.type] || HAZARD_TYPES.other;
  var severityClass = "badge-" + (hazard.severity || "medium");
  var severityText = (hazard.severity || "medium").toUpperCase();

  // HTML content inside the marker popup
  var popupContent = 
    '<div class="hazard-popup">' +
      '<div class="popup-header">' +
        '<span style="font-size: 1.2rem;">' + typeMeta.icon + '</span>' +
        '<div class="popup-title">' + typeMeta.label + '</div>' +
      '</div>' +
      '<div style="margin-bottom: 8px;">' +
        '<span class="popup-badge ' + severityClass + '">' + severityText + ' SEVERITY</span>' +
      '</div>' +
      '<p class="popup-desc">' + (escapeHtml(hazard.description) || "No additional details provided.") + '</p>' +
      '<div class="popup-meta">Reported: ' + (hazard.reportedAt || "Just now") + '</div>' +
      '<button class="btn-resolve" onclick="resolveHazard(\'' + hazard.id + '\')">' +
        '✓ Mark as Cleared / Resolved' +
      '</button>' +
    '</div>';

  marker.bindPopup(popupContent);
  mapMarkers[hazard.id] = marker;
}

function updateCounter() {
  if (counterNumber) {
    counterNumber.textContent = hazards.length;
  }
}

// =========================================================================
// 6. STORAGE (LocalStorage with fallback)
// =========================================================================
function loadHazards() {
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn("LocalStorage access error:", e);
  }

  if (saved) {
    try {
      hazards = JSON.parse(saved);
    } catch (e) {
      hazards = STARTER_HAZARDS.slice();
    }
  } else {
    // First time opening: populate starter hazards
    hazards = STARTER_HAZARDS.slice();
    saveHazards();
  }

  // Clear existing markers if any
  for (var id in mapMarkers) {
    if (mapMarkers.hasOwnProperty(id)) {
      map.removeLayer(mapMarkers[id]);
    }
  }
  mapMarkers = {};

  // Add markers to map
  hazards.forEach(function (hazard) {
    renderHazardMarker(hazard);
  });

  updateCounter();
}

function saveHazards() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hazards));
  } catch (e) {
    console.warn("Could not save to LocalStorage:", e);
  }
  updateCounter();
}

// Function called by "Mark as Cleared" button in marker popup
window.resolveHazard = function (hazardId) {
  // Remove marker from map
  if (mapMarkers[hazardId]) {
    map.removeLayer(mapMarkers[hazardId]);
    delete mapMarkers[hazardId];
  }

  // Remove from hazards array
  hazards = hazards.filter(function (h) {
    return h.id !== hazardId;
  });

  saveHazards();
  showToast("Hazard marked as resolved and removed from map.", "success");
};

// =========================================================================
// 7. USER GEOLOCATION ("Use My Location")
// =========================================================================
function handleLocateUser() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your current browser.", "error");
    return;
  }

  // Visual loading state
  locateBtn.classList.add("loading");
  var originalHtml = locateBtn.innerHTML;
  locateBtn.innerHTML = '<span class="locate-icon">⏳</span><span>Locating...</span>';

  var options = {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(
    function (position) {
      locateBtn.classList.remove("loading");
      locateBtn.innerHTML = originalHtml;

      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var userLatLng = [lat, lng];

      // Smoothly fly map to user's location
      map.flyTo(userLatLng, 15, {
        animate: true,
        duration: 1.5
      });

      // Update or create user location marker
      if (!userLocationMarker) {
        userLocationMarker = L.marker(userLatLng, {
          icon: createUserLocationIcon()
        }).addTo(map);

        userLocationMarker.bindPopup(
          '<div style="text-align: center; padding: 4px;">' +
            '<strong>📍 You Are Here</strong>' +
            '<p style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">Click nearby on the map if you see any hazards.</p>' +
          '</div>'
        );
      } else {
        userLocationMarker.setLatLng(userLatLng);
      }

      userLocationMarker.openPopup();
      showToast("Centered map on your current location!", "success");
    },
    function (error) {
      locateBtn.classList.remove("loading");
      locateBtn.innerHTML = originalHtml;

      var message = "Unable to retrieve your location.";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Location access was denied. Please allow location permissions in your browser.";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "Location information is currently unavailable. Please check your GPS/network.";
          break;
        case error.TIMEOUT:
          message = "Location request timed out. Please try clicking the button again.";
          break;
        default:
          message = "Location error: " + (error.message || "Unknown issue occurred.");
          break;
      }

      showToast(message, "warning");
    },
    options
  );
}

// =========================================================================
// 8. REPORT HAZARD MODAL & FORM LOGIC
// =========================================================================
function onMapClick(e) {
  pendingLocation = e.latlng;

  // Update coordinate label inside modal
  var formattedCoords = pendingLocation.lat.toFixed(4) + ", " + pendingLocation.lng.toFixed(4);
  coordsDisplay.textContent = formattedCoords;

  // Open modal
  openModal();
}

function openModal() {
  hazardForm.reset();
  reportModal.classList.remove("hidden");
  hazardTypeSelect.focus();
}

function closeModal() {
  reportModal.classList.add("hidden");
  pendingLocation = null;
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (!pendingLocation) {
    showToast("Please click a location on the map first.", "warning");
    closeModal();
    return;
  }

  // Create new hazard report object
  var newHazard = {
    id: "hazard-" + Date.now(),
    lat: pendingLocation.lat,
    lng: pendingLocation.lng,
    type: hazardTypeSelect.value,
    severity: hazardSeveritySelect.value,
    description: hazardDescInput.value.trim(),
    reportedAt: formatCurrentTime()
  };

  // Add to state and save
  hazards.push(newHazard);
  saveHazards();

  // Render on map
  renderHazardMarker(newHazard);

  // Pan to new marker and open its popup
  if (mapMarkers[newHazard.id]) {
    map.panTo([newHazard.lat, newHazard.lng]);
    mapMarkers[newHazard.id].openPopup();
  }

  closeModal();
  showToast("Hazard reported successfully! Thank you for helping others.", "success");
}

// =========================================================================
// 9. FRIENDLY NOTIFICATION TOAST
// =========================================================================
function showToast(message, type) {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastMessage.textContent = message;

  // Adjust style based on message type
  notificationToast.classList.remove("toast-success", "toast-warning", "toast-error");
  if (type === "success") {
    toastIcon.textContent = "✅";
    notificationToast.classList.add("toast-success");
  } else if (type === "error") {
    toastIcon.textContent = "❌";
    notificationToast.classList.add("toast-error");
  } else {
    toastIcon.textContent = "⚠️";
    notificationToast.classList.add("toast-warning");
  }

  notificationToast.classList.remove("hidden");

  // Auto hide after 4.5 seconds
  toastTimeoutId = setTimeout(function () {
    notificationToast.classList.add("hidden");
  }, 4500);
}

// =========================================================================
// 10. UTILITIES
// =========================================================================
function formatCurrentTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return "Today, " + hours + ":" + minutes + " " + ampm;
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================================================================
// 11. EVENT LISTENERS
// =========================================================================
locateBtn.addEventListener("click", handleLocateUser);
modalCloseBtn.addEventListener("click", closeModal);
modalCancelBtn.addEventListener("click", closeModal);
hazardForm.addEventListener("submit", handleFormSubmit);

toastCloseBtn.addEventListener("click", function () {
  notificationToast.classList.add("hidden");
});

// Close modal when clicking outside of the card
reportModal.addEventListener("click", function (e) {
  if (e.target === reportModal) {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !reportModal.classList.contains("hidden")) {
    closeModal();
  }
});

// =========================================================================
// 12. RUN ON PAGE LOAD
// =========================================================================
window.addEventListener("DOMContentLoaded", function () {
  initMap();
});
