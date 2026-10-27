const files = import.meta.glob('../recursos/0*.md', { query: '?raw', import: 'default', eager: true });
import guide from '../ejemplo-flask.md?raw';

export const resources = Object.entries(files).sort(([a],[b]) => a.localeCompare(b)).map(([path, content]) => {
  const slug = path.split('/').pop().replace('.md', '');
  const title = content.split('\n')[0].replace(/^# /, '');
  const spoken = content.slice(content.indexOf('## ')).split('## Apoyo')[0].split(/\n\s*\n/).filter(b => !b.startsWith('#')).join(' ');
  return { slug, title, content, words: spoken.trim().split(/\s+/).length, pdf: `${import.meta.env.BASE_URL}recursos/${slug}.pdf` };
});

resources.push({slug:'ejemplo-flask',title:'Guía de demostración en Flask',content:guide,pdf:`${import.meta.env.BASE_URL}recursos/ejemplo-flask.pdf`,lab:true});
export const labArchive = `${import.meta.env.BASE_URL}recursos/laboratorio-flask.zip`;
