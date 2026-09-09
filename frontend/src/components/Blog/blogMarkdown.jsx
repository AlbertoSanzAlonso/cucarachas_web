/** Emojis a color (Unicode) para el blog. */

export const BLOG_EMOJIS = [
  { name: 'Cucaracha', emoji: '🪳' },
  { name: 'Bicho', emoji: '🐛' },
  { name: 'Escudo', emoji: '🛡️' },
  { name: 'OK', emoji: '✅' },
  { name: 'Alerta', emoji: '⚠️' },
  { name: 'Info', emoji: 'ℹ️' },
  { name: 'Casa', emoji: '🏠' },
  { name: 'Edificio', emoji: '🏢' },
  { name: 'Teléfono', emoji: '📞' },
  { name: 'Email', emoji: '✉️' },
  { name: 'Ubicación', emoji: '📍' },
  { name: 'Reloj', emoji: '⏰' },
  { name: 'Hoja', emoji: '🌿' },
  { name: 'Gotas', emoji: '💧' },
  { name: 'Laboratorio', emoji: '🧪' },
  { name: 'Camión', emoji: '🚚' },
  { name: 'Personas', emoji: '👥' },
  { name: 'Corazón', emoji: '💚' },
  { name: 'Estrella', emoji: '⭐' },
  { name: 'Rayo', emoji: '⚡' },
  { name: 'Brillos', emoji: '✨' },
  { name: 'Lupa', emoji: '🔍' },
  { name: 'Like', emoji: '👍' },
  { name: 'Ayuda', emoji: '❓' },
];

/** Compat: shortcodes Lucide antiguos → emoji. */
export const LEGACY_ICON_TO_EMOJI = {
  Bug: '🪳',
  ShieldCheck: '✅',
  Shield: '🛡️',
  Leaf: '🌿',
  Droplets: '💧',
  Home: '🏠',
  Building2: '🏢',
  Phone: '📞',
  Mail: '✉️',
  MapPin: '📍',
  Clock: '⏰',
  CheckCircle2: '✅',
  AlertTriangle: '⚠️',
  Info: 'ℹ️',
  Sparkles: '✨',
  Heart: '💚',
  Users: '👥',
  Truck: '🚚',
  FlaskConical: '🧪',
  Search: '🔍',
  Zap: '⚡',
  Star: '⭐',
  ThumbsUp: '👍',
  CircleHelp: '❓',
};

export const emojiForIconName = (name) => {
  if (!name) return null;
  return LEGACY_ICON_TO_EMOJI[name] || LEGACY_ICON_TO_EMOJI[String(name).trim()] || null;
};

/**
 * Convierte shortcodes/imágenes Lucide a emoji Unicode inline.
 * Ej: ![ShieldCheck](icon:ShieldCheck) → ✅
 */
export const normalizeBlogMarkdown = (markdown = '') =>
  String(markdown)
    .replace(/!\[[^\]]*\]\(\s*icon:([A-Za-z0-9]+)\s*\)/g, (_, name) => emojiForIconName(name) || '')
    .replace(/\{\{\s*icon:([A-Za-z0-9]+)\s*\}\}/g, (_, name) => emojiForIconName(name) || '');

/** Imágenes reales + fallback si el sanitize ha eliminado icon: del src. */
export const blogMarkdownComponents = {
  img: ({ src, alt, ...props }) => {
    const fromSrc =
      typeof src === 'string' && src.startsWith('icon:')
        ? emojiForIconName(src.slice(5))
        : null;
    const fromAlt = emojiForIconName(alt);
    const emoji = fromSrc || fromAlt;

    // Sin src válido + alt de icono conocido, o src icon: → emoji inline
    if (emoji && (fromSrc || !src || String(src).startsWith('icon:'))) {
      return (
        <span className="blog-md-emoji" role="img" aria-label={alt || 'emoji'}>
          {emoji}
        </span>
      );
    }

    if (!src) return null;

    return (
      <img
        src={src}
        alt={alt || ''}
        className="blog-md-image"
        loading="lazy"
        {...props}
      />
    );
  },
};
