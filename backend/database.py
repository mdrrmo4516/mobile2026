"""
Database connection and utilities for Neon PostgreSQL
"""
import asyncpg
import os
from typing import Optional
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

# Neon PostgreSQL connection string - MUST be set in .env file
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Please configure it in backend/.env file.")

# Global connection pool
_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    """Get or create database connection pool"""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=2,
            max_size=10,
            command_timeout=60
        )
    return _pool


async def close_pool():
    """Close database connection pool"""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_connection():
    """Get a database connection from the pool"""
    pool = await get_pool()
    return await pool.acquire()


async def release_connection(conn):
    """Release a database connection back to the pool"""
    pool = await get_pool()
    await pool.release(conn)


class Database:
    """Database operations wrapper"""
    
    def __init__(self):
        self.pool = None
    
    async def connect(self):
        """Initialize connection pool"""
        self.pool = await get_pool()
    
    async def close(self):
        """Close connection pool"""
        await close_pool()
    
    async def fetch_all(self, query: str, *args):
        """Fetch all rows"""
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)
    
    async def fetch_one(self, query: str, *args):
        """Fetch one row"""
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)
    
    async def fetch_val(self, query: str, *args):
        """Fetch single value"""
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)
    
    async def execute(self, query: str, *args):
        """Execute query"""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def executemany(self, query: str, args_list):
        """Execute many queries"""
        async with self.pool.acquire() as conn:
            return await conn.executemany(query, args_list)


# Helper functions to convert asyncpg.Record to dict
def record_to_dict(record):
    """Convert asyncpg Record to dict"""
    if record is None:
        return None
    return dict(record)


def records_to_list(records):
    """Convert list of asyncpg Records to list of dicts"""
    return [dict(record) for record in records]
