# MDRRMO Pio Duran - Database Schema Documentation

## Database: `mdrrmo_pioduran`

MongoDB database for the Emergency Preparedness Application.

---

## Collections Overview

| Collection | Purpose | Indexes |
|------------|---------|---------|
| `incidents` | Incident reports from citizens | `id`, `created_at`, `status` |
| `hotlines` | Emergency contact numbers | `id`, `category` |
| `map_locations` | Facility locations (evacuation, hospitals, etc.) | `id`, `type` |
| `checklist_items` | Go Bag checklist items | `id`, `category` |
| `resources` | Support resources and agencies | `id`, `type` |
| `emergency_plans` | User emergency plans | `id`, `user_id` |
| `status_checks` | System health monitoring | `id`, `timestamp` |
| `users` | User accounts (future auth) | `id`, `email` |
| `typhoon_data` | Historical typhoon records | `id`, `date` |
| `notifications` | Push notifications log | `id`, `created_at`, `status` |

---

## 1. Incidents Collection

**Collection Name**: `incidents`

Stores citizen-reported incidents (flooding, fire, landslide, etc.)

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  incident_type: String,          // "flood", "fire", "landslide", "road_block", "medical", "other"
  date: String,                   // Date of incident (YYYY-MM-DD)
  time: String,                   // Time of incident (HH:MM)
  latitude: Float,                // GPS latitude
  longitude: Float,               // GPS longitude
  description: String,            // Incident description
  reporter_name: String?,         // Optional: Name of reporter
  reporter_contact: String?,      // Optional: Contact number
  photo_url: String?,             // Optional: Photo evidence URL
  status: String,                 // "pending", "acknowledged", "responding", "resolved", "closed"
  priority: String?,              // "low", "medium", "high", "critical"
  assigned_to: String?,           // Optional: Responder/team assigned
  response_notes: String?,        // Optional: Notes from responders
  created_at: DateTime,           // Timestamp when reported
  updated_at: DateTime?,          // Last update timestamp
  resolved_at: DateTime?          // When marked as resolved
}
```

### Indexes:
```javascript
db.incidents.createIndex({ "id": 1 }, { unique: true })
db.incidents.createIndex({ "created_at": -1 })
db.incidents.createIndex({ "status": 1 })
db.incidents.createIndex({ "incident_type": 1 })
```

### Sample Document:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "incident_type": "flood",
  "date": "2024-08-15",
  "time": "14:30",
  "latitude": 13.0547,
  "longitude": 123.5214,
  "description": "Street flooding near market area, knee-deep water",
  "reporter_name": "Juan dela Cruz",
  "reporter_contact": "+63 917 123 4567",
  "status": "pending",
  "priority": "high",
  "created_at": "2024-08-15T14:35:22.123Z"
}
```

---

## 2. Hotlines Collection

**Collection Name**: `hotlines`

Emergency contact numbers for various services.

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  label: String,                  // Display name (e.g., "National Emergency")
  number: String,                 // Contact number
  category: String,               // "emergency", "local", "police", "fire", "medical", "weather"
  description: String?,           // Optional: Additional info
  availability: String?,          // "24/7", "Office Hours", etc.
  order: Integer?,                // Display order
  is_active: Boolean,             // Active/inactive flag
  created_at: DateTime,
  updated_at: DateTime?
}
```

### Indexes:
```javascript
db.hotlines.createIndex({ "id": 1 }, { unique: true })
db.hotlines.createIndex({ "category": 1 })
db.hotlines.createIndex({ "order": 1 })
```

### Sample Document:
```json
{
  "id": "hotline-001",
  "label": "National Emergency (911)",
  "number": "911",
  "category": "emergency",
  "description": "For all emergency situations",
  "availability": "24/7",
  "order": 1,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 3. Map Locations Collection

**Collection Name**: `map_locations`

Facility locations displayed on the interactive map.

### Schema:
```javascript
{
  id: Integer,                    // Numeric ID
  type: String,                   // "evacuation", "hospital", "police", "fire", "government"
  name: String,                   // Facility name
  address: String,                // Full address
  lat: Float,                     // Latitude
  lng: Float,                     // Longitude
  capacity: String?,              // For evacuation centers (e.g., "500 persons")
  services: String?,              // Services offered
  hotline: String?,               // Contact number
  operating_hours: String?,       // Operating schedule
  amenities: Array<String>?,      // ["restroom", "generator", "water supply"]
  status: String?,                // "operational", "full", "closed"
  notes: String?,                 // Additional information
  is_active: Boolean,             // Display on map or not
  created_at: DateTime,
  updated_at: DateTime?
}
```

### Indexes:
```javascript
db.map_locations.createIndex({ "id": 1 }, { unique: true })
db.map_locations.createIndex({ "type": 1 })
db.map_locations.createIndex({ "is_active": 1 })
```

### Sample Document:
```json
{
  "id": 1,
  "type": "evacuation",
  "name": "Pio Duran Central School",
  "address": "Poblacion, Pio Duran",
  "lat": 13.0547,
  "lng": 123.5214,
  "capacity": "500 persons",
  "amenities": ["restroom", "water supply", "covered area"],
  "hotline": "+63 52 480 0001",
  "operating_hours": "During emergencies only",
  "status": "operational",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 4. Checklist Items Collection

**Collection Name**: `checklist_items`

Default Go Bag checklist items.

### Schema:
```javascript
{
  id: Integer,                    // Numeric ID
  category: String,               // "Documents", "Water & Food", "First Aid", "Tools & Safety", "Clothing", "Communication", "Hygiene"
  item: String,                   // Item name/description
  essential: Boolean,             // Is this essential or optional?
  quantity_suggestion: String?,   // "3 liters", "3-day supply", etc.
  notes: String?,                 // Additional tips
  order: Integer?,                // Display order within category
  is_active: Boolean,             // Show in app or not
  created_at: DateTime,
  updated_at: DateTime?
}
```

### Indexes:
```javascript
db.checklist_items.createIndex({ "id": 1 }, { unique: true })
db.checklist_items.createIndex({ "category": 1 })
db.checklist_items.createIndex({ "order": 1 })
```

### Sample Document:
```json
{
  "id": 1,
  "category": "Documents",
  "item": "Valid IDs (Photocopy)",
  "essential": true,
  "quantity_suggestion": "2 copies each",
  "notes": "Keep in waterproof bag",
  "order": 1,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 5. Resources Collection

**Collection Name**: `resources`

Support resources, agencies, and helpful links.

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  type: String,                   // "government_agency", "emergency_assistance", "local_resource", "educational"
  name: String,                   // Resource name
  description: String,            // Brief description
  link: String?,                  // Website URL
  phone: String?,                 // Contact number
  email: String?,                 // Email address
  address: String?,               // Physical address
  services: Array<String>?,       // Services provided
  order: Integer?,                // Display order
  is_active: Boolean,
  created_at: DateTime,
  updated_at: DateTime?
}
```

### Indexes:
```javascript
db.resources.createIndex({ "id": 1 }, { unique: true })
db.resources.createIndex({ "type": 1 })
```

### Sample Document:
```json
{
  "id": "resource-001",
  "type": "government_agency",
  "name": "NDRRMC",
  "description": "National Disaster Risk Reduction and Management Council",
  "link": "https://ndrrmc.gov.ph",
  "phone": "+63 2 8911 5061",
  "services": ["disaster coordination", "emergency response"],
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 6. Emergency Plans Collection

**Collection Name**: `emergency_plans`

User-created family emergency plans (requires authentication).

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  user_id: String?,               // User ID (null for anonymous localStorage)
  family_members: Array<{         // Array of family members
    name: String,
    age: Integer,
    special_needs: String?
  }>,
  meeting_point_primary: String,  // Primary meeting location
  meeting_point_secondary: String?, // Backup meeting location
  evacuation_route: String?,      // Planned evacuation route
  out_of_town_contact: {          // Emergency contact outside area
    name: String,
    phone: String,
    relationship: String
  }?,
  important_items: Array<String>?, // Items to grab during evacuation
  pets: Array<{                   // Pet information
    type: String,
    name: String,
    special_needs: String?
  }>?,
  medical_info: String?,          // Important medical information
  notes: String?,                 // Additional notes
  created_at: DateTime,
  updated_at: DateTime?
}
```

### Indexes:
```javascript
db.emergency_plans.createIndex({ "id": 1 }, { unique: true })
db.emergency_plans.createIndex({ "user_id": 1 })
```

### Sample Document:
```json
{
  "id": "plan-001",
  "user_id": "user-123",
  "family_members": [
    {"name": "Maria Santos", "age": 35, "special_needs": null},
    {"name": "Pedro Santos", "age": 8, "special_needs": "Asthma medication required"}
  ],
  "meeting_point_primary": "Pio Duran Central School",
  "meeting_point_secondary": "Municipal Hall parking lot",
  "out_of_town_contact": {
    "name": "Rosa Gomez",
    "phone": "+63 917 555 1234",
    "relationship": "Sister (Manila)"
  },
  "pets": [{"type": "dog", "name": "Bantay", "special_needs": null}],
  "created_at": "2024-08-15T10:00:00.000Z"
}
```

---

## 7. Status Checks Collection

**Collection Name**: `status_checks`

System health monitoring and client status.

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  client_name: String,            // Client/service name
  status: String?,                // "online", "offline", "degraded"
  timestamp: DateTime,            // Check timestamp
  response_time: Float?,          // Response time in ms
  metadata: Object?               // Additional metadata
}
```

### Indexes:
```javascript
db.status_checks.createIndex({ "id": 1 }, { unique: true })
db.status_checks.createIndex({ "timestamp": -1 })
```

---

## 8. Users Collection (Future Feature)

**Collection Name**: `users`

User authentication and profile management.

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  email: String,                  // User email (unique)
  password_hash: String,          // Hashed password
  full_name: String,              // Full name
  phone: String?,                 // Contact number
  barangay: String?,              // Barangay/location
  role: String,                   // "citizen", "admin", "responder"
  is_verified: Boolean,           // Email verification status
  is_active: Boolean,             // Account active/suspended
  last_login: DateTime?,          // Last login timestamp
  created_at: DateTime,
  updated_at: DateTime?
}
```

### Indexes:
```javascript
db.users.createIndex({ "id": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
```

---

## 9. Typhoon Data Collection (Future Feature)

**Collection Name**: `typhoon_data`

Historical typhoon tracking data.

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  name: String,                   // International name
  local_name: String,             // PAGASA local name
  year: Integer,                  // Year of typhoon
  signal_number: Integer,         // Highest signal number
  date_start: DateTime,           // Entry to PAR date
  date_end: DateTime?,            // Exit from PAR date
  max_wind_speed: Float,          // km/h
  central_pressure: Float,        // hPa
  affected_areas: Array<String>,  // List of affected areas
  casualties: Integer?,           // Reported casualties
  damage_estimate: Float?,        // Damage in PHP
  tracking_data: Array<{          // Position history
    timestamp: DateTime,
    latitude: Float,
    longitude: Float,
    wind_speed: Float,
    movement: String
  }>,
  created_at: DateTime,
  updated_at: DateTime?
}
```

### Indexes:
```javascript
db.typhoon_data.createIndex({ "id": 1 }, { unique: true })
db.typhoon_data.createIndex({ "year": -1 })
db.typhoon_data.createIndex({ "date_start": -1 })
```

---

## 10. Notifications Collection (Future Feature)

**Collection Name**: `notifications`

Push notifications and alerts log.

### Schema:
```javascript
{
  id: String (UUID),              // Primary identifier
  type: String,                   // "typhoon_alert", "evacuation", "all_clear", "system"
  title: String,                  // Notification title
  message: String,                // Notification body
  priority: String,               // "low", "medium", "high", "critical"
  target_audience: String,        // "all", "barangay_specific", "user_specific"
  target_barangays: Array<String>?, // Specific barangays if applicable
  target_users: Array<String>?,   // Specific user IDs if applicable
  sent_count: Integer?,           // Number of devices notified
  status: String,                 // "pending", "sent", "failed"
  scheduled_at: DateTime?,        // Scheduled send time
  sent_at: DateTime?,             // Actual send time
  created_by: String,             // Admin user ID
  created_at: DateTime
}
```

### Indexes:
```javascript
db.notifications.createIndex({ "id": 1 }, { unique: true })
db.notifications.createIndex({ "created_at": -1 })
db.notifications.createIndex({ "status": 1 })
```

---

## Database Initialization

### Required Collections (MVP):
1. ✅ `incidents` - Already in use
2. ✅ `status_checks` - Already in use
3. 🔄 `hotlines` - Currently hardcoded, should be DB
4. 🔄 `map_locations` - Currently hardcoded, should be DB
5. 🔄 `checklist_items` - Currently hardcoded, should be DB
6. 🔄 `resources` - Currently hardcoded, should be DB

### Future Collections:
7. ⏳ `emergency_plans` - For authenticated users
8. ⏳ `users` - User authentication system
9. ⏳ `typhoon_data` - Historical data
10. ⏳ `notifications` - Push notifications

---

## Data Migration Script

See `/app/backend/init_database.py` for database seeding script.

---

## Environment Variables

Required in `/app/backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=mdrrmo_pioduran
```

---

## Backup Strategy

- **Daily backups**: Automated MongoDB dump at 2:00 AM
- **Retention**: Keep last 30 days
- **Critical collections**: `incidents`, `users`, `emergency_plans`

---

**Last Updated**: August 2025
**Version**: 1.0
