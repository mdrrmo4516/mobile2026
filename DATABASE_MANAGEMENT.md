# Database Management Guide

## Quick Reference

### Initialize/Seed Database
```bash
cd /app/backend
python init_database.py
```

### Access MongoDB Shell
```bash
mongosh
use mdrrmo_pioduran
```

### View Collections
```javascript
// In mongosh
show collections
```

### Collection Stats
```javascript
db.hotlines.countDocuments()
db.incidents.countDocuments()
db.map_locations.countDocuments()
db.checklist_items.countDocuments()
db.resources.countDocuments()
```

---

## Common Operations

### View Recent Incidents
```javascript
db.incidents.find().sort({created_at: -1}).limit(10)
```

### View All Hotlines
```javascript
db.hotlines.find().sort({order: 1})
```

### Filter Evacuation Centers
```javascript
db.map_locations.find({type: "evacuation"})
```

### View Essential Checklist Items
```javascript
db.checklist_items.find({essential: true}).sort({order: 1})
```

---

## Backup & Restore

### Create Backup
```bash
mongodump --db mdrrmo_pioduran --out /app/backups/$(date +%Y%m%d)
```

### Restore from Backup
```bash
mongorestore --db mdrrmo_pioduran /app/backups/20240815/mdrrmo_pioduran
```

---

## Update Operations

### Update Hotline Number
```javascript
db.hotlines.updateOne(
  {id: "hotline-001"},
  {$set: {number: "911", updated_at: new ISODate()}}
)
```

### Mark Incident as Resolved
```javascript
db.incidents.updateOne(
  {id: "incident-id-here"},
  {
    $set: {
      status: "resolved",
      resolved_at: new ISODate(),
      updated_at: new ISODate()
    }
  }
)
```

### Update Facility Status
```javascript
db.map_locations.updateOne(
  {id: 1},
  {$set: {status: "full", updated_at: new ISODate()}}
)
```

---

## Insert Operations

### Add New Hotline
```javascript
db.hotlines.insertOne({
  id: "hotline-011",
  label: "New Emergency Hotline",
  number: "+63 XX XXX XXXX",
  category: "emergency",
  description: "Description here",
  availability: "24/7",
  order: 11,
  is_active: true,
  created_at: new ISODate()
})
```

### Add New Evacuation Center
```javascript
db.map_locations.insertOne({
  id: 13,
  type: "evacuation",
  name: "New Evacuation Center",
  address: "Address here",
  lat: 13.0500,
  lng: 123.5200,
  capacity: "300 persons",
  amenities: ["restroom", "water supply"],
  operating_hours: "During emergencies only",
  status: "operational",
  is_active: true,
  created_at: new ISODate()
})
```

---

## Delete Operations

### Soft Delete (Deactivate)
```javascript
// Recommended approach - keep data but hide from API
db.hotlines.updateOne(
  {id: "hotline-011"},
  {$set: {is_active: false, updated_at: new ISODate()}}
)
```

### Hard Delete
```javascript
// Use with caution - permanently removes data
db.hotlines.deleteOne({id: "hotline-011"})
```

---

## Query Examples

### Count Incidents by Type
```javascript
db.incidents.aggregate([
  {$group: {_id: "$incident_type", count: {$sum: 1}}},
  {$sort: {count: -1}}
])
```

### Get Pending Incidents
```javascript
db.incidents.find({status: "pending"}).sort({created_at: -1})
```

### Find Hospitals
```javascript
db.map_locations.find({type: "hospital", is_active: true})
```

### Get Checklist by Category
```javascript
db.checklist_items.find({category: "First Aid"}).sort({order: 1})
```

---

## Index Management

### View Indexes
```javascript
db.incidents.getIndexes()
db.hotlines.getIndexes()
```

### Create New Index
```javascript
db.incidents.createIndex({status: 1, created_at: -1})
```

---

## Database Maintenance

### Check Database Size
```javascript
db.stats()
```

### Compact Collection (Reclaim Space)
```bash
mongosh mdrrmo_pioduran --eval "db.incidents.compact()"
```

### Validate Collection
```javascript
db.incidents.validate()
```

---

## Monitoring

### Watch Real-time Changes
```javascript
// Watch for new incidents
const changeStream = db.incidents.watch();
changeStream.on('change', next => {
  console.log('New incident:', next);
});
```

### Get Collection Stats
```javascript
db.incidents.stats()
```

---

## Reset Database (Development Only)

### Clear All Collections
```javascript
// WARNING: This deletes all data!
db.incidents.deleteMany({})
db.hotlines.deleteMany({})
db.map_locations.deleteMany({})
db.checklist_items.deleteMany({})
db.resources.deleteMany({})
db.status_checks.deleteMany({})
```

### Re-initialize
```bash
cd /app/backend
python init_database.py
```

---

## Connection Info

- **Host**: localhost
- **Port**: 27017
- **Database**: mdrrmo_pioduran
- **Connection String**: `mongodb://localhost:27017`

---

## Environment Variables

Located in `/app/backend/.env`:

```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=mdrrmo_pioduran
```

---

## Troubleshooting

### MongoDB Not Running
```bash
# Check status
sudo supervisorctl status mongodb

# Restart MongoDB
sudo supervisorctl restart mongodb

# View logs
tail -f /var/log/mongodb.err.log
```

### Connection Errors
```bash
# Test connection
mongosh --eval "db.adminCommand('ping')"

# Check if MongoDB is listening
netstat -an | grep 27017
```

### Backend Can't Connect
```bash
# Check environment variables
cat /app/backend/.env

# Check backend logs
tail -f /var/log/supervisor/backend.err.log
```

---

## Best Practices

1. **Always backup before major changes**
2. **Use soft deletes (is_active: false) instead of hard deletes**
3. **Add updated_at timestamps when modifying records**
4. **Test queries on development data first**
5. **Use transactions for operations affecting multiple collections**
6. **Monitor database size and performance regularly**
7. **Keep indexes optimized for your query patterns**

---

**Last Updated**: August 2025
