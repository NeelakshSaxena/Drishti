import asyncio
import websockets

async def test():
    uri = "wss://drishti-walb.onrender.com/ws/device?token=dev-token-123"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            await websocket.send('{"type": "heartbeat"}')
            res = await websocket.recv()
            print("Received:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
