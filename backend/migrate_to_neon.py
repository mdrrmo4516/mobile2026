"""
Migration script from MongoDB to Neon PostgreSQL
"""
import os
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
import asyncpg
from datetime import datetime

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
MONGO_DB = os.environ.get('DB_NAME', 'test_database')

# Neon PostgreSQL connection
NEON_CONNECTION_STRING = "postgresql://neondb_owner:npg_IxwTKsQZ8Oj5@ep-misty-lab-a1x6rj6f-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Collection names to export
COLLECTIONS = [
    'incidents',
    'hotlines', 
    'map_locations',
    'users',
    'emergency_plans',
    'checklists',
    'status_checks'
]


async def export_mongodb_data():
    """Export all data from MongoDB"""
    print("🔄 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB]
    
    exported_data = {}
    
    for collection_name in COLLECTIONS:
        print(f"📦 Exporting {collection_name}...")
        collection = db[collection_name]
        
        # Get all documents
        documents = await collection.find({}, {"_id": 0}).to_list(10000)
        exported_data[collection_name] = documents
        print(f"   ✅ Exported {len(documents)} documents from {collection_name}")
    
    client.close()
    
    # Save to JSON file for backup
    backup_file = '/app/backend/mongodb_backup.json'
    with open(backup_file, 'w') as f:
        json.dump(exported_data, f, indent=2, default=str)
    
    print(f"\n💾 Backup saved to {backup_file}")
    return exported_data


async def create_postgresql_schema(conn):
    """Create PostgreSQL tables matching MongoDB collections"""
    print("\n🏗️  Creating PostgreSQL schema...")
    
    # Drop existing tables (if any)
    await conn.execute('DROP TABLE IF EXISTS incidents CASCADE')
    await conn.execute('DROP TABLE IF EXISTS hotlines CASCADE')
    await conn.execute('DROP TABLE IF EXISTS map_locations CASCADE')
    await conn.execute('DROP TABLE IF EXISTS users CASCADE')
    await conn.execute('DROP TABLE IF EXISTS emergency_plans CASCADE')
    await conn.execute('DROP TABLE IF EXISTS checklists CASCADE')
    await conn.execute('DROP TABLE IF EXISTS status_checks CASCADE')
    
    # Create users table
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✅ Created users table")
    
    # Create incidents table
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS incidents (
            id VARCHAR(255) PRIMARY KEY,
            incident_type VARCHAR(100) NOT NULL,
            date VARCHAR(50),
            time VARCHAR(50),
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            description TEXT NOT NULL,
            reporter_phone VARCHAR(50),
            images JSONB DEFAULT '[]',
            internal_notes TEXT DEFAULT '',
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✅ Created incidents table")
    
    # Create hotlines table
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS hotlines (
            id VARCHAR(255) PRIMARY KEY,
            label VARCHAR(500) NOT NULL,
            number VARCHAR(100) NOT NULL,
            category VARCHAR(100) NOT NULL
        )
    ''')
    print("   ✅ Created hotlines table")
    
    # Create map_locations table
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS map_locations (
            id INTEGER PRIMARY KEY,
            type VARCHAR(100) NOT NULL,
            name VARCHAR(500) NOT NULL,
            address TEXT NOT NULL,
            lat FLOAT NOT NULL,
            lng FLOAT NOT NULL,
            capacity VARCHAR(200),
            services TEXT,
            hotline VARCHAR(100)
        )
    ''')
    print("   ✅ Created map_locations table")
    
    # Create emergency_plans table
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS emergency_plans (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
            plan_data JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✅ Created emergency_plans table")
    
    # Create checklists table
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS checklists (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
            checklist_data JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✅ Created checklists table")
    
    # Create status_checks table
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS status_checks (
            id VARCHAR(255) PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✅ Created status_checks table")
    
    print("✅ Schema creation completed!\n")


async def migrate_data(conn, exported_data):
    """Migrate data from MongoDB export to PostgreSQL"""
    print("🚀 Starting data migration...\n")
    
    # Migrate users first (due to foreign key constraints)
    if exported_data.get('users'):
        print(f"👥 Migrating {len(exported_data['users'])} users...")
        for user in exported_data['users']:
            await conn.execute('''
                INSERT INTO users (id, email, password, full_name, phone, is_admin, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO NOTHING
            ''', 
                user['id'],
                user['email'],
                user['password'],
                user['full_name'],
                user.get('phone'),
                user.get('is_admin', False),
                datetime.fromisoformat(user['created_at']) if isinstance(user.get('created_at'), str) else user.get('created_at', datetime.now())
            )
        print(f"   ✅ Migrated {len(exported_data['users'])} users\n")
    
    # Migrate incidents
    if exported_data.get('incidents'):
        print(f"📋 Migrating {len(exported_data['incidents'])} incidents...")
        for incident in exported_data['incidents']:
            await conn.execute('''
                INSERT INTO incidents (id, incident_type, date, time, latitude, longitude, 
                                      description, reporter_phone, images, internal_notes, status, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id) DO NOTHING
            ''',
                incident['id'],
                incident['incident_type'],
                incident.get('date'),
                incident.get('time'),
                float(incident['latitude']),
                float(incident['longitude']),
                incident['description'],
                incident.get('reporter_phone'),
                json.dumps(incident.get('images', [])),
                incident.get('internal_notes', ''),
                incident.get('status', 'new'),
                datetime.fromisoformat(incident['created_at']) if isinstance(incident.get('created_at'), str) else incident.get('created_at', datetime.now())
            )
        print(f"   ✅ Migrated {len(exported_data['incidents'])} incidents\n")
    
    # Migrate hotlines
    if exported_data.get('hotlines'):
        print(f"📞 Migrating {len(exported_data['hotlines'])} hotlines...")
        for hotline in exported_data['hotlines']:
            await conn.execute('''
                INSERT INTO hotlines (id, label, number, category)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
            ''',
                hotline['id'],
                hotline['label'],
                hotline['number'],
                hotline['category']
            )
        print(f"   ✅ Migrated {len(exported_data['hotlines'])} hotlines\n")
    
    # Migrate map_locations
    if exported_data.get('map_locations'):
        print(f"📍 Migrating {len(exported_data['map_locations'])} map locations...")
        for location in exported_data['map_locations']:
            await conn.execute('''
                INSERT INTO map_locations (id, type, name, address, lat, lng, capacity, services, hotline)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO NOTHING
            ''',
                location['id'],
                location['type'],
                location['name'],
                location['address'],
                float(location['lat']),
                float(location['lng']),
                location.get('capacity'),
                location.get('services'),
                location.get('hotline')
            )
        print(f"   ✅ Migrated {len(exported_data['map_locations'])} locations\n")
    
    # Migrate emergency_plans
    if exported_data.get('emergency_plans'):
        print(f"📝 Migrating {len(exported_data['emergency_plans'])} emergency plans...")
        for plan in exported_data['emergency_plans']:
            await conn.execute('''
                INSERT INTO emergency_plans (id, user_id, plan_data, updated_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
            ''',
                plan['id'],
                plan['user_id'],
                json.dumps(plan['plan_data']),
                datetime.fromisoformat(plan['updated_at']) if isinstance(plan.get('updated_at'), str) else plan.get('updated_at', datetime.now())
            )
        print(f"   ✅ Migrated {len(exported_data['emergency_plans'])} emergency plans\n")
    
    # Migrate checklists
    if exported_data.get('checklists'):
        print(f"✅ Migrating {len(exported_data['checklists'])} checklists...")
        for checklist in exported_data['checklists']:
            await conn.execute('''
                INSERT INTO checklists (id, user_id, checklist_data, updated_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
            ''',
                checklist['id'],
                checklist['user_id'],
                json.dumps(checklist['checklist_data']),
                datetime.fromisoformat(checklist['updated_at']) if isinstance(checklist.get('updated_at'), str) else checklist.get('updated_at', datetime.now())
            )
        print(f"   ✅ Migrated {len(exported_data['checklists'])} checklists\n")
    
    # Migrate status_checks
    if exported_data.get('status_checks'):
        print(f"🔍 Migrating {len(exported_data['status_checks'])} status checks...")
        for check in exported_data['status_checks']:
            await conn.execute('''
                INSERT INTO status_checks (id, client_name, timestamp)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO NOTHING
            ''',
                check['id'],
                check['client_name'],
                datetime.fromisoformat(check['timestamp']) if isinstance(check.get('timestamp'), str) else check.get('timestamp', datetime.now())
            )
        print(f"   ✅ Migrated {len(exported_data['status_checks'])} status checks\n")
    
    print("✅ Data migration completed!\n")


async def verify_migration(conn):
    """Verify the migration by counting records"""
    print("🔍 Verifying migration...\n")
    
    tables = ['users', 'incidents', 'hotlines', 'map_locations', 'emergency_plans', 'checklists', 'status_checks']
    
    for table in tables:
        count = await conn.fetchval(f'SELECT COUNT(*) FROM {table}')
        print(f"   {table}: {count} records")
    
    print("\n✅ Verification completed!")


async def main():
    """Main migration function"""
    print("=" * 60)
    print("🚀 MongoDB to Neon PostgreSQL Migration")
    print("=" * 60)
    print()
    
    # Step 1: Export MongoDB data
    exported_data = await export_mongodb_data()
    
    # Step 2: Connect to Neon PostgreSQL
    print("\n🔄 Connecting to Neon PostgreSQL...")
    conn = await asyncpg.connect(NEON_CONNECTION_STRING)
    print("   ✅ Connected to Neon PostgreSQL\n")
    
    try:
        # Step 3: Create schema
        await create_postgresql_schema(conn)
        
        # Step 4: Migrate data
        await migrate_data(conn, exported_data)
        
        # Step 5: Verify migration
        await verify_migration(conn)
        
        print("\n" + "=" * 60)
        print("🎉 Migration completed successfully!")
        print("=" * 60)
        
    finally:
        await conn.close()
        print("\n🔒 Connection closed")


if __name__ == "__main__":
    asyncio.run(main())
