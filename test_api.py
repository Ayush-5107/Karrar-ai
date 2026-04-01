import json
import urllib.request
import mimetypes

def post_multipart(url, filename, fileobj):
    content_type, _ = mimetypes.guess_type(filename)
    if content_type is None:
        content_type = 'application/octet-stream'

    boundary = '----------Où_est_la_bibliothèque?'
    body = []
    
    body.append('--' + boundary)
    body.append('Content-Disposition: form-data; name="file"; filename="%s"' % filename)
    body.append('Content-Type: %s' % content_type)
    body.append('')
    body.append(fileobj.read().decode('latin1')) # hacky but works for small test pdf
    body.append('--' + boundary + '--')
    body.append('')
    
    body_bytes = '\r\n'.join(body).encode('latin1')
    
    headers = {
        'Content-Type': 'multipart/form-data; boundary=%s' % boundary,
        'Content-Length': str(len(body_bytes))
    }
    
    req = urllib.request.Request(url, data=body_bytes, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            print(response.read().decode('utf-8'))
            return True
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} {e.reason}")
        print(e.read().decode('utf-8'))
        return False

with open("test.pdf", "rb") as f:
    post_multipart("http://localhost:8000/analyze", "test.pdf", f)
