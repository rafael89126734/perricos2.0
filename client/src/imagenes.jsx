// imagenes.js — banco de fotografías reales (Unsplash, licencia libre) por tema,
// con respaldo automático si alguna URL falla.
import React, { useState } from 'react';
import { PawPrint } from 'lucide-react';

const u = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

// Fotos por tema (perros / gatos / otros animales)
export const FOTOS = {
  perros: [
    u('1543466835-00a7907e9de1', 900),  // perro sonriente (Bonito 1)
    u('1552053831-71594a27632d', 900),  // cachorro golden (Bonito 2)
    u('1548199973-03cce0bbc87b', 900),  // dos perros corriendo (Bonito 3)
    u('1537151601673-57a77bc997c7', 900), // labrador blanco muy bonito (Sustituye al pug)
    u('1583511655857-d19b40a7a54e', 900), // cachorro
    u('1587300003388-59208cc962cb', 900), // perro y gato
  ],
  gatos: [
    u('1514888286974-6c03e2ca1dba', 900), // gato clásico
    u('1573865526739-10659fec78a5', 900), // gato gris
    u('1592194996308-7b43878e84a6', 900), // gatito
    u('1533738363-b7f9aef128ce', 900),  // gato con corbata
    u('1518791841217-8f162f1e1131', 900), // gato blanco
  ],
  varios: [
    u('1522069169874-c58ec4b76be5', 900), // pez dorado
    u('1552728089-57bdde30beb3', 900),    // guacamaya
    u('1585110396000-c9ffd4e4b308', 900), // conejo
    u('1425082661705-1834bfd09dca', 900), // hámster
  ],
};

export const HERO = u('1552053831-71594a27632d', 1400); // cachorro golden

export function imagenCategoria(nombre) {
  const c = (nombre || '').toLowerCase();
  if (c.includes('perro')) return FOTOS.perros[2];
  if (c.includes('gato')) return FOTOS.gatos[0];
  //antes: return FOTOS.varios[1] // guacamaya para "Peces y Varios"
  //ahora: el "peces y varios" debe mostrar el pez (índice 0)
  return FOTOS.varios[0];
}

// Elige una foto coherente según el nombre/categoría del producto
export function imagenProducto(p) {
  if (p?.imagen) return p.imagen.startsWith('http') ? p.imagen : `/uploads/${p.imagen}`;
  const texto = `${p?.nombre || ''} ${p?.categoria || ''}`.toLowerCase();
  
  if (/ganador premium/.test(texto)) return FOTOS.perros[0]; // Perro sonriente
  if (/nupec/.test(texto)) return FOTOS.perros[5]; // Perro y gato (Diferente)
  if (/ganador/.test(texto)) return FOTOS.perros[4]; // Cachorro (Diferente)
  if (/minino/.test(texto)) return FOTOS.gatos[2]; // Gatito
  
  let pool = FOTOS.varios;
  if (/gato|felin|kitten|cat/.test(texto)) pool = FOTOS.gatos;
  else if (/perro|canin|cachorr|dog|puppy/.test(texto)) pool = FOTOS.perros;
  else if (/pez|acuario|fish/.test(texto)) pool = [FOTOS.varios[0]];
  else if (/ave|pájaro|paro|perico|loro|hamster|conejo/.test(texto)) pool = [FOTOS.varios[0]];
  const id = Number(p?.id || 0);
  return pool[id % pool.length];
}

// SVG de respaldo (huella sobre crema) si una imagen falla
const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#F1EDE4"/>
      <g fill="#18271F" fill-opacity="0.55" transform="translate(400 300)">
        <ellipse cx="0" cy="30" rx="58" ry="72"/>
        <ellipse cx="-78" cy="-28" rx="30" ry="40"/>
        <ellipse cx="0" cy="-52" rx="30" ry="40"/>
        <ellipse cx="78" cy="-28" rx="30" ry="40"/>
      </g>
    </svg>`
  );

// <Foto>: imagen con zoom suave y respaldo automático
export function Foto({ src, alt = '', className = '', frame = false, ...rest }) {
  const [fallback, setFallback] = useState(false);
  const real = fallback ? FALLBACK : src;
  const img = (
    <img
      src={real}
      alt={alt}
      loading="lazy"
      onError={() => setFallback(true)}
      className={className}
      {...rest}
    />
  );
  return frame ? <div className="img-frame">{img}</div> : img;
}

export function FotoFallbackBox({ className = '' }) {
  return (
    <div className={`img-frame flex items-center justify-center bg-[var(--marfil-2)] ${className}`}>
      <PawPrint size={42} className="text-[var(--bosque)]/30" />
    </div>
  );
}
