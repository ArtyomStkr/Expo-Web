# Skin: Phosphor / Seguridad web

## Referencia y dirección

Inspiración: imagen adjunta de terminal negra con información verde, líneas finas, paneles, geometría y una doble hélice. La referencia determina la apariencia, no el contenido de la exposición. Adaptar su densidad a una presentación legible desde un proyector.

## Lienzo

- Composición horizontal base: **1920 × 1080 (16:9)**.
- Escalar todo el lienzo con `scale(ancho / 1920, alto / 1080)` desde la esquina superior izquierda. Ocupa el viewport completo sin recortar ni generar barras.
- En pantallas de otra proporción se acepta deformación horizontal o vertical: es el comportamiento expansivo solicitado. No cambiar el tamaño de fuente mediante breakpoints.
- Ventana principal enmarcada: márgenes exteriores de 56 px y contenido con 88 px laterales. Barra superior tipo escritorio, sin pie de página. Sin navegación visible, marca de agua ni icono de pantalla completa.
- Laboratorio: solo título centrado; sin encabezado, pie, indicadores, ejemplos ni instrucciones.

## Colores y tipografía

| Uso | Valor |
| --- | --- |
| Fondo | `#050a08` |
| Panel | `#07110c` |
| Acento fósforo | `#00f59b` |
| Texto principal | `#d9eee3` |
| Texto secundario | `#a6bfb1` |
| Metadatos | `#739989` |
| Bordes | `#1c4534` |
| Riesgos | `#d7c58c` |

Títulos: Barlow Condensed, 83–162 px. Texto: Inter, 21–30 px. Código y etiquetas: IBM Plex Mono, 14–24 px. Google Fonts es opcional; hay alternativas locales Arial, Impact y Consolas. El contenido funciona sin conexión después de instalar y compilar.

## Recursos visuales

Paneles rectos, bordes de 1 px, retícula tenue de 60 px, scanlines sutiles. Escudo y hélice generados con SVG; no requieren imágenes externas. La hélice es una metáfora visual de información e identidad, no una representación técnica de un ataque.

Verde para mecanismos y controles; ámbar apagado para consecuencias. Reservar tamaños pequeños a etiquetas secundarias. Evitar párrafos largos y contraste insuficiente en el contenido educativo.

## Movimiento

- Motion: salida y entrada de 250 ms, desplazamiento horizontal según dirección y desenfoque breve de entrada.
- CSS: aparición escalonada de paneles, pulso suave de la hélice y cursor intermitente.
- Sin avance automático, sonido ni destellos rápidos.
- Respetar `prefers-reduced-motion`: quitar animaciones internas y usar transición prácticamente instantánea.

## Interacción

Flechas derecha/izquierda para avanzar/retroceder. También arriba/abajo, PageUp/PageDown, espacio, retroceso, Home y End. Límites sin bucle. Ignorar repeticiones al mantener una tecla y combinaciones con Ctrl, Alt o Meta. El hash `#1` a `#16` permite abrir una diapositiva directamente. Un anuncio accesible comunica únicamente el título; no existen contadores ni indicadores de avance. Escape vuelve al menú, incluso desde #1.

No controles flotantes. F11 depende del navegador; la aplicación no muestra iconos ni solicita pantalla completa automáticamente.

## Ventanas y pantalla de entrada

Apariencia de escritorio de terminal: título en una barra verde oscura, líneas finas, sombra desplazada y símbolos decorativos sin controles de pantalla completa. Mantener fondo negro y verde fósforo de la referencia. Las ventanas no son arrastrables: la composición permanece legible para exponer.

Un fondo continuo con retícula desplazada, brillo suave y columnas de datos animadas acompaña todas las diapositivas, incluida la del laboratorio. Movimiento lento, bajo contraste y sin interferir con la lectura. Se detiene con prefers-reduced-motion.

Pantalla inicial: dos acciones a la izquierda, Diapositivas y Descargar Recursos. Al abrir recursos se muestran los títulos de seis guiones y una guía de demostración, sin nombres de responsables. A la derecha, vista previa desplazable y descarga PDF. Un enlace separado descarga el ZIP del laboratorio listo para extraer. Los PDF se generan en carta con Arial 11 y separación compacta.

El favicon SVG combina un escudo y símbolos de código en verde y negro. Los seis nombres del equipo se conservan en la carátula; los recursos no asignan partes a personas.
