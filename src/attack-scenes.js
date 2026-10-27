// Storyboards only: the supplied strings are drawn as text, never evaluated.
export const attackScenes = {
  sql: {
    title:'Una búsqueda. Dos resultados.', subject:'INYECCIÓN SQL',
    normal:{address:'campus.demo/estudiantes',context:'Ana consulta su registro',detail:'Directorio de estudiantes',label:'Nombre del estudiante',value:'ana',button:'Buscar',result:'Solo aparece Ana',explanation:'La búsqueda devuelve el registro solicitado.'},
    attack:{address:'campus.demo/estudiantes',context:'La entrada modifica la consulta',detail:'El programa pega texto en la orden SQL',label:'Nombre del estudiante',value:"' OR '1'='1",button:'Buscar',result:'También aparecen datos de Bruno',explanation:'La condición añadida hace que se devuelvan ambos registros.'},
    takeaway:'Al mezclar la entrada con la orden SQL, una búsqueda termina mostrando información ajena.',
  },
  xss: {
    title:'Un comentario provoca un aviso falso.', subject:'CROSS-SITE SCRIPTING',
    normal:{address:'campus.demo/comentarios',context:'Ana visita los comentarios del curso',detail:'Un estudiante publica un saludo',label:'Comentario del estudiante',value:'Hola, qué buen curso.',button:'Publicar',result:'Ana lee un comentario normal',explanation:'El saludo aparece en la página. No se ejecuta ninguna instrucción.'},
    attack:{address:'campus.demo/comentarios',context:'Ana visita los comentarios del curso',detail:'Otra persona prepara un comentario con código',label:'Comentario preparado por el atacante',value:"<script>alert('Tu cuenta fue bloqueada')</script>",button:'Publicar',result:'El comentario ejecuta una instrucción',explanation:'El aviso lo creó el comentario del atacante. No es un mensaje legítimo del sitio.'},
    takeaway:'Ana esperaba leer un comentario. La página ejecutó su contenido y mostró un aviso falso: eso es XSS.',
  },
  csrf: {
    title:'La misma cuenta. Otra intención.', subject:'SOLICITUD FORJADA / CSRF',
    normal:{address:'campus.demo/mi-perfil',context:'Ana edita su propio perfil',detail:'Correo actual: ana@aula.test',label:'Nuevo correo solicitado por Ana',value:'ana.nuevo@aula.test',button:'Guardar correo',result:'Ana realiza el cambio que eligió',explanation:'El formulario legítimo envía la acción y su token CSRF.'},
    attack:{address:'premios.demo/cupon',context:'Otra página prepara una solicitud',detail:'Ana sigue conectada a campus.demo',label:'Correo incluido en la petición oculta',value:'tercero@ejemplo.test',button:'Ver mi cupón',result:'El correo cambia sin que Ana lo pida',explanation:'El sitio vulnerable acepta la petición solo por reconocer la cookie.'},
    takeaway:'Si el navegador adjunta la cookie y el servidor no valida la acción, otra página puede provocar el cambio.',
  },
  session: {
    title:'Una credencial en otras manos.', subject:'SECUESTRO DE SESIÓN',
    normal:{address:'campus.demo/mi-cuenta',context:'Navegador de Ana',detail:'La propietaria continúa su sesión',label:'Credencial que envía el navegador',value:'session=ana-demo-7A9',button:'Continuar',result:'Ana continúa conectada',explanation:'La aplicación reconoce su credencial de sesión válida.'},
    attack:{address:'campus.demo/mi-cuenta',context:'Otro navegador: una persona ajena',detail:'Dispone de una copia de la credencial',label:'Credencial copiada que presenta',value:'session=ana-demo-7A9',button:'Continuar',result:'Otra persona entra como Ana',explanation:'El servidor sigue aceptando la copia porque la credencial aún es válida.'},
    takeaway:'La copia de una credencial válida puede permitir suplantar la sesión, aunque no se escriba una contraseña.',
  },
};

export function timingFor(scene){
  const typingAt=1550;
  const typingDuration=Math.max(2000,Math.max(scene.normal.value.length,scene.attack.value.length)*65);
  const moveAt=typingAt+typingDuration+650;
  const clickAt=moveAt+850;
  const resultAt=clickAt+1000;
  return {typingAt,typingDuration,moveAt,clickAt,resultAt,finishAt:resultAt+1000};
}

export function sceneFrame(scene,elapsed){
  const timing=timingFor(scene);
  const count=Math.max(0,Math.floor((elapsed-timing.typingAt)/65));
  return {...timing,
    normalText:scene.normal.value.slice(0,count),attackText:scene.attack.value.slice(0,count),
    typing:elapsed>=timing.typingAt&&elapsed<timing.moveAt,
    clicking:elapsed>=timing.clickAt&&elapsed<timing.clickAt+450,
    processing:elapsed>=timing.clickAt+450&&elapsed<timing.resultAt,
    result:elapsed>=timing.resultAt,
    settled:elapsed>=timing.finishAt,
  };
}
