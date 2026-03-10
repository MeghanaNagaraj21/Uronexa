import urllib.request
import json
import ssl

url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBBjEi_gOB81i_ZKhc5XpVp52hD4atrazM"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("Available models:")
        for model in data.get('models', []):
            print(model['name'])
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    try:
        print(e.read().decode('utf-8'))
    except:
        pass
except Exception as e:
    print("Exception:", str(e))
