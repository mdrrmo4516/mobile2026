# MDRRMO Pio Duran - API Documentation

Base URL: `http://localhost:8001/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Status Check](#status-check)
3. [Hotlines](#hotlines)
4. [Incident Reports](#incident-reports)
5. [Typhoon Dashboard](#typhoon-dashboard)
6. [Map Locations](#map-locations)
7. [Go Bag Checklist](#go-bag-checklist)
8. [Support Resources](#support-resources)

---

## Authentication

Currently no authentication required. Future versions will implement JWT-based authentication.

---

## Status Check

### Create Status Check
**POST** `/api/status`

Create a system status check entry.

**Request Body:**
```json
{
  "client_name": "web_app"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "client_name": "web_app",
  "timestamp": "2024-08-15T14:30:00.000Z"
}
```

### Get Status Checks
**GET** `/api/status`

Retrieve all status check entries.

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "client_name": "web_app",
    "timestamp": "2024-08-15T14:30:00.000Z"
  }
]
```

---

## Hotlines

### Get All Hotlines
**GET** `/api/hotlines`

Retrieve all emergency hotline numbers.

**Query Parameters:**
- `category` (optional): Filter by category
  - Values: `emergency`, `local`, `police`, `fire`, `medical`, `weather`

**Example:**
```bash
GET /api/hotlines
GET /api/hotlines?category=emergency
```

**Response:** `200 OK`
```json
{
  "hotlines": [
    {
      "id": "hotline-001",
      "label": "National Emergency (911)",
      "number": "911",
      "category": "emergency",
      "description": "For all emergency situations nationwide",
      "availability": "24/7",
      "order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "hotline-002",
      "label": "MDRRMO Pio Duran",
      "number": "+63 52 480 0001",
      "category": "local",
      "description": "Municipal Disaster Risk Reduction Management Office",
      "availability": "24/7",
      "order": 2,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Categories:**
- `emergency` - National emergency services
- `local` - Local municipality services
- `police` - Law enforcement
- `fire` - Fire protection services
- `medical` - Medical/health services
- `weather` - Weather monitoring agencies

---

## Incident Reports

### Submit Incident Report
**POST** `/api/incidents`

Submit a new incident report from citizens.

**Request Body:**
```json
{
  "incident_type": "flood",
  "date": "2024-08-15",
  "time": "14:30",
  "latitude": 13.0547,
  "longitude": 123.5214,
  "description": "Street flooding near market area, knee-deep water"
}
```

**Incident Types:**
- `flood` - Flooding
- `fire` - Fire emergency
- `landslide` - Landslide/soil erosion
- `road_block` - Road blocked or damaged
- `medical` - Medical emergency
- `earthquake` - Earthquake damage
- `other` - Other incidents

**Response:** `200 OK`
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "incident_type": "flood",
  "date": "2024-08-15",
  "time": "14:30",
  "latitude": 13.0547,
  "longitude": 123.5214,
  "description": "Street flooding near market area, knee-deep water",
  "status": "pending",
  "created_at": "2024-08-15T14:35:22.123Z"
}
```

### Get All Incidents
**GET** `/api/incidents`

Retrieve all incident reports.

**Response:** `200 OK`
```json
{
  "incidents": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "incident_type": "flood",
      "date": "2024-08-15",
      "time": "14:30",
      "latitude": 13.0547,
      "longitude": 123.5214,
      "description": "Street flooding near market area",
      "status": "pending",
      "created_at": "2024-08-15T14:35:22.123Z"
    }
  ]
}
```

**Status Values:**
- `pending` - Newly reported, awaiting acknowledgment
- `acknowledged` - Report received and verified
- `responding` - Response team dispatched
- `resolved` - Incident resolved
- `closed` - Case closed

---

## Typhoon Dashboard

### Get Current Typhoon Data
**GET** `/api/typhoon/current`

Retrieve current typhoon monitoring information.

**Response:** `200 OK`
```json
{
  "name": "Typhoon CARINA",
  "localName": "Gaemi",
  "position": "15.2°N, 120.5°E",
  "maxWindSpeed": "185 km/h",
  "movement": "West at 15 km/h",
  "intensity": "Severe Tropical Storm",
  "pressure": "960 hPa",
  "lastUpdate": "Aug 15, 2024, 02:30 PM",
  "satelliteImageUrl": "https://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif",
  "forecast": [
    {
      "time": "24h",
      "position": "16.0°N, 119.0°E",
      "intensity": "Typhoon"
    },
    {
      "time": "48h",
      "position": "17.5°N, 117.5°E",
      "intensity": "Typhoon"
    },
    {
      "time": "72h",
      "position": "19.0°N, 116.0°E",
      "intensity": "Severe Tropical Storm"
    }
  ],
  "warnings": [
    "Signal No. 2 raised over Albay",
    "Heavy rainfall expected in Bicol Region",
    "Storm surge warning for coastal areas"
  ]
}
```

**Note:** Currently returns mock data. In production, this would integrate with PAGASA API.

---

## Map Locations

### Get Facility Locations
**GET** `/api/map/locations`

Retrieve all facility locations for the interactive map.

**Query Parameters:**
- `location_type` (optional): Filter by facility type
  - Values: `evacuation`, `hospital`, `police`, `fire`, `government`

**Example:**
```bash
GET /api/map/locations
GET /api/map/locations?location_type=evacuation
```

**Response:** `200 OK`
```json
{
  "locations": [
    {
      "id": 1,
      "type": "evacuation",
      "name": "Pio Duran Central School",
      "address": "Poblacion, Pio Duran",
      "lat": 13.0547,
      "lng": 123.5214,
      "capacity": "500 persons",
      "amenities": ["restroom", "water supply", "covered area"],
      "operating_hours": "During emergencies only",
      "status": "operational",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 5,
      "type": "hospital",
      "name": "Pio Duran Medicare Hospital",
      "address": "Poblacion, Pio Duran",
      "lat": 13.0534,
      "lng": 123.5198,
      "services": "24/7 Emergency, Surgery, Laboratory",
      "hotline": "+63 52 480 0100",
      "operating_hours": "24/7",
      "status": "operational",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Location Types:**
- `evacuation` - Evacuation centers
- `hospital` - Medical facilities
- `police` - Police stations
- `fire` - Fire stations
- `government` - Government offices

**Status Values:**
- `operational` - Fully operational
- `full` - At capacity (evacuation centers)
- `closed` - Temporarily closed

---

## Go Bag Checklist

### Get Checklist Items
**GET** `/api/checklist`

Retrieve Go Bag checklist items for emergency preparedness.

**Query Parameters:**
- `category` (optional): Filter by category
  - Values: `Documents`, `Water & Food`, `First Aid`, `Tools & Safety`, `Clothing`, `Communication`, `Hygiene`
- `essential_only` (optional): If `true`, return only essential items

**Example:**
```bash
GET /api/checklist
GET /api/checklist?category=Documents
GET /api/checklist?essential_only=true
```

**Response:** `200 OK`
```json
{
  "checklist": [
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
    },
    {
      "id": 5,
      "category": "Water & Food",
      "item": "Drinking water (3 liters/person)",
      "essential": true,
      "quantity_suggestion": "3 liters per person",
      "order": 5,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Categories:**
- `Documents` - Important documents and records
- `Water & Food` - Food and water supplies
- `First Aid` - Medical supplies and medications
- `Tools & Safety` - Safety equipment and tools
- `Clothing` - Clothing and protective gear
- `Communication` - Communication devices and power
- `Hygiene` - Personal hygiene items

---

## Support Resources

### Get Support Resources
**GET** `/api/resources`

Retrieve support resources, agencies, and helpful information.

**Query Parameters:**
- `resource_type` (optional): Filter by resource type
  - Values: `government_agency`, `emergency_assistance`, `local_resource`

**Example:**
```bash
GET /api/resources
GET /api/resources?resource_type=government_agency
```

**Response:** `200 OK`
```json
{
  "government_agencies": [
    {
      "id": "resource-001",
      "type": "government_agency",
      "name": "NDRRMC",
      "description": "National Disaster Risk Reduction and Management Council",
      "link": "https://ndrrmc.gov.ph",
      "phone": "+63 2 8911 5061",
      "services": ["disaster coordination", "emergency response", "policy development"],
      "order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "emergency_assistance": [
    {
      "id": "resource-005",
      "type": "emergency_assistance",
      "name": "Philippine Red Cross",
      "description": "Humanitarian aid and disaster relief organization",
      "link": "https://redcross.org.ph",
      "phone": "143",
      "services": ["disaster relief", "blood services", "first aid training"],
      "order": 5,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "local_resources": [
    {
      "id": "resource-008",
      "type": "local_resource",
      "name": "MDRRMO Pio Duran",
      "description": "Municipal Disaster Risk Reduction and Management Office",
      "address": "Municipal Hall, Poblacion, Pio Duran, Albay",
      "phone": "+63 52 480 0001",
      "services": ["local disaster response", "evacuation coordination", "community preparedness"],
      "order": 8,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Future versions will implement rate limiting for public endpoints.

---

## CORS

CORS is enabled for all origins in development. Production will restrict to specific domains.

---

## Testing Endpoints

You can test the API using curl:

```bash
# Get all hotlines
curl http://localhost:8001/api/hotlines

# Get medical hotlines only
curl http://localhost:8001/api/hotlines?category=medical

# Submit incident report
curl -X POST http://localhost:8001/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "flood",
    "date": "2024-08-15",
    "time": "14:30",
    "latitude": 13.0547,
    "longitude": 123.5214,
    "description": "Street flooding near market"
  }'

# Get evacuation centers only
curl http://localhost:8001/api/map/locations?location_type=evacuation

# Get essential checklist items only
curl http://localhost:8001/api/checklist?essential_only=true
```

---

## Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

---

**Version**: 1.0  
**Last Updated**: August 2025
