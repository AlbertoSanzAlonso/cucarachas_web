# Skill: Branding Manager (CECSA)

## 🎯 Objetivo
Garantizar que cada componente, sección o imagen añadida al proyecto cumpla estrictamente con la identidad visual "Sanitary Premium Clean" de CECSA.

## 🎨 Paleta de Colores (Obligatoria)
Queda prohibido el uso de colores hexadecimales `hardcoded` en el código. Se deben utilizar exclusivamente las variables CSS definidas en `index.css`:

| Variable | Color | Uso |
| :--- | :--- | :--- |
| `--primary-blue` | `#0080bb` | Fondos de Header, Footer, botones primarios. |
| `--primary-blue-hv` | `#006fa3` | Estado hover de elementos azules. |
| `--accent-green` | `#34d399` | CTAs, iconos de confianza, badges de éxito. |
| `--accent-green-hv` | `#10b981` | Estado hover de CTAs verdes. |
| `--accent-green-dark`| `#064e3b` | Texto sobre fondos verdes (contraste). |
| `--secondary-gray` | `#3c3c3b` | Títulos principales (h1, h2), iconos secundarios. |

## 📐 Tipografía
- **Títulos**: Montserrat (Variantes: 700, 800, 900).
- **Cuerpo**: Inter (Variantes: 400, 500, 600).
- **Acentos**: Lora (Italic) para descriptivos de autoridad.

## 🖼️ Iconografía e Isotipo
- Usar **Lucide React**.
- El isotipo (`/public/assets/isotipo.png`) debe llevar siempre el filtro `brightness(0) invert(1)` cuando esté sobre fondo azul.
- Altura máxima: 60px (Navbar), 40px (Footer).

## 🚀 Regla de Oro (Vercel Integration)
Para componentes de layout (`Navbar`, `Footer`, `FloatingCTA`), los estilos deben ser **inline** (`style={{...}}`) pero **referenciando variables CSS**:
```jsx
// CORRECTO
<div style={{ background: 'var(--primary-blue)' }}>...</div>

// INCORRECTO
<div style={{ background: '#0080bb' }}>...</div>
```
