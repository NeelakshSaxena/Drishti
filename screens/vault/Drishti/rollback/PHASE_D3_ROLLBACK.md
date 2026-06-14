# Phase D3 Rollback Notes

## Rollback Procedure
If the Device Gateway needs to be removed from the system, it requires reverting changes to `main.py` in addition to deleting the newly created module.

1. Revert `backend/app/main.py` to remove the `ws` imports and routes.
```python
# Remove:
# from app.gateway import ws
# app.include_router(ws.router, prefix="/ws", tags=["device-gateway"])
```

2. Delete the gateway directory and test file:
```bash
rm -rf backend/app/gateway/
rm backend/test_ws_gateway.py
```
