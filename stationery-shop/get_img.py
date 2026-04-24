import urllib.request
import json
url = "https://en.wikipedia.org/w/api.php?action=query&titles=Highlighter&prop=pageimages&format=json&pithumbsize=500"
response = urllib.request.urlopen(url)
data = json.loads(response.read().decode('utf-8'))
for k, v in data['query']['pages'].items():
    if 'thumbnail' in v:
        print(v['thumbnail']['source'])
