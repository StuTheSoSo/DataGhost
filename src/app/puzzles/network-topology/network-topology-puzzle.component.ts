import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface NetworkNode { id: string; label: string; flagged: boolean; x: number; y: number; }
interface NetworkEdge { from: string; to: string; }

@Component({
  selector: 'app-network-topology-puzzle',
  template: `
    <div class="net-puzzle">
      <p class="instruction dg-text-dim">Probe the perimeter, select a clean proxy chain, and route the packet into the target host.</p>
      <div class="net-grid">
        <svg [attr.viewBox]="'0 0 320 220'" class="net-svg">
          <!-- Edges -->
          <line *ngFor="let e of edges"
            [attr.x1]="getNode(e.from)?.x" [attr.y1]="getNode(e.from)?.y"
            [attr.x2]="getNode(e.to)?.x"   [attr.y2]="getNode(e.to)?.y"
            stroke="#1a2030" stroke-width="2"/>
          <!-- Route edges -->
          <line *ngFor="let e of routeEdges"
            [attr.x1]="getNode(e.from)?.x" [attr.y1]="getNode(e.from)?.y"
            [attr.x2]="getNode(e.to)?.x"   [attr.y2]="getNode(e.to)?.y"
            stroke="#00e5ff" stroke-width="3"/>
          <!-- Nodes -->
          <g *ngFor="let n of nodes" (click)="selectNode(n)" style="cursor:pointer">
            <circle [attr.cx]="n.x" [attr.cy]="n.y" r="18"
              [attr.fill]="nodeColor(n)"
              [attr.stroke]="selectedPath.includes(n.id) ? '#00e5ff' : 'transparent'"
              stroke-width="2"/>
            <text [attr.x]="n.x" [attr.y]="n.y + 5" text-anchor="middle" font-size="9"
                  fill="#c8d6e5" font-family="monospace">{{ n.label }}</text>
          </g>
        </svg>
      </div>
      <div class="path-display dg-text-dim">PATH: {{ selectedPath.join(' → ') || '—' }}</div>
      <div class="feedback dg-text-red" *ngIf="error">{{ error }}</div>
      <ion-button expand="block" (click)="submit()" [disabled]="selectedPath.length < 2">ROUTE SIGNAL</ion-button>
    </div>
  `,
  styles: [`
    .net-puzzle { display: flex; flex-direction: column; gap: 14px; }
    .instruction { font-size: 0.78rem; line-height: 1.6; }
    .net-svg { width: 100%; min-height: 220px; background: rgba(0,0,0,0.28); border-radius: 8px; display: block; }
    .path-display { font-size: 0.72rem; letter-spacing: 0.1em; }
    .feedback { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.04em; }
    ion-button { --background: var(--ion-color-primary); --color: #000; --border-radius: 4px; }
  `],
  standalone: false
})
export class NetworkTopologyPuzzleComponent implements OnInit {
  @Input() difficulty = 5;
  @Output() result = new EventEmitter<boolean>();

  nodes: NetworkNode[] = [];
  edges: NetworkEdge[] = [];
  selectedPath: string[] = [];
  error = '';

  ngOnInit(): void {
    this.generateGraph();
  }

  generateGraph(): void {
    this.nodes = [
      { id: 'SRC',  label: 'SRC',  flagged: false, x: 30,  y: 110 },
      { id: 'FW1',  label: 'FW',   flagged: this.difficulty > 2, x: 100, y: 60  },
      { id: 'PRX',  label: 'PRX',  flagged: this.difficulty > 4, x: 100, y: 160 },
      { id: 'APP',  label: 'APP',  flagged: this.difficulty > 5, x: 190, y: 85  },
      { id: 'DB',   label: 'DB',   flagged: this.difficulty > 7, x: 190, y: 160 },
      { id: 'TGT',  label: 'TGT',  flagged: false, x: 280, y: 110 }
    ];
    this.edges = [
      { from: 'SRC', to: 'FW1' },
      { from: 'SRC', to: 'PRX' },
      { from: 'FW1', to: 'APP' },
      { from: 'PRX', to: 'DB' },
      { from: 'APP', to: 'TGT' },
      { from: 'DB', to: 'TGT' },
      { from: 'APP', to: 'DB' }
    ];
  }

  getNode(id: string): NetworkNode | undefined {
    return this.nodes.find(n => n.id === id);
  }

  get routeEdges(): NetworkEdge[] {
    const edges: NetworkEdge[] = [];
    for (let i = 0; i < this.selectedPath.length - 1; i++) {
      edges.push({ from: this.selectedPath[i], to: this.selectedPath[i + 1] });
    }
    return edges;
  }

  nodeColor(n: NetworkNode): string {
    if (n.id === 'SRC' || n.id === 'TGT') return '#0077aa';
    if (n.flagged) return '#aa2233';
    if (this.selectedPath.includes(n.id)) return '#005533';
    return '#1a2a3a';
  }

  selectNode(node: NetworkNode): void {
    this.error = '';
    if (this.selectedPath.length === 0) {
      if (node.id !== 'SRC') { this.error = 'Start from SRC'; return; }
      this.selectedPath = ['SRC'];
    } else {
      const last = this.selectedPath[this.selectedPath.length - 1];
      const connected = this.edges.some(e =>
        (e.from === last && e.to === node.id) || (e.from === node.id && e.to === last)
      );
      if (!connected) { this.error = 'Nodes not connected'; return; }
      if (this.selectedPath.includes(node.id)) { this.error = 'Already in path'; return; }
      this.selectedPath = [...this.selectedPath, node.id];
    }
  }

  submit(): void {
    const last = this.selectedPath[this.selectedPath.length - 1];
    if (last !== 'TGT') { this.error = 'Route must end at TGT'; return; }
    const hasFlagged = this.selectedPath.some(id => this.getNode(id)?.flagged);
    if (hasFlagged) { this.error = 'Route passes a flagged node!'; this.selectedPath = []; return; }
    this.result.emit(true);
  }
}
