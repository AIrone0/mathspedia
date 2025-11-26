<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# OmniMath Terminal

A retro-futuristic mathematical theorem explorer with local theorem storage and fuzzy search.

## Run Locally

**Prerequisites:** Node.js (or use `nix-shell` if you have Nix)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app:
   ```bash
   npm run dev
   ```

## Creating New Theorems

1. Copy the template:
   ```bash
   cp theorem-template.json theorems/your-theorem-name.json
   ```

2. Edit the new file and fill in the fields

3. The app will automatically detect the new theorem!

## Text Formatting

The `introduction` and `history` fields support rich text formatting:

| Format | Syntax | Example |
|--------|--------|---------|
| **Bold** | `**text**` | `**important**` |
| *Italic* | `*text*` or `_text_` | `*emphasis*` |
| Inline LaTeX | `$latex$` | `$\mathbb{N}$` for ℕ, `$\mathbb{R}$` for ℝ |
| Centered block LaTeX | `$$latex$$` | `$$\sum_{i=1}^n i$$` |
| Indented paragraph | Start with `\t` | `\tThis is indented` |
| Paragraph break | `\n\n` | `First para.\n\nSecond para.` |

### Common LaTeX Symbols

| Symbol | LaTeX |
|--------|-------|
| ℕ (naturals) | `$\mathbb{N}$` |
| ℤ (integers) | `$\mathbb{Z}$` |
| ℚ (rationals) | `$\mathbb{Q}$` |
| ℝ (reals) | `$\mathbb{R}$` |
| ℂ (complex) | `$\mathbb{C}$` |
| ∀ (for all) | `$\forall$` |
| ∃ (exists) | `$\exists$` |
| ∈ (element of) | `$\in$` |
| ⊂ (subset) | `$\subset$` |
| → (arrow) | `$\rightarrow$` |
| ⟹ (implies) | `$\Rightarrow$` |
| ∞ (infinity) | `$\infty$` |
| ∑ (sum) | `$\sum_{i=1}^{n}$` |
| ∏ (product) | `$\prod_{i=1}^{n}$` |
| ∫ (integral) | `$\int_a^b$` |
| √ (sqrt) | `$\sqrt{x}$` |
| Fraction | `$\frac{a}{b}$` |
| Superscript | `$x^2$` |
| Subscript | `$x_i$` |

### Example

```json
{
  "introduction": "The **Fundamental Theorem of Arithmetic** states that every integer $n > 1$ can be represented *uniquely* as a product of prime numbers in $\\mathbb{N}$.\n\n$$n = p_1^{a_1} \\cdot p_2^{a_2} \\cdots p_k^{a_k}$$\n\n\tThis factorization is unique up to the order of factors."
}
```

## Theorem JSON Structure

```json
{
  "id": "theorem-slug",
  "name": "Full Theorem Name",
  "year": 1900,
  "introduction": "Technical summary with **bold**, *italic*, and $LaTeX$",
  "history": "Historical context",
  "dependencies": [...],
  "proofs": [...],
  "implications": [...],
  "requisites": [...],
  "references": [...],
  "externalLinks": [...]
}
```

See `theorem-template.json` for a complete example.
