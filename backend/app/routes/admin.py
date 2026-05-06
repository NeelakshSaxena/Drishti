"""
Root admin routes — protected by a hardcoded root password.
Provides full oversight of every parent & child in the system.
"""

import os
import logging
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from app.services import storage

import psycopg2.extras

logger = logging.getLogger(__name__)
router = APIRouter()

ROOT_PASSWORD = os.getenv("ROOT_PASSWORD", "claudewashere")


# ── Auth helper ───────────────────────────────────────────────────────────────

def _verify_root(password: str | None):
    if not password or password != ROOT_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid root password")


# ── Request schemas ───────────────────────────────────────────────────────────

class RootLoginRequest(BaseModel):
    password: str


class ChangePasswordRequest(BaseModel):
    user_type: str = Field(..., description="'parent' or 'child'")
    user_id: str
    new_password: str = Field(..., min_length=1)


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login")
def root_login(req: RootLoginRequest):
    """Validate the root password and return a simple token."""
    if req.password != ROOT_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid root password")
    return {"success": True, "token": ROOT_PASSWORD}


# ── List everything ──────────────────────────────────────────────────────────

@router.get("/parents")
def list_all_parents(x_root_token: str = Header(None)):
    """Return every parent with their linked children (full detail)."""
    _verify_root(x_root_token)
    conn = storage.get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM parents")
            rows = cur.fetchall()

        results = []
        for row in rows:
            parent = storage.parent_row_to_dict(row)
            # Resolve linked children
            children = []
            for cid in parent.get("linked_children", []):
                child = storage.get_child(cid)
                if child:
                    # Strip password hash from response
                    child.pop("password", None)
                    children.append(child)
            parent.pop("password", None)
            parent["children_detail"] = children
            results.append(parent)
        return {"parents": results}
    finally:
        conn.close()


@router.get("/children")
def list_all_children(x_root_token: str = Header(None)):
    """Return every child in the system."""
    _verify_root(x_root_token)
    conn = storage.get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM children")
            rows = cur.fetchall()

        results = []
        for row in rows:
            child = storage.child_row_to_dict(row)
            if child:
                child.pop("password", None)
                # Resolve parent name
                if child.get("parent_id"):
                    parent = storage.get_parent(child["parent_id"])
                    child["parent_name"] = parent.get("name") if parent else None
                else:
                    child["parent_name"] = None
                results.append(child)
        return {"children": results}
    finally:
        conn.close()


@router.get("/overview")
def admin_overview(x_root_token: str = Header(None)):
    """High-level statistics."""
    _verify_root(x_root_token)
    conn = storage.get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM parents")
            parent_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM children")
            child_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM children WHERE parent_id IS NOT NULL")
            linked_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM children WHERE is_sharing = 1")
            sharing_count = cur.fetchone()[0]

        return {
            "total_parents": parent_count,
            "total_children": child_count,
            "linked_children": linked_count,
            "unlinked_children": child_count - linked_count,
            "actively_sharing": sharing_count,
        }
    finally:
        conn.close()


# ── Password management ─────────────────────────────────────────────────────

@router.post("/change-password")
def change_user_password(req: ChangePasswordRequest, x_root_token: str = Header(None)):
    """Root can reset any parent's or child's password."""
    _verify_root(x_root_token)

    new_hash = storage.hash_password(req.new_password)
    conn = storage.get_db()
    try:
        with conn.cursor() as cur:
            if req.user_type == "parent":
                cur.execute("SELECT id FROM parents WHERE id = %s", (req.user_id,))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Parent not found")
                cur.execute("UPDATE parents SET password = %s WHERE id = %s", (new_hash, req.user_id))
            elif req.user_type == "child":
                cur.execute("SELECT id FROM children WHERE id = %s", (req.user_id,))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Child not found")
                cur.execute("UPDATE children SET password = %s WHERE id = %s", (new_hash, req.user_id))
            else:
                raise HTTPException(status_code=400, detail="user_type must be 'parent' or 'child'")

        conn.commit()
        logger.info(f"Root changed password for {req.user_type} {req.user_id}")
        return {"success": True, "message": f"Password updated for {req.user_type} {req.user_id}"}
    except HTTPException:
        raise
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ── Location lookup ──────────────────────────────────────────────────────────

@router.get("/child/{child_id}/location")
def get_child_location(child_id: str, x_root_token: str = Header(None)):
    """Get full location details for a specific child."""
    _verify_root(x_root_token)
    child = storage.get_child(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    parent_name = None
    if child.get("parent_id"):
        parent = storage.get_parent(child["parent_id"])
        parent_name = parent.get("name") if parent else None

    return {
        "child_id": child["id"],
        "name": child.get("name"),
        "lat": child.get("lat"),
        "lon": child.get("lon"),
        "is_sharing": bool(child.get("is_sharing")),
        "location_updated_at": child.get("location_updated_at"),
        "parent_name": parent_name,
        "current_trip": child.get("current_trip"),
    }
