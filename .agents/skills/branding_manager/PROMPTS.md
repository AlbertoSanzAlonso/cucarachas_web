# Prompt Guidelines for CECSA Image Generation

To maintain the **"Sanitary Premium Clean"** aesthetic and ensure the website remains **fobia-friendly (katsaridaphobia)**, follow these instructions when generating new insect or technical imagery.

## 🪳 Technical Line Art Illustrations (Fobia-Friendly)

Use this prompt pattern for representing cockroaches or other pests without using realistic photography.

### The Master Prompt Pattern:
> "Minimalist technical line art illustration of a **[SPECIES NAME]** from a **3/4 perspective angle**. Clean thin corporate blue lines on a solid pure white background. ONLY the drawing of the insect, NO text, NO labels, NO annotations, NO frames. Scientific precision, clinical look, professional pest control graphic. Premium and elegant. Pure white background for easy blend."

### Specific Examples:
- **Blattella Germanica**: "Minimalist technical line art illustration of a Blattella germanica cockroach from a 3/4 perspective angle..."
- **Periplaneta Americana**: "Minimalist technical line art illustration of a Periplaneta americana cockroach from a 3/4 perspective angle..."
- **Blatta Orientalis**: "Minimalist technical line art illustration of a Blatta orientalis cockroach from a 3/4 perspective angle..."
- **Supella Longipalpa**: "Minimalist technical line art illustration of a Supella longipalpa (Brown-banded cockroach) from a 3/4 perspective angle..."

---

## 📸 Lifestyle & Technical Photography

When generating photography for the Hero Slider or Origen services:

- **Keywords**: "Sanitary clean", "Pure white background", "Clinical", "Studio lighting", "Hyper-detailed", "Premium corporate".
- **Color Palette**: Focus on whites, light grays, and the corporate blue (`#0080bb`).
- **Tone**: Respectful, professional, and authoritarian but modern.

## 🛠 Usage in Development
When using these images in React components, always apply:
- `mix-blend-mode: multiply` (to make the white background transparent).
- `opacity: 0.7 to 0.9` (to soften the technical lines and blend with the UI).
- `transition-all duration-500` for hover effects.
