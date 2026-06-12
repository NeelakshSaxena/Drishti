import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Basic token based device auth for now
# In production, this would use JWT and Redis lookup
VALID_TOKENS = {
    "dev-token-123": "device_1",
    "dev-token-456": "device_2"
}

def authenticate_device(token: str) -> Optional[str]:
    """Returns device_id if authenticated, else None"""
    if not token:
        logger.warning("Empty token provided for device auth")
        return None
        
    device_id = VALID_TOKENS.get(token)
    if device_id:
        return device_id
        
    logger.warning(f"Invalid token provided: {token}")
    return None
