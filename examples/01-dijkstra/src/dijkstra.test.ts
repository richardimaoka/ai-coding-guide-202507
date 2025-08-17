import { describe, test, expect } from 'vitest';
import { Graph } from './graph.js';
import { dijkstra, findShortestPath } from './dijkstra.js';

describe('Graph', () => {
  test('should add vertices and edges correctly', () => {
    const graph = new Graph();
    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'C', 2);
    
    expect(graph.hasVertex('A')).toBe(true);
    expect(graph.hasVertex('B')).toBe(true);
    expect(graph.hasVertex('C')).toBe(true);
    expect(graph.hasVertex('D')).toBe(false);
    
    const neighborsA = graph.getNeighbors('A');
    expect(neighborsA).toHaveLength(2);
    expect(neighborsA).toContainEqual({ to: 'B', weight: 4 });
    expect(neighborsA).toContainEqual({ to: 'C', weight: 2 });
  });
});

describe('Dijkstra Algorithm', () => {
  function createSampleGraph(): Graph {
    const graph = new Graph();
    
    // サンプルネットワークを構築
    // A → B (4), A → C (2)
    graph.addEdge('A', 'B', 4);
    graph.addEdge('A', 'C', 2);
    
    // B → D (1), B → E (5)
    graph.addEdge('B', 'D', 1);
    graph.addEdge('B', 'E', 5);
    
    // C → F (8)
    graph.addEdge('C', 'F', 8);
    
    // D → G (3), E → G (2), F → G (6)
    graph.addEdge('D', 'G', 3);
    graph.addEdge('E', 'G', 2);
    graph.addEdge('F', 'G', 6);
    
    return graph;
  }

  test('should find shortest distances from vertex A', () => {
    const graph = createSampleGraph();
    const result = dijkstra(graph, 'A');
    
    // 期待される最短距離
    expect(result.distances.get('A')).toBe(0);
    expect(result.distances.get('B')).toBe(4);
    expect(result.distances.get('C')).toBe(2);
    expect(result.distances.get('D')).toBe(5);  // A→B→D = 4+1 = 5
    expect(result.distances.get('E')).toBe(9);  // A→B→E = 4+5 = 9
    expect(result.distances.get('F')).toBe(10); // A→C→F = 2+8 = 10
    expect(result.distances.get('G')).toBe(8);  // A→B→D→G = 4+1+3 = 8
  });

  test('should find correct shortest paths from vertex A', () => {
    const graph = createSampleGraph();
    const result = dijkstra(graph, 'A');
    
    // 期待される最短経路
    expect(result.paths.get('A')).toEqual(['A']);
    expect(result.paths.get('B')).toEqual(['A', 'B']);
    expect(result.paths.get('C')).toEqual(['A', 'C']);
    expect(result.paths.get('D')).toEqual(['A', 'B', 'D']);
    expect(result.paths.get('E')).toEqual(['A', 'B', 'E']);
    expect(result.paths.get('F')).toEqual(['A', 'C', 'F']);
    expect(result.paths.get('G')).toEqual(['A', 'B', 'D', 'G']);
  });

  test('should handle findShortestPath function correctly', () => {
    const graph = createSampleGraph();
    
    // A→Gの最短経路
    const pathAG = findShortestPath(graph, 'A', 'G');
    expect(pathAG).not.toBeNull();
    expect(pathAG!.distance).toBe(8);
    expect(pathAG!.path).toEqual(['A', 'B', 'D', 'G']);
    
    // A→Eの最短経路
    const pathAE = findShortestPath(graph, 'A', 'E');
    expect(pathAE).not.toBeNull();
    expect(pathAE!.distance).toBe(9);
    expect(pathAE!.path).toEqual(['A', 'B', 'E']);
    
    // A→Fの最短経路
    const pathAF = findShortestPath(graph, 'A', 'F');
    expect(pathAF).not.toBeNull();
    expect(pathAF!.distance).toBe(10);
    expect(pathAF!.path).toEqual(['A', 'C', 'F']);
  });

  test('should return null for non-existent vertices', () => {
    const graph = createSampleGraph();
    
    const pathAZ = findShortestPath(graph, 'A', 'Z');
    expect(pathAZ).toBeNull();
    
    const pathZA = findShortestPath(graph, 'Z', 'A');
    expect(pathZA).toBeNull();
  });

  test('should handle unreachable vertices', () => {
    const graph = new Graph();
    graph.addEdge('A', 'B', 1);
    graph.addVertex('C'); // 孤立した頂点
    
    const result = dijkstra(graph, 'A');
    expect(result.distances.get('C')).toBe(Infinity);
    expect(result.paths.get('C')).toEqual([]);
    
    const pathAC = findShortestPath(graph, 'A', 'C');
    expect(pathAC).toBeNull();
  });

  test('should handle single vertex graph', () => {
    const graph = new Graph();
    graph.addVertex('A');
    
    const result = dijkstra(graph, 'A');
    expect(result.distances.get('A')).toBe(0);
    expect(result.paths.get('A')).toEqual(['A']);
    
    const pathAA = findShortestPath(graph, 'A', 'A');
    expect(pathAA).not.toBeNull();
    expect(pathAA!.distance).toBe(0);
    expect(pathAA!.path).toEqual(['A']);
  });

  test('should find alternative routes correctly', () => {
    const graph = new Graph();
    
    // 複数経路があるケース
    graph.addEdge('A', 'B', 10);
    graph.addEdge('A', 'C', 3);
    graph.addEdge('C', 'B', 4);
    
    const pathAB = findShortestPath(graph, 'A', 'B');
    expect(pathAB).not.toBeNull();
    expect(pathAB!.distance).toBe(7);  // A→C→B = 3+4 = 7 (直接A→B=10より短い)
    expect(pathAB!.path).toEqual(['A', 'C', 'B']);
  });
});