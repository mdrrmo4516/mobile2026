from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from auth_utils import decode_access_token
from database import get_pool, record_to_dict
from dotenv import load_dotenv
from pathlib import Path
import os

# Ensure env is loaded even if this module is imported before server.py loads .env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    pool = await get_pool()
    async with pool.acquire() as conn:
        user_record = await conn.fetchrow(
            'SELECT id, email, full_name, phone, is_admin, created_at FROM users WHERE id = $1',
            user_id
        )
    
    if user_record is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return record_to_dict(user_record)

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    """Dependency to get current user if authenticated, otherwise None"""
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
