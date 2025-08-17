import { Graph } from './graph.js';

export interface PathResult {
  distance: number;
  path: string[];
}

export interface DijkstraResult {
  distances: Map<string, number>;
  paths: Map<string, string[]>;
}

class PriorityQueue {
  private items: Array<{ vertex: string; distance: number }> = [];

  enqueue(vertex: string, distance: number): void {
    this.items.push({ vertex, distance });
    this.items.sort((a, b) => a.distance - b.distance);
  }

  dequeue(): { vertex: string; distance: number } | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export function dijkstra(graph: Graph, startVertex: string): DijkstraResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const pq = new PriorityQueue();

  // 全ての頂点の距離を無限大で初期化
  for (const vertex of graph.getVertices()) {
    distances.set(vertex, Infinity);
    previous.set(vertex, null);
  }

  // 開始点の距離を0に設定
  distances.set(startVertex, 0);
  pq.enqueue(startVertex, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentVertex = current.vertex;

    if (visited.has(currentVertex)) {
      continue;
    }

    visited.add(currentVertex);

    // 隣接する頂点を確認
    for (const edge of graph.getNeighbors(currentVertex)) {
      const neighbor = edge.to;
      const weight = edge.weight;

      if (!visited.has(neighbor)) {
        const newDistance = distances.get(currentVertex)! + weight;

        if (newDistance < distances.get(neighbor)!) {
          distances.set(neighbor, newDistance);
          previous.set(neighbor, currentVertex);
          pq.enqueue(neighbor, newDistance);
        }
      }
    }
  }

  // パスを再構築
  const paths = new Map<string, string[]>();
  for (const vertex of graph.getVertices()) {
    const path: string[] = [];
    let current: string | null = vertex;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current)!;
    }

    if (path[0] === startVertex) {
      paths.set(vertex, path);
    } else {
      paths.set(vertex, []); // 到達不可能
    }
  }

  return { distances, paths };
}

export function findShortestPath(graph: Graph, start: string, end: string): PathResult | null {
  if (!graph.hasVertex(start) || !graph.hasVertex(end)) {
    return null;
  }

  const result = dijkstra(graph, start);
  const distance = result.distances.get(end)!;
  const path = result.paths.get(end)!;

  if (distance === Infinity || path.length === 0) {
    return null; // 到達不可能
  }

  return { distance, path };
}