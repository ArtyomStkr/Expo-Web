import React, {useState} from 'react';
import {motion} from 'motion/react';
import {resources, labArchive} from './resources';

function Markdown({text}) {
  return text.split(/\n\s*\n/).map((block,i) => {
    if(block.startsWith('# ')) return <h2 key={i}>{block.slice(2)}</h2>;
    if(block.startsWith('## ')) return <h3 key={i}>{block.slice(3)}</h3>;
    return <p key={i}>{block}</p>;
  });
}
export default function Lobby({onStart}) {
  const [open,setOpen] = useState(false);
  const [selected,setSelected] = useState(resources[0]);
  return <div className="lobby">
    <div className="lobby-heading"><span className="brand"><i/> SEGURIDAD WEB</span><span>ENTORNO DE EXPOSICIÓN</span></div>
    <div className={`lobby-layout ${open?'resources-open':''}`}>
      <nav className="lobby-navigation" aria-label="Menú principal">
        <div className="eyebrow">DATOS / USUARIOS / SESIONES</div>
        <h1>La confianza<br/>se protege<span>.</span></h1>
        <p>Un recorrido por los ataques web<br/>y las decisiones que los previenen.</p>
        <div className="lobby-actions"><button className="primary-action" onClick={onStart}><span>Diapositivas</span><span aria-hidden="true">→</span></button><button className={open?'selected':''} onClick={()=>setOpen(!open)} aria-expanded={open}><span>Descargar Recursos</span><span aria-hidden="true">{open?'−':'+'}</span></button></div>
        {open&&<motion.div className="resource-list" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><div className="micro">GUIONES Y DEMOSTRACIÓN</div>{resources.map(r=><button key={r.slug} onClick={()=>setSelected(r)} className={selected.slug===r.slug?'selected':''} aria-pressed={selected.slug===r.slug}>{r.title}<span aria-hidden="true">↗</span></button>)}<a className="lab-package" href={labArchive} download="laboratorio-flask.zip">Laboratorio listo · ZIP <span aria-hidden="true">↓</span></a></motion.div>}
      </nav>
      <div className="lobby-right">{open?<motion.section className="resource-window" key={selected.slug} initial={{opacity:0}} animate={{opacity:1}} aria-label="Vista previa del recurso"><div className="window-chrome"><span>VISTA PREVIA / DOCUMENTO</span><span aria-hidden="true">─ · ×</span></div><div className="resource-preview" tabIndex="0"><Markdown text={selected.content}/></div><div className="resource-download"><div><strong>LISTO PARA IMPRIMIR</strong><span>Carta · Arial 11 · Espaciado compacto</span></div><a href={selected.pdf} download={`${selected.slug}.pdf`}>Descargar PDF <span aria-hidden="true">↓</span></a></div></motion.section>:<div className="desktop-art" aria-hidden="true"><div className="art-window art-one"><div className="window-chrome"><span>ANÁLISIS / SISTEMA</span><span>─ · ×</span></div><div className="art-code">{Array.from({length:14},(_,i)=><div key={i}><span>{['INPUT','QUERY','OUTPUT','ACCESS'][i%4]}</span><i style={{width:`${40+(i*17)%55}%`}}/></div>)}</div></div><div className="art-window art-two"><div className="window-chrome"><span>FRONTERAS DE CONFIANZA</span><span>─ · ×</span></div><div className="art-shield">◇<span>DATOS<br/>IDENTIDAD<br/>ACCESO</span></div><div className="art-wave">{Array.from({length:42},(_,i)=><i key={i} style={{height:`${12+Math.sin(i*.7)**2*70}px`,animationDelay:`${i*-.1}s`}}/>)}</div></div><div className="art-window art-three"><div className="window-chrome"><span>ESTADO / PROTECCIÓN</span><span>─ · ×</span></div><div className="art-status"><i/> CADA CAPA IMPORTA<span>VALIDAR → SEPARAR → VERIFICAR</span></div></div></div>}</div>
    </div><div className="lobby-bottom">UN ENTORNO LOCAL PARA APRENDER Y EXPONER <span>Las diapositivas se controlan con el teclado. Escape vuelve al inicio.</span></div>
  </div>;
}
