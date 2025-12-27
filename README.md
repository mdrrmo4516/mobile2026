# MDRRMO Pio Duran - Emergency Preparedness App

A comprehensive disaster preparedness and emergency response application for Pio Duran, Albay, Philippines.

## 🚀 Live Features

### 7 Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| **24/7 Hotline Numbers** | Prominent banner with 10 emergency contacts | ✅ Complete |
| **Report an Incident** | Incident form with map location picker | ✅ Complete |
| **Typhoon Dashboard** | Live satellite imagery + tracking data | ✅ Complete |
| **Interactive Map** | Leaflet map with 12 facilities | ✅ Complete |
| **Go Bag Checklist** | 27 items with progress tracking | ✅ Complete |
| **Support Resources** | Government agencies & emergency info | ✅ Complete |
| **Emergency Plan** | Family safety planning tool | ✅ Complete |

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS, Leaflet/OpenStreetMap
- **Backend**: FastAPI, Python 3
- **Database**: MongoDB
- **Color Scheme**: Blue-950, Yellow-500, White

## 📁 Project Structure

```
/app
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── HotlineNumbers.jsx
│       │   ├── ReportIncident.jsx
│       │   ├── TyphoonDashboard.jsx
│       │   ├── InteractiveMap.jsx
│       │   ├── GoBagChecklist.jsx
│       │   ├── SupportResources.jsx
│       │   └── EmergencyPlan.jsx
│       └── components/
│           └── Header.jsx
├── backend/
│   └── server.py
└── README.md
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hotlines` | GET | Emergency contact numbers |
| `/api/incidents` | POST | Submit incident report |
| `/api/incidents` | GET | Get all incidents |
| `/api/typhoon/current` | GET | Current typhoon data |
| `/api/map/locations` | GET | Facility locations |
| `/api/checklist` | GET | Default checklist items |
| `/api/resources` | GET | Support resources |

## 🎯 Next Tasks

### Most Priority : 
- create **BottomNavBar**: 3 tabs (Home, Dashboard, Geotag Camera) 

## Tabs on bottomnavbar:
- **Home**: time-based changing background image + main title/subtitle + 2 primary CTAs
- **Dashboard**: prominent 24/7 Hotline Numbers banner + 6 module grid (Report, Typhoon, Map, Checklist, Resources, Plan)
- **Geotag Camera**: capture photo + fetch GPS + save to device gallery + show lat/long/timestamp


### Priority 1: User Authentication
- [ ] JWT-based authentication
- [ ] User registration and login
- [ ] Personal emergency plan storage
- [ ] Sync checklist progress across devices

### Priority 2: Push Notifications
- [ ] Firebase Cloud Messaging integration
- [ ] Typhoon alert notifications
- [ ] Signal warning level updates
- [ ] Evacuation order alerts

### Priority 3: Offline Support
- [ ] Service worker implementation
- [ ] Cache critical data (hotlines, checklist, map)
- [ ] Offline incident reporting queue
- [ ] Sync when back online

### Priority 4: Admin Dashboard
- [ ] View and manage incident reports
- [ ] Update hotline numbers
- [ ] Manage facility locations
- [ ] Send broadcast notifications

### Priority 5: Enhanced Features
- [ ] Photo attachment for incident reports
- [ ] GPS auto-location detection
- [ ] Historical typhoon data analytics
- [ ] Community incident validation
- [ ] SMS notification integration (Twilio)
- [ ] Multi-language support (Filipino/English)

## 🚦 Running the App

The app runs on:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8001

Services are managed by Supervisor and auto-restart on changes.

## 📱 Responsive Design

Optimized for:
- Mobile devices (primary use case)
- Tablets
- Desktop browsers

## 🔒 Data Storage

- **Checklist progress**: localStorage (per device)
- **Emergency plan**: localStorage (per device)
- **Incident reports**: MongoDB (server)

## 📞 Emergency Contacts

Quick access to:
- National Emergency: 911
- Philippine Red Cross: 143
- DOH Health Emergency: 1555
- PAGASA Weather: +63 2 8927 1541

---

**Developed for MDRRMO Pio Duran, Albay, Philippines**
