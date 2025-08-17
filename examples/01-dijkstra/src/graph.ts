export interface Edge {
  to: string;
  weight: number;
}

export class Graph {
  private adjacencyList: Map<string, Edge[]> = new Map();

  addVertex(vertex: string): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(from: string, to: string, weight: number): void {
    this.addVertex(from);
    this.addVertex(to);
    
    this.adjacencyList.get(from)!.push({ to, weight });
  }

  getNeighbors(vertex: string): Edge[] {
    return this.adjacencyList.get(vertex) || [];
  }

  getVertices(): string[] {
    return Array.from(this.adjacencyList.keys());
  }

  hasVertex(vertex: string): boolean {
    return this.adjacencyList.has(vertex);
  }
}