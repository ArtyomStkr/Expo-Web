"""Run once: prepare a local venv, install dependencies and open the demo."""
import argparse
import hashlib
import importlib.util
import os
from pathlib import Path
import subprocess
import sys
import venv
import webbrowser

ROOT = Path(__file__).resolve().parent


def prepare_environment():
    if sys.version_info < (3, 11):
        raise RuntimeError('Se requiere Python 3.11 o posterior.')
    environment = ROOT / '.venv'
    executable = environment / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if not executable.exists():
        print('Creando el entorno local .venv...', flush=True)
        venv.EnvBuilder(with_pip=True).create(environment)
    if Path(sys.prefix).resolve() != environment.resolve():
        return subprocess.call([str(executable), str(Path(__file__).resolve()), *sys.argv[1:]], cwd=ROOT)
    if importlib.util.find_spec('pip') is None:
        subprocess.run([sys.executable, '-m', 'ensurepip', '--upgrade'], check=True, cwd=ROOT)
    requirements = ROOT / 'requirements.txt'
    digest = hashlib.sha256(requirements.read_bytes()).hexdigest()
    marker = environment / '.requirements.sha256'
    dependencies_ok = all(importlib.util.find_spec(name) for name in ('flask', 'flask_wtf'))
    if not dependencies_ok or not marker.exists() or marker.read_text() != digest:
        print('Instalando dependencias desde PyPI. La primera vez requiere Internet...', flush=True)
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(requirements)], check=True, cwd=ROOT)
        marker.write_text(digest)
    return None


def main():
    parser = argparse.ArgumentParser(description='Laboratorio local de seguridad web')
    parser.add_argument('--no-browser', action='store_true', help='No abrir el navegador automáticamente')
    parser.add_argument('--check', action='store_true', help='Comprobar las demostraciones y salir')
    args = parser.parse_args()
    delegated_status = prepare_environment()
    if delegated_status is not None:
        return delegated_status
    if args.check:
        return subprocess.call([sys.executable, str(ROOT / 'comprobar.py')], cwd=ROOT)
    from app import app
    from werkzeug.serving import make_server
    # The OS allocates a free port. Bind exclusively to this computer.
    server = make_server('127.0.0.1', 0, app, threaded=True)
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'\nLaboratorio listo: {url}\nSolo datos ficticios. Detener con Ctrl+C.\n', flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nLaboratorio detenido.')
    finally:
        server.server_close()
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f'No se pudo iniciar: {exc}\nRevisa Python, Internet y las instrucciones del paquete.', file=sys.stderr)
        raise SystemExit(1)
