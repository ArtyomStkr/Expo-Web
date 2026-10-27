import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const manifestPath = 'public/recursos/manifest.json';
if(!process.argv.includes('--force') && existsSync(manifestPath)){
  const manifest = JSON.parse(readFileSync(manifestPath,'utf8'));
  const inputsCurrent = Object.entries(manifest.inputs).every(([file,hash]) => existsSync(file) && createHash('sha256').update(readFileSync(file,'utf8').replaceAll('\r\n','\n')).digest('hex') === hash);
  const outputsCurrent = Object.entries(manifest.outputs).every(([file,hash]) => existsSync(file) && createHash('sha256').update(readFileSync(file)).digest('hex') === hash);
  const current = inputsCurrent && outputsCurrent;
  if(current){console.log('PDF y ZIP actualizados. Se reutilizan los recursos verificados.');process.exit(0);}
}
const bundled = join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const python = process.env.RESOURCE_PYTHON || (existsSync(bundled) ? bundled : process.platform === 'win32' ? 'py' : 'python3');
const args = python === 'py' ? ['-3'] : [];
const result = spawnSync(python, [...args, 'scripts/build-resources.py'], {stdio:'inherit'});
if(result.error || result.status) console.error('Para regenerar recursos se necesitan Python, reportlab y Arial. Instalar reportlab con python -m pip install reportlab. También se pueden usar RESOURCE_PYTHON, RESOURCE_ARIAL y RESOURCE_ARIAL_BOLD.');
process.exit(result.status ?? 1);
