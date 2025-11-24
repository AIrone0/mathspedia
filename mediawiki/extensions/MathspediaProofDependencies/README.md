# Mathspedia Proof Dependencies Extension

This extension provides a visual dependency tree for mathematical proofs in MediaWiki.

## Features

- **Automatic Dependency Parsing**: Extracts prerequisites from proof pages
- **Interactive Visualization**: Uses Mermaid.js to render dependency graphs
- **Recursive Tree Building**: Builds complete dependency trees automatically
- **Special Page**: Access via `Special:ProofDependencies`

## Usage

### 1. Structure Your Proof Pages

Add a "Requisites" section at the end of each proof page:

```wiki
== Requisites ==
* [[Euclidean algorithm]]
* [[Prime numbers]]
* [[Modular arithmetic]]
```

The extension will automatically extract all linked pages from this section.

### 2. Visualize Dependencies

1. Navigate to `Special:ProofDependencies`
2. Enter the name of a proof (e.g., "Fermat's Last Theorem")
3. Optionally set the maximum depth for recursion
4. Click "Visualize Dependencies"

The extension will:
- Find all prerequisites recursively
- Build a directed dependency graph
- Display it as an interactive Mermaid.js diagram

### 3. Direct URL Access

You can also access directly via URL:
```
Special:ProofDependencies/Fermat's_Last_Theorem
```

Or with parameters:
```
Special:ProofDependencies?proof=Fermat's_Last_Theorem&maxdepth=15
```

## How It Works

1. **Parsing**: The extension looks for `== Requisites ==` sections in proof pages
2. **Extraction**: It extracts all `[[Page Name]]` links from that section
3. **Recursion**: For each prerequisite, it recursively finds their prerequisites
4. **Graph Building**: Creates a directed acyclic graph (DAG) structure
5. **Visualization**: Renders the graph using Mermaid.js

## Example

If you have:
- "Fermat's Last Theorem" requires "Modular arithmetic" and "Elliptic curves"
- "Modular arithmetic" requires "Prime numbers" and "Division algorithm"
- "Prime numbers" requires "Division algorithm"

The visualization will show the complete dependency tree from "Division algorithm" up to "Fermat's Last Theorem".

## Technical Details

- Uses Mermaid.js (loaded from CDN) for client-side rendering
- Prevents infinite loops with cycle detection
- Configurable maximum recursion depth
- Handles non-existent pages gracefully

