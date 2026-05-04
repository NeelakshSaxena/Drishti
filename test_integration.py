#!/usr/bin/env python3
"""Integration test for family tracking system."""

import requests
import json
import sys

API_BASE = "http://localhost:8000"

def test_health():
    """Test health check endpoint."""
    print("Testing health check...")
    res = requests.get(f"{API_BASE}/family/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    data = res.json()
    assert data["status"] == "ok"
    print("✓ Health check passed")
    return data

def test_init_child():
    """Test child initialization."""
    print("Testing child init...")
    res = requests.post(f"{API_BASE}/family/child/init")
    assert res.status_code == 200, f"Child init failed: {res.status_code}"
    data = res.json()
    assert "child_id" in data
    assert "child_code" in data
    print(f"✓ Child created: {data['child_code']}")
    return data["child_id"], data["child_code"]

def test_init_parent():
    """Test parent initialization."""
    print("Testing parent init...")
    res = requests.post(f"{API_BASE}/family/parent/init")
    assert res.status_code == 200, f"Parent init failed: {res.status_code}"
    data = res.json()
    assert "parent_id" in data
    print(f"✓ Parent created: {data['parent_id'][:8]}...")
    return data["parent_id"]

def test_link_child(parent_id, child_code):
    """Test linking child to parent."""
    print(f"Testing link child ({child_code})...")
    res = requests.post(
        f"{API_BASE}/family/parent/link-child?parent_id={parent_id}",
        json={"child_code": child_code}
    )
    assert res.status_code == 200, f"Link child failed: {res.status_code} - {res.text}"
    print("✓ Child linked to parent")

def test_trip_flow(child_id):
    """Test trip creation and event management."""
    print(f"Testing trip flow...")
    
    # Start trip
    res = requests.post(f"{API_BASE}/family/child/trip/start?child_id={child_id}")
    assert res.status_code == 200, f"Start trip failed: {res.status_code}"
    print("✓ Trip started")
    
    # Add event
    event_data = {
        "type": "flight",
        "from_location": "New York",
        "to_location": "London",
        "time": "10:00",
        "description": "International flight"
    }
    res = requests.post(
        f"{API_BASE}/family/child/trip/event?child_id={child_id}",
        json=event_data
    )
    assert res.status_code == 200, f"Add event failed: {res.status_code}"
    print("✓ Event added")
    
    # End trip
    res = requests.post(f"{API_BASE}/family/child/trip/end?child_id={child_id}")
    assert res.status_code == 200, f"End trip failed: {res.status_code}"
    print("✓ Trip ended")

def test_dashboards(parent_id, child_id):
    """Test dashboard endpoints."""
    print("Testing dashboards...")
    
    # Parent dashboard
    res = requests.get(f"{API_BASE}/family/parent/dashboard?parent_id={parent_id}")
    assert res.status_code == 200, f"Parent dashboard failed: {res.status_code}"
    parent_data = res.json()
    assert "parent" in parent_data
    assert "linked_children" in parent_data
    print("✓ Parent dashboard working")
    
    # Child dashboard
    res = requests.get(f"{API_BASE}/family/child/dashboard?child_id={child_id}")
    assert res.status_code == 200, f"Child dashboard failed: {res.status_code}"
    child_data = res.json()
    assert "child" in child_data
    print("✓ Child dashboard working")

def main():
    """Run all tests."""
    print("🧪 Starting family tracking system integration tests\n")
    
    try:
        # Basic health check
        test_health()
        print()
        
        # Create parent and child
        parent_id = test_init_parent()
        child_id, child_code = test_init_child()
        print()
        
        # Link child to parent
        test_link_child(parent_id, child_code)
        print()
        
        # Test trip flow
        test_trip_flow(child_id)
        print()
        
        # Test dashboards
        test_dashboards(parent_id, child_id)
        print()
        
        print("✅ All tests passed!")
        return 0
        
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
