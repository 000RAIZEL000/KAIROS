import urllib.request
import json

req = urllib.request.Request("http://127.0.0.1:8000/api/auth/forgot-password", method="POST")
req.add_header("Content-Type", "application/json")
data = json.dumps({"email": "admin@gmail.com"}).encode("utf-8")

try:
    with urllib.request.urlopen(req, data=data) as f:
        print("Status", f.status)
        print(f.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
    if hasattr(e, "read"):
        print(e.read().decode("utf-8"))
