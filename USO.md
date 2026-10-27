# ExposicionesDi

## Presentación

Con Node.js 22.12 o posterior, ejecutar npm ci y npm run dev desde esta carpeta. Abrir la dirección local que imprime Vite. La pantalla inicial ofrece Diapositivas y Descargar Recursos.

En las diapositivas, flechas derecha e izquierda avanzan o retroceden. También funcionan espacio, PageUp, PageDown, Home y End. Escape vuelve al menú desde cualquier diapositiva, incluida #1. No hay contadores, barra de avance ni controles visibles. El lienzo base 1920 × 1080 se estira hasta ocupar la pantalla.

## Recursos

recursos/ contiene seis guiones sin asignación de responsables y con diccionario técnico. Total aproximado del texto oral: 6.837 palabras, unos 47 minutos para todo el grupo a 145 palabras por minuto, sin contar pausas ni demostración. Ensayar antes de exponer; la duración real depende del ritmo.

ejemplo-flask.md contiene solo los pasos para preparar y realizar las demostraciones. laboratorio-flask/ contiene el código y el lanzador. Los siete PDF carta, Arial 11 y espaciado compacto, y el ZIP listo para extraer se sirven desde public/recursos/ y se descargan desde la interfaz. Los nombres del equipo aparecen únicamente en la carátula.

## Laboratorio

Extraer laboratorio-flask.zip y ejecutar INICIAR.cmd en Windows o python3 main.py en macOS/Linux. Requiere Python 3.11 o posterior y conexión la primera vez para instalar bibliotecas. Después abre automáticamente una aplicación en 127.0.0.1 y un puerto libre. Detener con Ctrl+C. Solo contiene registros ficticios en memoria y sus rutas vulnerables son material educativo para uso local.

## Compilación y publicación

npm run build genera dist/. Los recursos ya generados están versionados. Un manifiesto de hashes permite reutilizarlos en GitHub Actions sin instalar Python ni disponer de Arial en Linux.

Si se modifican guiones, guía o laboratorio, ejecutar npm run resources para regenerar PDF y ZIP. Para esta operación se necesitan Python, reportlab y los archivos TTF de Arial. En Windows se detecta C:/Windows/Fonts/arial.ttf. Las variables RESOURCE_PYTHON, RESOURCE_ARIAL y RESOURCE_ARIAL_BOLD permiten indicar otras rutas locales. No se distribuyen las fuentes propietarias.

El workflow .github/workflows/pages.yml compila y publica dist/ en GitHub Pages al actualizar main. Solo se publica el frontend estático con recursos descargables; Flask no se ejecuta en GitHub Pages. El repositorio excluye README, node_modules, entornos virtuales, cachés, capturas de revisión y registros locales.

## Pruebas animadas para la exposición

Se conservan las diapositivas explicativas y se intercalan cuatro pruebas después de explicar SQLi, XSS, CSRF y sesiones. Cada prueba muestra dos ventanas: uso normal a la izquierda y abuso de la vulnerabilidad a la derecha. Al avanzar con la flecha siguiente se reproduce automáticamente la escritura de datos, el desplazamiento de un cursor dibujado, un clic y los resultados comparados. No contiene formularios editables, botones operativos, selección de opciones, ayudas de teclado ni controles de reproducción.

La secuencia se detiene al mostrar el resultado. La siguiente flecha cambia de diapositiva; volver a entrar reproduce la animación desde el inicio. El cursor real permanece oculto durante la exposición. La entrada se representa como texto: no se ejecutan ataques ni peticiones reales. Con movimiento reducido se muestran directamente ambos resultados.

El cierre es una única pantalla de Gracias. No hay preguntas, fuentes ni referencias a los recursos dentro de la exposición. Los PDF y el ZIP se conservan en el menú para uso del equipo. El laboratorio práctico queda reservado con su título.

Ejecutar npm run test:storyboards para comprobar el orden de escritura, clic y resultado de las cuatro secuencias.

Los guiones incluyen un libreto para narrar cada comparación animada y notas de operación separadas del discurso. El ejemplo XSS compara un saludo con un comentario que provoca un aviso falso de bloqueo; no representa la extracción de un correo.
