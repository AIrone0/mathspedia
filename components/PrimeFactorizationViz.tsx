import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface TreeNode {
  value: number;
  isPrime: boolean;
  children: TreeNode[];
  x: number;
  y: number;
}

interface TreeBuildResult {
  tree: TreeNode;
  depth: number;
  nodeCount: number;
  maxX: number;
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

// Memoization cache for smallest prime factor
const smallestPrimeFactorCache = new Map<number, number>();

const getSmallestPrimeFactor = (n: number): number => {
  if (n < 2) return n;
  
  const cached = smallestPrimeFactorCache.get(n);
  if (cached !== undefined) return cached;
  
  let result: number;
  if (n % 2 === 0) {
    result = 2;
  } else {
    result = n;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) {
        result = i;
        break;
      }
    }
  }
  
  smallestPrimeFactorCache.set(n, result);
  return result;
};

// isPrime leverages memoized getSmallestPrimeFactor
const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  return getSmallestPrimeFactor(n) === n;
};

// Get prime factorization using memoized smallest prime factor
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

// Calculate sizing based on number of levels
const calculateSizing = (levels: number): { verticalDistance: number; radius: number } => {
  const verticalDistance = 200 / (levels + 2/3);
  const radius = verticalDistance / 3;
  return { verticalDistance, radius };
};

// Scaled spread: scale=1 is default, scale<1 reduces spreads
const getSpread = (depth: number, scale: number = 1): number => {
  const minSpread = 40 * Math.pow(scale, 0.3);
  const maxSpread = (120 * scale) / (depth + 1);
  return Math.max(minSpread, maxSpread);
};

// Quick depth calculation for initial sizing (before we know scale)
const getTreeDepth = (n: number): number => {
  if (isPrime(n) || n === 1) return 0;
  const p = getSmallestPrimeFactor(n);
  return 1 + Math.max(getTreeDepth(p), getTreeDepth(n / p));
};

// Calculate tree width without building it (for scale calculation)
const calculateTreeWidth = (n: number, radius: number, scale: number = 1): number => {
  const getMaxX = (n: number, x: number, depth: number): number => {
    if (isPrime(n) || n === 1) return x;
    const p = getSmallestPrimeFactor(n);
    const spread = getSpread(depth, scale);
    return Math.max(
      getMaxX(p, x - spread, depth + 1),
      getMaxX(n / p, x + spread, depth + 1)
    );
  };
  
  const spread0 = getSpread(0, scale);
  const rootX = radius + spread0;
  return getMaxX(n, rootX, 0) + radius;
};

// Combined tree building that returns all metadata in single traversal
const buildTreeWithMetadata = (
  n: number,
  x: number,
  y: number,
  depth: number,
  verticalDistance: number,
  scale: number = 1
): TreeBuildResult => {
  const isNodePrime = isPrime(n) || n === 1;
  
  if (isNodePrime) {
    return {
      tree: { value: n, isPrime: true, children: [], x, y },
      depth: 0,
      nodeCount: 1,
      maxX: x,
    };
  }
  
  const p = getSmallestPrimeFactor(n);
  const quotient = n / p;
  const spread = getSpread(depth, scale);
  const childY = y + verticalDistance;
  
  const left = buildTreeWithMetadata(p, x - spread, childY, depth + 1, verticalDistance, scale);
  const right = buildTreeWithMetadata(quotient, x + spread, childY, depth + 1, verticalDistance, scale);
  
  return {
    tree: {
      value: n,
      isPrime: false,
      children: [left.tree, right.tree],
      x,
      y,
    },
    depth: 1 + Math.max(left.depth, right.depth),
    nodeCount: 1 + left.nodeCount + right.nodeCount,
    maxX: Math.max(x, left.maxX, right.maxX),
  };
};

const PrimeFactorizationViz: React.FC = () => {
  const [inputValue, setInputValue] = useState('60');
  const [number, setNumber] = useState(60);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [revealedDepth, setRevealedDepth] = useState(-1);
  const [factors, setFactors] = useState<number[]>([]);
  const [showBlocks, setShowBlocks] = useState(false);
  const [pathAnimation, setPathAnimation] = useState<number[]>([]);
  const [nodeRadius, setNodeRadius] = useState(20);
  const [viewBoxWidth, setViewBoxWidth] = useState(300);
  const [totalDepth, setTotalDepth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize prime count calculation
  const primeCount = useMemo(() => {
    const count: Record<number, number> = {};
    factors.forEach(p => {
      count[p] = (count[p] || 0) + 1;
    });
    return count;
  }, [factors]);

  const initializeAnimation = useCallback((n: number) => {
    const depth = getTreeDepth(n);
    const { verticalDistance, radius } = calculateSizing(depth);
    
    // Get container width
    const containerWidth = containerRef.current?.clientWidth || 300;
    
    // Calculate tree width with default scale
    const defaultWidth = calculateTreeWidth(n, radius, 1);
    
    // Calculate scale factor if tree is too wide
    const scale = defaultWidth > containerWidth ? containerWidth / defaultWidth : 1;
    
    // Calculate root X with (possibly scaled) spread
    const spread0 = getSpread(0, scale);
    const rootX = radius + spread0;
    
    // Build tree with all metadata in single traversal
    const result = buildTreeWithMetadata(n, rootX, radius, 0, verticalDistance, scale);
    
    // Calculate actual viewBox width from built tree
    const actualViewBoxWidth = result.maxX + radius;
    
    setNodeRadius(radius);
    setViewBoxWidth(actualViewBoxWidth);
    setTotalDepth(result.depth);
    setTree(result.tree);
    setFactors(getPrimeFactorization(n));
    setRevealedDepth(-1);
    setShowBlocks(false);
    setPathAnimation([n]);
  }, []);

  useEffect(() => {
    initializeAnimation(number);
  }, [number, initializeAnimation]);

  // Animate tree revelation by incrementing revealed depth
  useEffect(() => {
    if (!tree) return;
    
    const timer = setTimeout(() => {
      if (revealedDepth < totalDepth) {
        setRevealedDepth(prev => prev + 1);
      } else if (revealedDepth === totalDepth && !showBlocks) {
        setShowBlocks(true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [revealedDepth, tree, totalDepth, showBlocks]);

  // Path animation - starts after tree is partially revealed
  useEffect(() => {
    if (revealedDepth > Math.floor(totalDepth / 2) && pathAnimation.length > 0) {
      const last = pathAnimation[pathAnimation.length - 1];
      if (last > 1) {
        const timer = setTimeout(() => {
          const p = getSmallestPrimeFactor(last);
          setPathAnimation(prev => [...prev, last / p]);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [pathAnimation, revealedDepth, totalDepth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(inputValue);
    if (n > 1 && n <= 9999) {
      setNumber(n);
    }
  };

  const renderTree = useCallback((node: TreeNode, depth: number = 0): React.ReactNode => {
    if (depth > revealedDepth) return null;

    const nodeColor = node.isPrime ? getPrimeColor(node.value) : '#00ff41';
    const lineOffset = nodeRadius * 0.6;
    const fontSize = Math.max(8, nodeRadius * 0.6);

    return (
      <g key={`${node.x}-${node.y}-${node.value}`}>
        {/* Lines to children */}
        {node.children.map((child, i) => depth + 1 <= revealedDepth && (
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
        {node.children.map(child => renderTree(child, depth + 1))}
      </g>
    );
  }, [revealedDepth, nodeRadius]);

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
        {/* Path animation - top right */}
        <div className="absolute top-1 right-2 text-[10px] text-term-dim">
          PATH_TO_1: {pathAnimation.map((n, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1">→</span>}
              <span className={n === 1 ? 'text-term-fg' : 'text-term-accent'}>{n}</span>
            </span>
          ))}
        </div>
        <svg width="100%" height="200" viewBox={`0 0 ${viewBoxWidth} 200`} className="mt-4">
          {tree && renderTree(tree)}
        </svg>
      </div>

      {/* Building Blocks */}
      {showBlocks && (
        <div className="border border-term-dim bg-[#020202] p-2 animate-fade-in">
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

          <div className="text-[10px] text-term-dim mt-2">UNIQUE_FACTORIZATION</div>
          <div className="text-center font-mono">
            <span className="text-term-fg text-lg">{number}</span>
            <span className="text-term-dim mx-2">=</span>
            {(Object.entries(primeCount) as [string, number][]).map(([prime, count], i) => (
              <span key={prime}>
                {i > 0 && <span className="text-term-dim mx-1">×</span>}
                <span style={{ color: getPrimeColor(parseInt(prime)) }}>
                  {prime}
                  {count > 1 && <sup>{count}</sup>}
                </span>
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
