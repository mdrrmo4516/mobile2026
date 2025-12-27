# Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  MDRRMO Pio Duran Database Schema               │
│                    Database: mdrrmo_pioduran                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│    incidents     │      │    hotlines      │      │  map_locations   │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ id (UUID) PK     │      │ id (UUID) PK     │      │ id (Int) PK      │
│ incident_type    │      │ label            │      │ type             │
│ date             │      │ number           │      │ name             │
│ time             │      │ category         │      │ address          │
│ latitude         │      │ description      │      │ lat              │
│ longitude        │      │ availability     │      │ lng              │
│ description      │      │ order            │      │ capacity         │
│ reporter_name    │      │ is_active        │      │ services         │
│ reporter_contact │      │ created_at       │      │ hotline          │
│ photo_url        │      │ updated_at       │      │ operating_hours  │
│ status           │      └──────────────────┘      │ amenities[]      │
│ priority         │                                │ status           │
│ assigned_to      │                                │ notes            │
│ response_notes   │                                │ is_active        │
│ created_at       │                                │ created_at       │
│ updated_at       │                                │ updated_at       │
│ resolved_at      │                                └──────────────────┘
└──────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ checklist_items  │      │    resources     │      │ emergency_plans  │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ id (Int) PK      │      │ id (UUID) PK     │      │ id (UUID) PK     │
│ category         │      │ type             │      │ user_id          │
│ item             │      │ name             │      │ family_members[] │
│ essential        │      │ description      │      │ meeting_point_1  │
│ quantity_suggest │      │ link             │      │ meeting_point_2  │
│ notes            │      │ phone            │      │ evacuation_route │
│ order            │      │ email            │      │ out_of_town_cont │
│ is_active        │      │ address          │      │ important_items[]│
│ created_at       │      │ services[]       │      │ pets[]           │
│ updated_at       │      │ order            │      │ medical_info     │
└──────────────────┘      │ is_active        │      │ notes            │
                          │ created_at       │      │ created_at       │
                          │ updated_at       │      │ updated_at       │
                          └──────────────────┘      └──────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  status_checks   │      │      users       │      │  typhoon_data    │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ id (UUID) PK     │      │ id (UUID) PK     │      │ id (UUID) PK     │
│ client_name      │      │ email (unique)   │      │ name             │
│ status           │      │ password_hash    │      │ local_name       │
│ timestamp        │      │ full_name        │      │ year             │
│ response_time    │      │ phone            │      │ signal_number    │
│ metadata         │      │ barangay         │      │ date_start       │
└──────────────────┘      │ role             │      │ date_end         │
                          │ is_verified      │      │ max_wind_speed   │
                          │ is_active        │      │ central_pressure │
                          │ last_login       │      │ affected_areas[] │
                          │ created_at       │      │ casualties       │
                          │ updated_at       │      │ damage_estimate  │
                          └──────────────────┘      │ tracking_data[]  │
                                                    │ created_at       │
                                                    │ updated_at       │
┌──────────────────┐                                └──────────────────┘
│  notifications   │
├──────────────────┤      LEGEND:
│ id (UUID) PK     │      ═══════
│ type             │      PK     = Primary Key
│ title            │      UUID   = Universally Unique Identifier
│ message          │      Int    = Integer
│ priority         │      []     = Array field
│ target_audience  │      ?      = Optional field
│ target_barangays │
│ target_users[]   │      INDEXES:
│ sent_count       │      ════════
│ status           │      incidents: id, created_at, status, incident_type
│ scheduled_at     │      hotlines: id, category, order
│ sent_at          │      map_locations: id, type, is_active
│ created_by       │      checklist_items: id, category, order
│ created_at       │      resources: id, type
└──────────────────┘      status_checks: id, timestamp
                          users: id, email
                          typhoon_data: id, year, date_start

═══════════════════════════════════════════════════════════════════════

COLLECTION STATUS:
═══════════════════

✅ IMPLEMENTED (In Production):
   • incidents
   • hotlines
   • map_locations
   • checklist_items
   • resources
   • status_checks

⏳ FUTURE (Planned):
   • emergency_plans (requires user auth)
   • users (authentication system)
   • typhoon_data (historical data)
   • notifications (push notification system)

═══════════════════════════════════════════════════════════════════════

RELATIONSHIPS:
═════════════

incidents       → users (future: reporter_id)
emergency_plans → users (future: user_id)
notifications   → users (future: created_by, target_users)
incidents       → map_locations (spatial: lat/lng proximity)

═══════════════════════════════════════════════════════════════════════

CATEGORIES & ENUMS:
══════════════════

Incident Types:
  • flood, fire, landslide, road_block, medical, earthquake, other

Incident Status:
  • pending, acknowledged, responding, resolved, closed

Hotline Categories:
  • emergency, local, police, fire, medical, weather

Location Types:
  • evacuation, hospital, police, fire, government

Checklist Categories:
  • Documents, Water & Food, First Aid, Tools & Safety
  • Clothing, Communication, Hygiene

Resource Types:
  • government_agency, emergency_assistance, local_resource

Notification Types:
  • typhoon_alert, evacuation, all_clear, system

═══════════════════════════════════════════════════════════════════════
```

## Data Flow Diagram

```
┌─────────────┐
│   Frontend  │
│  React App  │
└──────┬──────┘
       │ HTTP Requests
       │
       ▼
┌─────────────────────────┐
│   FastAPI Backend       │
│   (server.py)           │
│                         │
│  /api/hotlines          │
│  /api/incidents         │
│  /api/map/locations     │
│  /api/checklist         │
│  /api/resources         │
│  /api/typhoon/current   │
└──────────┬──────────────┘
           │ Motor (AsyncIO)
           │
           ▼
┌─────────────────────────┐
│   MongoDB Database      │
│   mdrrmo_pioduran       │
│                         │
│   Collections:          │
│   • incidents           │
│   • hotlines            │
│   • map_locations       │
│   • checklist_items     │
│   • resources           │
│   • status_checks       │
└─────────────────────────┘
```

## Storage Locations

```
┌────────────────────────────────────────────────────┐
│            Data Storage Architecture               │
└────────────────────────────────────────────────────┘

SERVER SIDE (MongoDB):
━━━━━━━━━━━━━━━━━━━━━━
✓ Incident reports
✓ Hotline numbers
✓ Map facility locations
✓ Support resources
✓ Status checks

CLIENT SIDE (localStorage):
━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Go Bag checklist progress
✓ Emergency plan (family info)
✓ User preferences
✓ Offline cached data

HYBRID (Future):
━━━━━━━━━━━━━━━
✓ Checklist progress (sync to DB when authenticated)
✓ Emergency plans (sync across devices)
✓ Offline incident reports (queue for sync)
```

---

**Created**: August 2025  
**Schema Version**: 1.0
