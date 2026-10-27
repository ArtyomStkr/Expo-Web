"""Smoke checks for the educational differences, without network or a browser."""
import re
from app import app

client = app.test_client()
normal = client.get('/sql/vulnerable', query_string={'nombre': 'ana'})
assert b'Registros: 1' in normal.data
payload = "' OR '1'='1"
assert b'Registros: 2' in client.get('/sql/vulnerable', query_string={'nombre': payload}).data
assert b'Registros: 0' in client.get('/sql/seguro', query_string={'nombre': payload}).data
assert client.get('/sql/desconocido').status_code == 404
script = "<script>alert('DEMO LOCAL')</script>"
assert script.encode() in client.get('/xss/vulnerable', query_string={'q': script}).data
safe = client.get('/xss/seguro', query_string={'q': script}).data
assert script.encode() not in safe and b'&lt;script&gt;' in safe
form = client.get('/perfil')
token = re.search(rb'name="csrf_token" value="([^"]+)"', form.data).group(1).decode()
assert client.post('/perfil', data={'alias': 'Alias de prueba', 'csrf_token': token}).status_code == 200
assert client.post('/perfil', data={'alias': 'No debe guardarse'}).status_code == 400
assert b'Alias de prueba' in client.get('/perfil').data
assert client.get('/', environ_overrides={'REMOTE_ADDR': '192.0.2.1'}).status_code == 403
assert client.get('/', headers={'Host': 'no-autorizado.example'}).status_code == 400
assert 'HttpOnly' in form.headers.get('Set-Cookie', '') and 'SameSite=Lax' in form.headers.get('Set-Cookie', '')
print('OK: SQL normal/vulnerable/seguro, XSS literal/escapado, CSRF válido/rechazado y restricción local.')
