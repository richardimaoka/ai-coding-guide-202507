// 2D グリッド用のダイクストラ法実装

export interface Position {
  x: number;
  y: number;
}

export interface PathResult {
  distance: number;
  path: Position[];
}

class PriorityQueue {
  private items: Array<{ position: Position; distance: number }> = [];

  enqueue(position: Position, distance: number): void {
    this.items.push({ position, distance });
    this.items.sort((a, b) => a.distance - b.distance);
  }

  dequeue(): { position: Position; distance: number } | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export function findNextStep(
  grid: number[][],
  start: Position,
  target: Position
): Position | null {
  const width = grid[0].length;
  const height = grid.length;
  
  if (start.x === target.x && start.y === target.y) {
    return null;
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, Position | null>();
  const visited = new Set<string>();
  const pq = new PriorityQueue();

  const getKey = (pos: Position) => `${pos.x},${pos.y}`;
  const getNeighbors = (pos: Position): Position[] => {
    const neighbors: Position[] = [];
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }  // left
    ];
    
    for (const dir of directions) {
      const newX = pos.x + dir.x;
      const newY = pos.y + dir.y;
      
      if (newX >= 0 && newX < width && newY >= 0 && newY < height && grid[newY][newX] === 0) {
        neighbors.push({ x: newX, y: newY });
      }
    }
    
    return neighbors;
  };

  // 初期化
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === 0) {
        const key = getKey({ x, y });
        distances.set(key, Infinity);
        previous.set(key, null);
      }
    }
  }

  const targetKey = getKey(target);
  distances.set(targetKey, 0);
  pq.enqueue(target, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentPos = current.position;
    const currentKey = getKey(currentPos);

    if (visited.has(currentKey)) {
      continue;
    }

    visited.add(currentKey);

    for (const neighbor of getNeighbors(currentPos)) {
      const neighborKey = getKey(neighbor);
      
      if (!visited.has(neighborKey)) {
        const newDistance = distances.get(currentKey)! + 1;
        
        if (newDistance < distances.get(neighborKey)!) {
          distances.set(neighborKey, newDistance);
          previous.set(neighborKey, currentPos);
          pq.enqueue(neighbor, newDistance);
        }
      }
    }
  }

  // スタート位置からのパスを再構築
  const startKey = getKey(start);
  if (!previous.has(startKey) || previous.get(startKey) === null) {
    return null; // 到達不可能
  }

  let current: Position | null = start;
  let next: Position | null = null;

  while (current !== null) {
    const currentKey = getKey(current);
    const prev = previous.get(currentKey);
    
    if (prev && (prev.x !== target.x || prev.y !== target.y)) {
      next = prev;
    }
    
    current = prev || null;
  }

  return next;
}