import { Component, Input, HostBinding } from '@angular/core';

export interface TopoNode {
  label: string;
}

interface Point { x: number; y: number; }

@Component({
  selector: 'app-network-topology',
  templateUrl: './network-topology.component.html',
  styleUrls: ['./network-topology.component.scss'],
  standalone: false
})
export class NetworkTopologyComponent {
  @Input() routeNodes: TopoNode[] = [];
  @Input() currentStage = 0;
  @Input() traceProgress = 0;
  @Input() routeProgress = 0;
  @Input() connected = false;
  @Input() toolRunning = false;

  @HostBinding('class.topo-running') get isRunning() { return this.toolRunning; }

  get activeNodeIndex(): number {
    if (!this.connected) return -1;
    if (this.currentStage <= 1) return 0;
    if (this.currentStage === 2) return 1;
    if (this.currentStage === 3) return 2;
    return Math.min(this.routeNodes.length - 1, 3);
  }

  readonly W = 200;
  readonly H = 280;

  // Horizontal zigzag offsets for proxy nodes (left/right of center)
  private readonly X_JITTER = 48;

  get nodePositions(): Point[] {
    const n = this.routeNodes.length;
    if (n === 0) return [];
    const topMargin = 22;
    const botMargin = 28;
    const spread = this.H - topMargin - botMargin;
    const xMid = this.W / 2;
    return this.routeNodes.map((_, i) => {
      const y = topMargin + (n === 1 ? spread / 2 : (i / (n - 1)) * spread);
      // first and last node: center; middle nodes: zigzag left/right
      let x = xMid;
      if (i > 0 && i < n - 1) {
        x = xMid + (i % 2 === 1 ? this.X_JITTER : -this.X_JITTER);
      }
      return { x, y };
    });
  }

  get totalPathLength(): number {
    const pts = this.nodePositions;
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.max(len, 1);
  }

  get routePolylinePoints(): string {
    return this.nodePositions.map(p => `${p.x},${p.y}`).join(' ');
  }

  /** Reversed path so stroke-dashoffset animation grows FROM target TOWARD gateway */
  get tracePolylinePoints(): string {
    return [...this.nodePositions].reverse().map(p => `${p.x},${p.y}`).join(' ');
  }

  get traceDashOffset(): number {
    return this.totalPathLength * (1 - this.routeProgress / 100);
  }

  /** Position of the moving trace-head dot along the reversed path */
  get traceHeadPos(): Point {
    const pts = [...this.nodePositions].reverse();
    if (pts.length === 0) return { x: 0, y: 0 };
    const targetLen = (this.routeProgress / 100) * this.totalPathLength;
    let traveled = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (traveled + segLen >= targetLen) {
        const t = (targetLen - traveled) / segLen;
        return { x: pts[i - 1].x + t * dx, y: pts[i - 1].y + t * dy };
      }
      traveled += segLen;
    }
    return pts[pts.length - 1];
  }

  nodeRadius(i: number): number {
    const n = this.routeNodes.length;
    return (i === 0 || i === n - 1) ? 11 : 9;
  }

  /** 'host' for GATEWAY and TARGET, 'proxy' for intermediate bounce nodes */
  nodeType(i: number): 'host' | 'proxy' {
    const n = this.routeNodes.length;
    return (i === 0 || i === n - 1) ? 'host' : 'proxy';
  }

  /** Label x-position: hosts centered, proxies to the side away from center */
  labelX(i: number): number {
    const pos = this.nodePositions[i];
    if (this.nodeType(i) === 'host') return pos.x;
    return pos.x > this.W / 2 ? pos.x + 14 : pos.x - 14;
  }

  /** Label y-position: top node above, bottom node below, proxies vertically centered */
  labelY(i: number): number {
    const n = this.routeNodes.length;
    const pos = this.nodePositions[i];
    if (i === 0) return pos.y - 15;
    if (i === n - 1) return pos.y + 22;
    return pos.y + 4;
  }

  /** SVG text-anchor for label */
  labelAnchor(i: number): string {
    if (this.nodeType(i) === 'host') return 'middle';
    return this.nodePositions[i].x > this.W / 2 ? 'start' : 'end';
  }

  nodeStatusClass(i: number): string {
    if (!this.connected) return 'node-off';
    if (i < this.activeNodeIndex) return 'node-done';
    if (i === this.activeNodeIndex) return 'node-active';
    return 'node-pending';
  }

  get traceColorClass(): string {
    if (this.traceProgress < 40) return 'trace-safe';
    if (this.traceProgress < 75) return 'trace-warn';
    return 'trace-danger';
  }

  get headColorClass(): string {
    if (this.traceProgress < 40) return 'head-safe';
    if (this.traceProgress < 75) return 'head-warn';
    return 'head-danger';
  }
}
