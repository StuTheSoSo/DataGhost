import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface FsNode { name: string; isDir: boolean; isTarget?: boolean; }

@Component({
  selector: 'app-filesystem-traverse-puzzle',
  template: `
    <div class="fs-puzzle">
      <p class="instruction dg-text-dim">Find and access the target file: <span class="dg-text-amber">{{ targetFile }}</span></p>
      <div class="terminal dg-glass">
        <div class="path-line dg-text-green">[ghost@node ~]$ ls {{ currentPath }}</div>
        <div class="fs-entries">
          <div *ngFor="let item of currentItems"
               class="fs-entry"
               [class.dir]="item.isDir"
               [class.target-file]="item.isTarget"
               (click)="navigate(item)">
            <ion-icon [name]="item.isDir ? 'folder-outline' : 'document-outline'"
                      [class.dg-text-amber]="item.isDir"
                      [class.dg-text-green]="!item.isDir && item.isTarget"
                      [class.dg-text-dim]="!item.isDir && !item.isTarget">
            </ion-icon>
            <span>{{ item.name }}</span>
          </div>
        </div>
        <div class="back-row" *ngIf="pathStack.length > 0">
          <button class="back-btn dg-text-cyan" (click)="goBack()">../</button>
        </div>
      </div>
      <div class="feedback dg-text-red" *ngIf="wrongFile">ACCESS DENIED — wrong file</div>
    </div>
  `,
  styles: [`
    .fs-puzzle { display: flex; flex-direction: column; gap: 12px; }
    .terminal { padding: 12px; font-family: var(--ion-font-family); font-size: 0.78rem; min-height: 160px; }
    .path-line { margin-bottom: 10px; font-size: 0.72rem; }
    .fs-entries { display: flex; flex-direction: column; gap: 4px; }
    .fs-entry { display: flex; align-items: center; gap: 8px; padding: 6px 4px; cursor: pointer; border-radius: 3px; }
    .fs-entry:active { background: rgba(255,255,255,0.05); }
    .dir { color: #ffb300; }
    .target-file { color: #00ff88; }
    ion-icon { font-size: 1rem; flex-shrink: 0; }
    .back-row { margin-top: 8px; }
    .back-btn { background: transparent; border: none; font-family: var(--ion-font-family); font-size: 0.78rem; cursor: pointer; letter-spacing: 0.08em; }
    .feedback { font-size: 0.72rem; }
  `],
  standalone: false
})
export class FilesystemTraversePuzzleComponent implements OnInit {
  @Input() difficulty = 5;
  @Output() result = new EventEmitter<boolean>();

  targetFile = 'classified.dat';
  currentPath = '/';
  pathStack: string[] = [];
  wrongFile = false;

  private fileSystem: Record<string, FsNode[]> = {
    '/': [
      { name: 'sys', isDir: true },
      { name: 'logs', isDir: true },
      { name: 'readme.txt', isDir: false }
    ],
    '/sys': [
      { name: 'kernel', isDir: true },
      { name: 'config.ini', isDir: false }
    ],
    '/logs': [
      { name: 'archive', isDir: true },
      { name: 'access.log', isDir: false }
    ],
    '/logs/archive': [
      { name: 'classified.dat', isDir: false, isTarget: true },
      { name: 'audit_2025.log', isDir: false },
      { name: 'audit_2024.log', isDir: false }
    ],
    '/sys/kernel': [
      { name: 'modules', isDir: false }
    ]
  };

  get currentItems(): FsNode[] {
    return this.fileSystem[this.currentPath] ?? [];
  }

  ngOnInit(): void {
    this.targetFile = 'classified.dat';
    this.currentPath = '/';
  }

  navigate(item: FsNode): void {
    this.wrongFile = false;
    if (item.isDir) {
      this.pathStack.push(this.currentPath);
      this.currentPath = this.currentPath === '/'
        ? `/${item.name}`
        : `${this.currentPath}/${item.name}`;
    } else {
      if (item.isTarget) {
        this.result.emit(true);
      } else {
        this.wrongFile = true;
      }
    }
  }

  goBack(): void {
    this.wrongFile = false;
    this.currentPath = this.pathStack.pop() ?? '/';
  }
}
