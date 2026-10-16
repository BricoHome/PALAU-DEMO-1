# Web demo · Elit Futbol Club Palau-Saverdera

Web estática (HTML + CSS + JS), sin base de datos ni programas que instalar.
Todo el contenido está en la carpeta `data/`: para cambiar algo solo hay que editar un archivo.

Catalán por defecto, con botón para pasar a castellano.
Los datos actuales son de **ejemplo** (se marcan como "Exemple" en la web). Con `"demoMode": true` en `data/site.json` aparece la franja verde de demostración y las etiquetas; ponlo en `false` cuando los datos sean reales.

---

## 1. Qué hay en la carpeta

| Carpeta / archivo | Para qué sirve |
|---|---|
| `index.html` | Página principal (todas las secciones) |
| `equip.html` | Página de cada equipo (plantilla, calendario, clasificación). Se abre con `equip.html?id=juvenil` |
| `data/` | **Aquí se edita todo** (ver apartado 2) |
| `assets/img/` | Logo, favicon y fotos |
| `assets/og.jpg` | Imagen que sale al compartir el enlace por WhatsApp |
| `css/style.css` | Diseño. Los colores están al principio (`:root`) |
| `js/app.js` | Código que lee los datos y los pinta. No hace falta tocarlo |
| `vendor/`, `assets/fonts/` | Librerías de animación (GSAP, Lenis) y fuentes, guardadas en local para que cargue rápido |
| `netlify.toml` | Configuración para publicar en Netlify |

---

## 2. Cómo editar los datos (pasos sencillos)

Cada archivo de `data/` es un listado. **Cada partido, jugador o noticia ocupa una línea.** Reglas para no romper nada:
- Respeta las comillas `" "` y las comas al final de cada línea (excepto en la última línea de un listado).
- Si algo se rompe, copia el contenido en https://jsonlint.com para ver dónde está el fallo.
- Usa un editor de texto normal (por ejemplo, el propio editor de GitHub o Visual Studio Code), no Word.

### Poner un resultado
1. Abre `data/matches.json`.
2. Busca el partido (por fecha y equipo).
3. Cambia `"scoreFor": null, "scoreAgainst": null` por los goles: `scoreFor` = goles **del club**, `scoreAgainst` = goles del rival (da igual si juega en casa o fuera).
4. Guarda. El partido pasa solo de "Propers partits" a "Resultats" y suma al contador "Partits jugats". La tabla de clasificación se edita aparte (ver más abajo).

### Añadir un partido
1. En `data/matches.json`, copia una línea entera y pégala debajo.
2. Cambia `id` (número que no se repita), `team` (id del equipo: `senior`, `juvenil`…), `date` (`2026-11-08`), `time` (`17:00`), `home` (`true` si juega en casa, `false` si juega fuera), `opponent` y `venue`.
3. Deja `scoreFor` y `scoreAgainst` en `null` hasta que se juegue.

El "próximo partido" de la portada y la cuenta atrás se calculan solos: cogen el partido más cercano del equipo que marca `featuredTeam` en `data/site.json`.

### Añadir o cambiar jugadores
1. Abre `data/players.json`. Los jugadores están agrupados por el id del equipo.
2. Copia una línea y cambia `num` (dorsal), `name`, `pos` (`POR`, `DEF`, `MIG` o `DAV`) y, si tienes foto, `photo` (por ejemplo `"assets/img/jugadores/10.jpg"`).

### Añadir una noticia
1. Abre `data/news.json` y copia un bloque.
2. Cambia fecha (`date`), etiqueta (`tag`), título (`title`), resumen (`excerpt`) en catalán (`ca`) y castellano (`es`), y la foto (`image`).
3. En la portada salen las 3 más recientes.

### Añadir un equipo nuevo
1. `data/teams.json`: copia un bloque y cambia el `id` (sin espacios ni acentos) y los nombres.
2. `data/players.json`: añade `"idnuevo": [ ... ]` con sus jugadores.
3. `data/standings.json`: añade `"idnuevo": [ ... ]` con las filas de la clasificación. Los puntos se calculan solos (3 por victoria, 1 por empate). La fila del club lleva `"us": true`.
4. Los partidos del equipo se añaden en `data/matches.json` con `"team": "idnuevo"`.
5. La página `equip.html?id=idnuevo` ya funciona sin hacer nada más.

### Cambiar la clasificación
Abre `data/standings.json`, busca el equipo y edita las filas: `pj` (jugados), `g` (ganados), `e` (empatados), `p` (perdidos), `gf` (goles a favor), `gc` (goles en contra).

### Patrocinadores y socios
- `data/sponsors.json`: nombre, `logo` (ruta de la imagen) y `url` (web del patrocinador, opcional).
- `data/members.json`: cuotas, nombre y ventajas de cada tipo de socio.

### Teléfono, email, dirección, redes, WhatsApp
`data/site.json`. Importante: `phone`, `whatsapp` (con prefijo, sin `+` ni espacios: `34600000000`) y `email` son de **ejemplo**; hay que poner los reales. Si `instagram` está vacío no se muestra.

### Cambiar textos fijos de la web
`data/i18n.json` (catalán `ca` y castellano `es`). Cada texto tiene el mismo nombre en los dos idiomas.

### Fotos
1. Sube las fotos a `assets/img/` (mejor en `.jpg` o `.webp`, ancho máximo 1600 px, menos de 300 KB cada una para que cargue rápido).
2. Foto de portada: en `data/site.json`, `"heroImage": "assets/img/portada.jpg"`.
3. Foto de una noticia o jugador: escribe la ruta en `image` / `photo` de su línea.
4. Logos de patrocinadores: ruta en `logo`.

---

## 3. Ver la web en tu ordenador (opcional)

La web **no se abre haciendo doble clic en `index.html`** (el navegador bloquea la lectura de los datos). Dos opciones:
- La más fácil: súbela a Netlify (apartado 4) y míralo allí.
- Con Node instalado: abre una terminal en esta carpeta y escribe `npx serve .`, luego entra en la dirección que te indica.

---

## 4. Publicar (GitHub + Netlify)

1. En GitHub, crea un repositorio nuevo (por ejemplo `web-palau-saverdera`) y sube **el contenido de esta carpeta** (que `index.html` quede en la raíz).
2. En Netlify: **Add new site → Import an existing project → GitHub** y elige el repositorio. No hace falta cambiar nada: `netlify.toml` ya lo configura.
3. Netlify te da una dirección tipo `algo.netlify.app`. Cada cambio que guardes en GitHub se publica solo en un minuto.
4. Formulario de cantera: Netlify lo detecta solo. Las inscripciones llegan a **Netlify → Forms**. Para recibirlas por email: *Site configuration → Forms → Form notifications*.

---

## 5. Antes de enseñarla como web definitiva (checklist)

- [ ] Poner datos reales en `site.json` (teléfono, email, WhatsApp) y `"demoMode": false`.
- [ ] Sustituir equipos, jugadores, partidos, noticias, cuotas y patrocinadores de ejemplo por los reales (o quitar lo que no tengan).
- [ ] Añadir fotos reales (portada, equipos, jugadores, noticias).
- [ ] Pedir al club el escudo en alta resolución o vectorial (SVG/PDF). El que usamos viene de una imagen pequeña.
- [ ] Quitar `noindex` (en `<head>` de `index.html` y `equip.html`) y borrar `robots.txt` para que salga en Google.
- [ ] Añadir aviso legal y política de privacidad: el formulario de cantera recoge datos de menores y de sus tutores. Esta demo **no incluye** esos textos legales, hay que hacerlos con el club (o con un asesor).
- [ ] Revisar que las cuotas de socio y los textos de cantera los valida el club.
- [ ] Mapa: se centra en el pueblo; si quieres un punto exacto del campo, sustituye el mapa por el enlace de Google Maps que te dé el club.
- [ ] Si Instagram / X / YouTube existen, ponerlos en `site.json`.

---

## 6. Reutilizar para otro club

1. Cambia el logo en `assets/img/` (`logo.png`, `favicon.png`, `apple-touch-icon.png`) y la imagen `assets/og.jpg`.
2. Cambia los colores en `css/style.css` (variables `--navy`, `--yellow`, `--green` al principio del archivo).
3. Cambia los textos de `data/` y, si hace falta, el nombre y las categorías.
