from app import app, socketio
import os
import subprocess
import sys
import time
import socket as socket_module

if __name__ == "__main__":
    port = 5000
    
    # Kill any existing process using the port
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if sys.platform == "win32":
                # Windows - use PowerShell to kill the process
                subprocess.run(
                    ["powershell", "-Command", "Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"],
                    capture_output=True,
                    timeout=5
                )
            else:
                # Linux/Mac
                subprocess.run("lsof -ti:5000 | xargs kill -9 2>/dev/null || true", shell=True, capture_output=True)
            
            time.sleep(2)  # Give the port time to be released
            
            # Check if port is actually free
            sock = socket_module.socket(socket_module.AF_INET, socket_module.SOCK_STREAM)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            
            if result != 0:  # Port is free
                print(f"✓ Port {port} is now free")
                break
            else:
                print(f"Attempt {attempt + 1}/{max_retries}: Port still in use, retrying...")
                time.sleep(2)
        except Exception as e:
            print(f"Warning during cleanup: {e}")
            time.sleep(2)
    
    # app.run(debug=True)
    # Socket.IO configured with threading mode in app/socket/__init__.py
    # use_reloader=False to prevent auto-restart issues with Socket.IO
    socketio.run(
        app, 
        host='127.0.0.1', 
        port=5000, 
        debug=True, 
        allow_unsafe_werkzeug=True,
        use_reloader=False  # Disable auto-reload to avoid port binding issues
    )