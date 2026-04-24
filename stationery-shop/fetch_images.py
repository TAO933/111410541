import urllib.request
import re

try:
    req = urllib.request.Request('https://www.9x9.tw/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    matches = re.findall(r'<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"', html)
    for src, alt in matches:
        if len(alt.strip()) > 2 and 'http' in src:
            print(f"{alt} || {src}")
    
    # Check title as well
    matches2 = re.findall(r'<img[^>]+src="([^"]+)"[^>]*title="([^"]+)"', html)
    for src, title in matches2:
        if len(title.strip()) > 2 and 'http' in src:
            print(f"{title} || {src}")
except Exception as e:
    print('Error:', e)
