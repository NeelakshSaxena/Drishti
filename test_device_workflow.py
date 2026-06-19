import requests

API_BASE = "http://localhost:8000"

def test_workflow():
    print("Testing device workflow...")
    # 1. Create parent
    res = requests.post(f"{API_BASE}/family/parent/init", json={"name": "Test Parent", "email": "test@test.com", "password": "pass"})
    if res.status_code == 200:
        if res.json().get("success") == False:
            print("Parent already exists, logging in instead...")
            res = requests.post(f"{API_BASE}/family/parent/login", json={"name": "Test Parent", "email": "test@test.com", "password": "pass"})
    
    # 2. Create child
    res = requests.post(f"{API_BASE}/family/child/init", json={"name": "Test Child", "email": "child@test.com", "age": 10, "password": "pass"})
    child_code = None
    if res.status_code == 200:
        data = res.json()
        if data.get("success") == False:
            print("Child already exists, logging in instead...")
            res = requests.post(f"{API_BASE}/family/child/login", json={"email": "child@test.com", "password": "pass"})
            data = res.json()
        child_code = data["child_code"]
    
    print(f"Child Code: {child_code}")

    # 3. Register device with child code
    print("Registering device...")
    res = requests.post(f"{API_BASE}/device/register", json={"name": "My Android", "pairing_code": child_code})
    print(f"Device Register Response: {res.status_code} {res.text}")
    data = res.json()
    device_id = data["device_id"]
    token = data["token"]
    
    # 4. Link device (just in case pairing_code was skipped, but our modified endpoint auto-links)
    print("Linking device...")
    res = requests.post(f"{API_BASE}/device/link", json={"token": token, "child_code": child_code})
    print(f"Device Link Response: {res.status_code} {res.text}")
    
    print("Workflow passed!")

if __name__ == "__main__":
    test_workflow()
