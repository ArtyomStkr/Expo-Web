"""Intentionally vulnerable local examples with synthetic, in-memory data."""
import secrets
import sqlite3
from flask import Flask, abort, render_template_string, request, session
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config.update(SECRET_KEY=secrets.token_hex(32), SESSION_COOKIE_HTTPONLY=True,
                  SESSION_COOKIE_SAMESITE='Lax', SESSION_COOKIE_SECURE=False,
                  TRUSTED_HOSTS=['127.0.0.1', 'localhost'], MAX_CONTENT_LENGTH=16_384)
csrf = CSRFProtect(app)

SHELL = '''<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Laboratorio local · Seguridad web</title>
<style>body{background:#04110b;color:#d7efdf;font:18px/1.6 Arial,sans-serif;max-width:1060px;margin:45px auto;padding:0 24px}a{color:#00f59b}h1,h2{line-height:1.2}h1{font-size:42px}h2{font-size:26px;color:#73f2b4}section{border:1px solid #285a40;background:#091e13;padding:24px;margin:22px 0}nav{display:flex;gap:20px;border-bottom:1px solid #285a40;padding-bottom:20px}.button,button{display:inline-block;background:#00f59b;color:#032015;padding:9px 15px;border:0;margin:5px 10px 5px 0;font:16px Arial;text-decoration:none;cursor:pointer}input{font:18px Arial;padding:10px;max-width:90%}code,pre{background:#001c10;color:#7bffb8;white-space:pre-wrap;overflow-wrap:anywhere;padding:4px 8px}.label{font-size:14px;letter-spacing:2px;color:#87b69b}.notice{color:#a6bfaf;font-size:16px}.result{padding:20px;border:1px solid #386b48}table{border-collapse:collapse;width:100%}td,th{padding:12px;border-bottom:1px solid #285a40;text-align:left}</style>
</head><body><nav><a href="/">Inicio del laboratorio</a><a href="/perfil">Perfil / CSRF</a></nav>
<p class="label">DEMOSTRACIÓN LOCAL · DATOS FICTICIOS</p>'''
END = '<p class="notice">Solo en esta computadora. Detener la terminal con Ctrl+C al terminar.</p></body></html>'


def page(template, **values):
    return render_template_string(SHELL + template + END, **values)


@app.before_request
def restrict_to_loopback():
    if request.remote_addr not in ('127.0.0.1', '::1'):
        abort(403)


@app.after_request
def local_headers(response):
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'no-referrer'
    return response


def lookup(name, safe):
    with sqlite3.connect(':memory:') as db:
        db.execute('CREATE TABLE usuarios (nombre TEXT, rol TEXT)')
        db.executemany('INSERT INTO usuarios VALUES (?, ?)', [('ana', 'lectora'), ('bruno', 'editor')])
        if safe:
            return db.execute('SELECT nombre, rol FROM usuarios WHERE nombre = ?', (name,)).fetchall()
        # Deliberately vulnerable. Never copy this concatenation into a real service.
        query = "SELECT nombre, rol FROM usuarios WHERE nombre = '" + name + "'"
        return db.execute(query).fetchall()


@app.get('/')
def home():
    return page('''<h1>De la teoría a la prueba.</h1><p>Compara una entrada normal, una vulnerable y una protegida.</p>
    <section><h2>1. Inyección SQL</h2><p>Una búsqueda normal devuelve un registro. La consulta vulnerable manipulada devuelve dos; la parametrizada devuelve cero.</p>
    <a class="button" href="{{ url_for('sql_demo', mode='vulnerable', nombre='ana') }}">Búsqueda normal</a>
    <a class="button" href="{{ url_for('sql_demo', mode='vulnerable', nombre=payload) }}">Probar SQL vulnerable</a>
    <a class="button" href="{{ url_for('sql_demo', mode='seguro', nombre=payload) }}">Probar SQL protegido</a></section>
    <section><h2>2. XSS</h2><p>La prueba solo muestra una alerta inocua; no lee ni envía datos.</p>
    <a class="button" href="{{ url_for('xss_bad', q=script) }}">Probar XSS vulnerable</a>
    <a class="button" href="{{ url_for('xss_good', q=script) }}">Probar XSS protegido</a></section>
    <section><h2>3. CSRF y sesión</h2><p>Guarda un alias y compara el envío con y sin token. Después revisa la cookie en DevTools.</p><a class="button" href="/perfil">Abrir perfil de prueba</a></section>''',
    payload="' OR '1'='1", script="<script>alert('DEMO LOCAL')</script>")


@app.get('/sql/<mode>')
def sql_demo(mode):
    if mode not in ('seguro', 'vulnerable'):
        abort(404)
    name = request.args.get('nombre', 'ana')[:200]
    try:
        rows = lookup(name, mode == 'seguro')
    except sqlite3.Error:
        return page('<h1>Entrada SQL inválida</h1><p>La consulta vulnerable no pudo procesar esta entrada.</p>'), 400
    return page('''<h1>SQL / {{ mode }}</h1><p>Entrada: <code>{{ name }}</code></p><p id="count">Registros: {{ rows|length }}</p>
    <table><tr><th>Nombre</th><th>Rol ficticio</th></tr>{% for name,role in rows %}<tr><td>{{ name }}</td><td>{{ role }}</td></tr>{% endfor %}</table>
    <h2>Qué cambió</h2><p>{{ explanation }}</p>''', rows=rows, name=name, mode=mode,
    explanation='Los valores viajan separados de la consulta. La entrada es solo un nombre.' if mode == 'seguro' else 'El programa pega la entrada en la orden SQL. Una condición manipulada puede seleccionar más registros.')


@app.get('/xss/vulnerable')
def xss_bad():
    # Deliberately raw HTML only in this bounded, local teaching endpoint.
    return SHELL + '<h1>XSS / vulnerable</h1><p>La entrada se pegó directamente como HTML:</p>' + request.args.get('q', '')[:1000] + END


@app.get('/xss/seguro')
def xss_good():
    return page('<h1>XSS / protegido</h1><p>La plantilla presenta la entrada como texto:</p><div class="result">{{ q }}</div>', q=request.args.get('q', '')[:1000])


@app.route('/perfil', methods=['GET', 'POST'])
def profile():
    session.setdefault('usuario_demo', 'ana')
    if request.method == 'POST':
        session['alias'] = request.form.get('alias', '')[:40]
    return page('''<h1>Perfil / protección CSRF</h1><p>Alias guardado: <strong id="alias">{{ alias }}</strong></p>
    <section><form id="profile-form" method="post"><input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
    <label>Alias ficticio <input name="alias" value="{{ alias }}" maxlength="40"></label><br><button>Guardar con token</button></form></section>
    <section><h2>Comprobar el rechazo</h2><p>Este segundo formulario omite deliberadamente el token. El servidor debe rechazarlo con HTTP 400.</p>
    <form method="post"><input type="hidden" name="alias" value="No debe guardarse"><button>Enviar sin token (esperar 400)</button></form></section>
    <p>También puedes quitar el token del primer formulario desde DevTools. No se desactiva la protección del servidor.</p>
    <p class="notice">Cookie local: HttpOnly y SameSite=Lax. Secure=False solo para esta prueba HTTP en loopback.</p>''', alias=session.get('alias', 'ana'))


@app.errorhandler(400)
def bad_request(error):
    return page('<h1>Solicitud rechazada / HTTP 400</h1><p>Falta un token CSRF válido o la solicitud no es válida. El alias no se modificó.</p><a class="button" href="/perfil">Volver al perfil</a>'), 400
