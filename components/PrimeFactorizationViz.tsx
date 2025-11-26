import React, { useState, useEffect, useCallback, useRef } from 'react';

interface TreeNode {
  value: number;
  isPrime: boolean;
  children: TreeNode[];
  x: number;
  y: number;
  revealed: boolean;
}

// Prime colors for building blocks
const PRIME_COLORS: Record<number, string> = {
  2: '#ff4444',   // Red
  3: '#4488ff',   // Blue
  5: '#44ff44',   // Green
  7: '#ffff44',   // Yellow
  11: '#ff44ff',  // Magenta
  13: '#44ffff',  // Cyan
  17: '#ff8844',  // Orange
  19: '#8844ff',  // Purple
  23: '#ff4488',  // Pink
  29: '#88ff44',  // Lime
};

const getPrimeColor = (p: number): string => {
  return PRIME_COLORS[p] || '#00ff41';
};

const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

const getSmallestPrimeFactor = (n: number): number => {
  if (n < 2) return n;
  if (n % 2 === 0) return 2;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return i;
  }
  return n;
};

const getPrimeFactorization = (n: number): number[] => {
  const factors: number[] = [];
  let remaining = n;
  while (remaining > 1) {
    const p = getSmallestPrimeFactor(remaining);
    factors.push(p);
    remaining = remaining / p;
  }
  return factors;
};

// Calculate tree depth (number of levels below root)
const getTreeDepth = (n: number): number => {
  if (isPrime(n) || n === 1) return 0;
  const p = getSmallestPrimeFactor(n);
  const quotient = n / p;
  return 1 + Math.max(getTreeDepth(p), getTreeDepth(quotient));
};

// Calculate sizing based on number of levels
// x = 200 / (a + 2/3) where a is number of levels, x is vertical distance
// y = 2/3 * x where y is diameter (so radius = x/3)

const calculateSizing = (levels: number): { verticalDistance: number; radius: number } => {
  const verticalDistance = 200 / (levels + 2/3);
  const radius = verticalDistance / 3;
  return { verticalDistance, radius };
};

// Scaled spread: scale=1 is default, scale<1 reduces spreads
// Larger values (120) scale linearly, smaller values (40) scale with sqrt for less reduction
const getSpread = (depth: number, scale: number = 1): number => {
  const minSpread = 40 * Math.pow(scale, 0.3);
  const maxSpread = (120 * scale) / (depth + 1);
  return Math.max(minSpread, maxSpread);
};

// Calculate tree width without building it (for scale calculation)
const calculateTreeWidth = (n: number, radius: number, scale: number = 1): number => {
  const getMinMaxX = (n: number, x: number, depth: number): { minX: number; maxX: number } => {
    if (isPrime(n) || n === 1) return { minX: x, maxX: x };
    const p = getSmallestPrimeFactor(n);
    const quotient = n / p;
    const spread = getSpread(depth, scale);
    const left = getMinMaxX(p, x - spread, depth + 1);
    const right = getMinMaxX(quotient, x + spread, depth + 1);
    return { minX: Math.min(left.minX, right.minX), maxX: Math.max(left.maxX, right.maxX) };
  };
  
  const spread0 = getSpread(0, scale);
  const rootX = radius + spread0;
  const { maxX } = getMinMaxX(n, rootX, 0);
  return maxX + radius; // Total width needed
};

// Find max X in built tree (for viewBox)
const getTreeMaxX = (node: TreeNode): number => {
  if (node.children.length === 0) return node.x;
  return Math.max(node.x, ...node.children.map(getTreeMaxX));
};

// Count total nodes in tree
const countNodes = (node: TreeNode): number => {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
};

const buildTree = (n: number, x: number, y: number, depth: number, verticalDistance: number, scale: number = 1): TreeNode => {
  if (isPrime(n) || n === 1) {
    return { value: n, isPrime: true, children: [], x, y, revealed: false };
  }
  
  const p = getSmallestPrimeFactor(n);
  const quotient = n / p;
  const spread = getSpread(depth, scale);
  
  return {
    value: n,
    isPrime: false,
    children: [
      buildTree(p, x - spread, y + verticalDistance, depth + 1, verticalDistance, scale),
      buildTree(quotient, x + spread, y + verticalDistance, depth + 1, verticalDistance, scale),
    ],
    x,
    y,
    revealed: false,
  };
};
const PrimeFactorizationViz: React.FC = () => {
  const [inputValue, setInputValue] = useState('60');
  const [number, setNumber] = useState(60);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [factors, setFactors] = useState<number[]>([]);
  const [showBlocks, setShowBlocks] = useState(false);
  const [pathAnimation, setPathAnimation] = useState<number[]>([]);
  const [nodeRadius, setNodeRadius] = useState(20);
  const [viewBoxWidth, setViewBoxWidth] = useState(300);
  const [totalNodes, setTotalNodes] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  const initializeAnimation = useCallback((n: number) => {
    const depth = getTreeDepth(n);
    const { verticalDistance, radius } = calculateSizing(depth);
    
    // Get container width
    const containerWidth = containerRef.current?.clientWidth || 300;
    
    // Calculate tree width with default scale
    const defaultWidth = calculateTreeWidth(n, radius, 1);
    
    // Calculate scale factor if tree is too wide
    let scale = 1;
    if (defaultWidth > containerWidth) {
      scale = containerWidth / defaultWidth;
    }
    
    // Calculate root X with (possibly scaled) spread
    const spread0 = getSpread(0, scale);
    const rootX = radius + spread0;
    
    // Build tree with scale
    const newTree = buildTree(n, rootX, radius, 0, verticalDistance, scale);
    
    // Calculate actual viewBox width from built tree
    const actualMaxX = getTreeMaxX(newTree);
    const actualViewBoxWidth = actualMaxX + radius;
    
    console.log('=== Tree Sizing Debug ===');
    console.log(`Number: ${n}`);
    console.log(`Levels (depth): ${depth}`);
    console.log(`Formula: x = 200 / (${depth} + 2/3) = 200 / ${(depth + 2/3).toFixed(3)} = ${verticalDistance.toFixed(2)}`);
    console.log(`Vertical distance (x): ${verticalDistance.toFixed(2)}`);
    console.log(`Diameter (y = 2/3 * x): ${(verticalDistance * 2/3).toFixed(2)}`);
    console.log(`Radius (y/2 = x/3): ${radius.toFixed(2)}`);
    console.log(`Root Y position: ${radius.toFixed(2)}`);
    console.log(`Bottom of last node: ${(radius + depth * verticalDistance + radius).toFixed(2)}`);
    console.log(`--- Width positioning ---`);
    console.log(`Container width: ${containerWidth}`);
    console.log(`Default tree width: ${defaultWidth.toFixed(2)}`);
    console.log(`Scale factor: ${scale.toFixed(3)}`);
    console.log(`Spread at depth 0 (scaled): ${spread0.toFixed(2)}`);
    console.log(`Root X: ${rootX.toFixed(2)}`);
    console.log(`Actual viewBox width: ${actualViewBoxWidth.toFixed(2)}`);
    console.log('=========================');
    
    const nodeCount = countNodes(newTree);
    
    setNodeRadius(radius);
    setViewBoxWidth(actualViewBoxWidth);
    setTotalNodes(nodeCount);
    setTree(newTree);
    setFactors(getPrimeFactorization(n));
    setAnimationStep(0);
    setShowBlocks(false);
    setPathAnimation([n]);
    
    console.log(`Total nodes: ${nodeCount}`);
  }, []);

  useEffect(() => {
    initializeAnimation(number);
  }, [number, initializeAnimation]);

  // Animate tree revelation - reveal by depth level
  useEffect(() => {
    if (!tree) return;
    
    const revealByDepth = (node: TreeNode, currentDepth: number, maxDepth: number): TreeNode => {
      const newNode = { ...node, revealed: currentDepth <= maxDepth };
      if (node.children.length > 0) {
        newNode.children = node.children.map(child => 
          revealByDepth(child, currentDepth + 1, maxDepth)
        );
      }
      return newNode;
    };

    const timer = setTimeout(() => {
      if (animationStep < totalNodes) {
        setTree(prev => prev ? revealByDepth(prev, 0, animationStep) : null);
        setAnimationStep(prev => prev + 1);
      } else if (animationStep === totalNodes) {
        setShowBlocks(true);
        setAnimationStep(prev => prev + 1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [animationStep, tree, totalNodes]);

  // Path animation - starts after tree is mostly revealed
  useEffect(() => {
    if (animationStep > Math.floor(totalNodes / 2) && pathAnimation.length > 0) {
      const last = pathAnimation[pathAnimation.length - 1];
      if (last > 1) {
        const timer = setTimeout(() => {
          const p = getSmallestPrimeFactor(last);
          setPathAnimation(prev => [...prev, last / p]);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [pathAnimation, animationStep, totalNodes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(inputValue);
    if (n > 1 && n <= 9999) {
      setNumber(n);
    }
  };

  const renderTree = (node: TreeNode): React.ReactNode => {
    if (!node.revealed) return null;

    const nodeColor = node.isPrime ? getPrimeColor(node.value) : '#00ff41';
    const lineOffset = nodeRadius * 0.6;
    const fontSize = Math.max(8, nodeRadius * 0.6);

    return (
      <g key={`${node.x}-${node.y}-${node.value}`}>
        {/* Lines to children */}
        {node.children.map((child, i) => child.revealed && (
          <line
            key={i}
            x1={node.x}
            y1={node.y + lineOffset}
            x2={child.x}
            y2={child.y - lineOffset}
            stroke="#003b00"
            strokeWidth="2"
          />
        ))}
        
        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill="#000"
          stroke={nodeColor}
          strokeWidth="2"
        />
        
        {/* Node value */}
        <text
          x={node.x}
          y={node.y + fontSize * 0.35}
          textAnchor="middle"
          fill={nodeColor}
          fontSize={node.value > 99 ? fontSize * 0.8 : fontSize}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {node.value}
        </text>
        
        {/* Render children */}
        {node.children.map(child => renderTree(child))}
      </g>
    );
  };

  // Count prime occurrences for display
  const primeCount: Record<number, number> = {};
  factors.forEach(p => {
    primeCount[p] = (primeCount[p] || 0) + 1;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          min="2"
          max="9999"
          className="flex-1 bg-black border border-term-dim px-2 py-1 text-term-fg font-mono text-sm focus:border-term-fg focus:outline-none"
          placeholder="Enter number..."
        />
        <button
          type="submit"
          className="px-3 py-1 border border-term-dim text-term-dim hover:border-term-fg hover:text-term-fg text-xs"
        >
          GO
        </button>
      </form>

      {/* Factorization Tree */}
      <div ref={containerRef} className="flex-1 border border-term-dim bg-[#020202] relative overflow-hidden mb-3">
        <div className="absolute top-1 left-2 text-[10px] text-term-dim">FACTORIZATION_TREE</div>
        <svg width="100%" height="200" viewBox={`0 0 ${viewBoxWidth} 200`} className="mt-4">
          {tree && renderTree(tree)}
        </svg>
      </div>

      {/* Building Blocks */}
      {showBlocks && (
        <div className="border border-term-dim bg-[#020202] p-2 mb-3 animate-fade-in">
          <div className="text-[10px] text-term-dim mb-2">PRIME_BLOCKS</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {factors.map((p, i) => (
              <div
                key={i}
                className="w-8 h-8 flex items-center justify-center font-bold text-black text-sm rounded-sm"
                style={{
                  backgroundColor: getPrimeColor(p),
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {showBlocks && (
        <div className="border border-term-dim bg-[#020202] p-2 animate-fade-in">
          <div className="text-[10px] text-term-dim mb-1">UNIQUE_FACTORIZATION</div>
          <div className="text-center font-mono">
            <span className="text-term-fg text-lg">{number}</span>
            <span className="text-term-dim mx-2">=</span>
            {Object.entries(primeCount).map(([prime, count], i) => (
              <span key={prime}>
                {i > 0 && <span className="text-term-dim mx-1">×</span>}
                <span style={{ color: getPrimeColor(parseInt(prime)) }}>
                  {prime}
                  {count > 1 && <sup>{count}</sup>}
                </span>
              </span>
            ))}
          </div>
          
          {/* Path animation */}
          <div className="mt-2 text-[10px] text-term-dim">
            PATH_TO_1: {pathAnimation.map((n, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">→</span>}
                <span className={n === 1 ? 'text-term-fg' : 'text-term-accent'}>{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PrimeFactorizationViz;

