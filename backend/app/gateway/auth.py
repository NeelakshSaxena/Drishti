import logging
from typing import Optional
from app.services import storage

logger = logging.getLogger(__name__)

def authenticate_device(token: str) -> Optional[str]:
    """Returns device_id if authenticated, else None"""
    if not token:
        logger.warning("Empty token provided for device auth")
        return None
        
    device = storage.get_device_by_token(token)
    if device:
        return device["id"]
        
    logger.warning(f"Invalid token provided: {token}")
    return None
