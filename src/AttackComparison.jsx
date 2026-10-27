import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {attackScenes,sceneFrame,timingFor} from './attack-scenes';
import './attack-comparison.css';

function useMovieClock(finishAt,reduced){
  const [elapsed,setElapsed]=useState(0);
  useEffect(()=>{
    if(reduced){setElapsed(finishAt);return;}
    let frame;let previous=performance.now();let total=0;
    const tick=now=>{
      if(!document.hidden)total=Math.min(finishAt,total+Math.min(now-previous,100));
      previous=now;setElapsed(total);
      if(total<finishAt)frame=requestAnimationFrame(tick);
    };
    setElapsed(0);frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[finishAt,reduced]);
  return elapsed;
}

function AnimatedPointer({elapsed,timing,points,reduced}){
  if(reduced||elapsed<450||elapsed>timing.resultAt+500)return null;
  const smooth=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v)};
  let from=points.start,to=points.field,progress=smooth((elapsed-500)/850);
  if(elapsed>=timing.moveAt){from=points.field;to=points.button;progress=smooth((elapsed-timing.moveAt)/700)}
  const x=from.x+(to.x-from.x)*progress,y=from.y+(to.y-from.y)*progress;
  const clicking=elapsed>=timing.clickAt&&elapsed<timing.clickAt+450;
  return <div className={`movie-pointer ${clicking?'is-clicking':''}`} style={{transform:`translate(${x}px,${y}px)`,opacity:elapsed>timing.resultAt?Math.max(0,1-(elapsed-timing.resultAt)/500):1}} aria-hidden="true">
    {clicking&&<span className="movie-click-ring"/>}<svg width="32" height="40" viewBox="0 0 32 40"><path d="M3 2v29l8-8 7 14 6-3-7-14h12L3 2Z" fill="#e7fff1" stroke="#042415" strokeWidth="2" strokeLinejoin="round"/></svg>
  </div>;
}

function Result({kind,attack,data,visible}){
  if(!visible)return <div className="movie-waiting" aria-hidden="true"><div/><div/><div/></div>;
  return <motion.div className={`movie-result ${attack?'breached':'normal'}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.4}}>
    <h2><span aria-hidden="true">{attack?'!':'✓'}</span>{data.result}</h2>
    {kind==='sql'&&<div className="movie-table"><div className="movie-table-head"><span>ESTUDIANTE</span><span>CORREO</span></div><div><span>Ana</span><span>ana@aula.test</span></div>{attack&&<div className="revealed-record"><span>Bruno</span><span>bruno@aula.test</span></div>}</div>}
    {kind==='xss'&&(attack?<div className="movie-alert"><div className="movie-alert-origin">campus.demo dice:</div><div className="movie-alert-message"><span aria-hidden="true">!</span><strong>Tu cuenta fue bloqueada</strong></div><div className="movie-alert-bottom"><span>AVISO FALSO</span><span className="movie-alert-accept">Aceptar</span></div></div>:<div className="movie-comment"><span>Comentario de un estudiante</span><p>Hola, qué buen curso.</p></div>)}
    {kind==='csrf'&&<div className="movie-revealed"><span>CORREO GUARDADO EN LA CUENTA</span><strong>{data.value}</strong></div>}
    {kind==='session'&&<div className="movie-account"><span className="movie-avatar">A</span><div><strong>Bienvenida, Ana.</strong><p>Perfil y acciones de la cuenta disponibles.</p></div></div>}
    <p className="movie-explanation">{data.explanation}</p>
  </motion.div>;
}

function MoviePanel({kind,data,attack,elapsed,frame,reduced}){
  const browser=useRef(null),field=useRef(null),button=useRef(null);
  const [points,setPoints]=useState({start:{x:680,y:350},field:{x:250,y:200},button:{x:650,y:300}});
  useLayoutEffect(()=>{
    const offset=node=>{let x=0,y=0,current=node;while(current&&current!==browser.current){x+=current.offsetLeft;y+=current.offsetTop;current=current.offsetParent}return {x,y}};
    const measure=()=>{
      const input=offset(field.current),send=offset(button.current);
      setPoints({start:{x:browser.current.clientWidth*.88,y:browser.current.clientHeight*.65},field:{x:input.x+Math.min(field.current.clientWidth*.65,380),y:input.y+field.current.clientHeight*.55},button:{x:send.x+button.current.clientWidth*.55,y:send.y+button.current.clientHeight*.55}});
    };
    measure();const observer=new ResizeObserver(measure);observer.observe(browser.current);return()=>observer.disconnect();
  },[]);
  const text=attack?frame.attackText:frame.normalText;
  return <div className={`comparison-panel ${attack?'attack-panel':'normal-panel'}`}>
    <div className="comparison-label"><span>{attack?'Con la vulnerabilidad':'Uso normal'}</span><span className="comparison-label-mark" aria-hidden="true">{attack?'◇':'◈'}</span></div>
    <div className="comparison-browser" ref={browser}>
      <div className="movie-tab"><span><i/>{kind==='csrf'&&attack?'Promociones':'Campus'}</span><span aria-hidden="true">─ · ×</span></div>
      <div className="movie-address"><span aria-hidden="true">‹ › ↻</span><span>{data.address}</span></div>
      <div className="movie-body">
        <div className="movie-context"><span className="movie-avatar">{kind==='session'&&attack?'?':'A'}</span><div><strong>{data.context}</strong><p>{data.detail}</p></div></div>
        <div className="movie-form"><div className="movie-field-label">{data.label}</div><div ref={field} className={`movie-field ${frame.typing?'typing':''}`}><span>{text}</span>{frame.typing&&<i className="movie-caret" aria-hidden="true"/>}</div></div>
        <div className="movie-action-row">{kind==='sql'?<code>nombre = '{text}'</code>:kind==='csrf'?<span>{attack?'Solicitud preparada a campus.demo':'Formulario del propio sitio'}</span>:<span/>}<div ref={button} className={`movie-fake-button ${frame.clicking?'pressed':''}`}>{frame.processing?'Procesando…':data.button}</div></div>
        <div className="movie-output" role="status" aria-live="polite"><Result kind={kind} attack={attack} data={data} visible={frame.result}/></div>
      </div>
      <AnimatedPointer elapsed={elapsed} timing={frame} points={points} reduced={reduced}/>
    </div>
  </div>;
}

export default function AttackComparison({scene:kind}){
  const scene=attackScenes[kind];const reduced=useReducedMotion();const timing=timingFor(scene);
  const elapsed=useMovieClock(timing.finishAt,reduced);const frame=sceneFrame(scene,elapsed);
  return <div className="comparison-layout"><div className="comparison-heading"><div className="eyebrow">{scene.subject}</div><h1>{scene.title}</h1></div>
    <div className="comparison-pair"><MoviePanel kind={kind} data={scene.normal} elapsed={elapsed} frame={frame} reduced={reduced}/><MoviePanel kind={kind} data={scene.attack} attack elapsed={elapsed} frame={frame} reduced={reduced}/></div>
    <div className={`comparison-conclusion ${frame.result?'visible':''}`}><p>{scene.takeaway}</p></div>
  </div>;
}
