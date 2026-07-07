# Sanus Manducans — instrucciones permanentes

Sitio web de nutrición con contenido científico divulgativo. Stack: Astro 6, colecciones de contenido, TypeScript.

---

## Criterios de escritura — APLICAR SIEMPRE

Estos criterios se aplican a TODOS los artículos individuales y landings híbridas, tanto al crearlos como al revisarlos.

### 1. Tuteo

Dirigirse al lector de «tú» siempre que el contexto sea una recomendación o descripción dirigida a él. Sustituir construcciones impersonales («se recomienda», «es aconsejable», «en dietas que contienen», «el organismo») por frases con «tú» o «tu».

**Excepción:** descripciones puramente técnicas sin lector implícito (reacciones enzimáticas, ecuaciones).

### 2. Didáctico para no expertos

El público objetivo no tiene formación nutricional. Los términos técnicos se mantienen (rigor + SEO) pero se explican en la misma frase o en la siguiente, con em-dash o «es decir».

Ejemplo correcto: «La **selenocisteína** —un aminoácido parecido a la cisteína pero con selenio en lugar de azufre— es el elemento central de las selenoproteínas.»

### 3. Listas con verbos explícitos

Prohibido el patrón «Nombre: sustantivo. Participio. Oración corta.» Cada ítem de lista descriptiva necesita verbo explícito y mini-explicación integrada.

Patrón vetado:
```
Almidón: el polisacárido de reserva de las plantas. Formado por amilosa y amilopectina.
```
Patrón correcto:
```
Almidón: es el polisacárido de reserva de las plantas y está formado por amilosa (cadenas lineales de glucosa) y amilopectina (cadenas muy ramificadas).
```

### 4. SEO

- `title`: keyword exacto del artículo (lo que el usuario buscaría).
- `description`: 140–160 caracteres, incluye el keyword de forma natural.
- Keyword en el primer párrafo y en los H2 donde sea natural.
- H2s con tuteo donde aplique: «¿Cuánta **X** necesitas?», «Fuentes alimentarias de **X**».

### 5. Enlazado interno

- Enlazar en la **primera mención relevante** de cada concepto que tenga página propia.
- Sintaxis Markdown estándar: `[texto](/ruta)` — sin `target="_blank"`.
- Auditar siempre al terminar: `node scripts/audit-enlaces.mjs --archivo=ruta/al/archivo.md`
- Resolver todos los hallazgos antes de dar el artículo por finalizado. Los falsos positivos (e.g. «agua» como molécula química ≠ /nutricion/agua) se resuelven reformulando la frase.

### 6. Enlazado externo

Siempre HTML con `target="_blank" rel="noopener noreferrer"`. Nunca sintaxis Markdown para externos.

```html
<a href="https://..." target="_blank" rel="noopener noreferrer">Texto del enlace</a>
```

### 7. Léxico vetado

No usar nunca:
- «La clave está en», «es importante destacar que», «cabe mencionar que»
- «En definitiva», «en conclusión», «en este sentido», «por otro lado»
- «Además» y «sin embargo» como muletillas de transición
- Adjetivos vacíos: «increíble», «fascinante», «impresionante»

### 8. Voz directa

- Afirmaciones concretas donde la evidencia es sólida.
- Nombrar lo contraintuitivo cuando aparezca, sin enterrarlo en mitad de un párrafo.
- Evitar la pasiva impersonal cuando se puede decir quién hace qué.

### 9. Concreto > abstracto

Cantidades, nombres y mecanismos específicos en la prosa, no solo en tablas. Evitar generalidades como «una ración habitual» cuando se puede decir «200 g de lentejas cocidas».

### 10. Cierre

Cada artículo y cada `que-son.md` de landing híbrida necesita una frase final potente que capture lo más distintivo del tema. No un resumen, no una recomendación genérica: una observación concreta y memorable.

### 11. Prosa inteligible para legos

El público objetivo tiene cero conocimientos de dietética y nutrición. Más allá de explicar los términos técnicos (criterio 2), la prosa en su conjunto debe ser comprensible para alguien sin ninguna formación previa.

- Antes de introducir un mecanismo, el lector debe saber por qué le importa.
- Las frases con múltiples subordinadas se dividen si son difíciles de seguir sin conocimiento previo.
- Cuando se mencionan dos conceptos relacionados, explicitar la relación en lugar de asumirla.
- Si un concepto se desarrolla en otro apartado del mismo artículo, reenviar con «como se explica en el apartado X».
- Prueba de verificación: ¿puede alguien sin formación en nutrición seguir el argumento de principio a fin sin perderse?

---

## Frontmatter obligatorio en artículos individuales

```md
---
title: "Keyword exacto"
description: "140–160 caracteres con keyword natural."
date: YYYY-MM-DD
categoria: "Nombre de la categoría"
draft: false
---
```

Los `que-son.md` de landings híbridas llevan `draft: true`.

---

## Flujo de revisión de un artículo

1. Aplicar los 11 criterios al escribir/reescribir.
2. Ejecutar `node scripts/audit-enlaces.mjs --archivo=ruta`.
3. Resolver todos los hallazgos (reales o falsos positivos reformulando).
4. Segunda auditoría hasta obtener «✅ No se detectaron menciones sin enlace».
5. Revisar léxico vetado, listas con verbos y cierre antes de confirmar.

---

## Memoria adicional

Más contexto en `C:\Users\Rafa\.claude\projects\c--Users-Rafa-Documents-Programacion-Sanus-Manducans\memory\MEMORY.md`:
- Estructura completa del site → `reference_estructura-contenido.md`
- Niveles de landing híbrida → `feedback_landing-hibrida.md`
- Guía editorial completa → `feedback_guia-editorial-textos.md`
