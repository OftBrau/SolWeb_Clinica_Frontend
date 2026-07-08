import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination" *ngIf="totalPages > 1">
      <button class="btn-page" [disabled]="page === 0" (click)="goTo(page - 1)">
        <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
          <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button *ngFor="let p of pages()" class="btn-page" [class.active]="p === page"
              (click)="goTo(p)">{{ p + 1 }}</button>
      <button class="btn-page" [disabled]="page >= totalPages - 1" (click)="goTo(page + 1)">
        <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
          <path d="M8 4l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="pagination-info">Página {{ page + 1 }} de {{ totalPages }}</span>
      <span *ngIf="totalItems > 0" class="pagination-info">({{ totalItems }} resultados)</span>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .btn-page {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.15s;
    }
    .btn-page:hover:not(:disabled) { background: var(--bg-muted); color: var(--text-primary); }
    .btn-page.active { background: var(--accent); color: #fff; }
    .btn-page:disabled { opacity: 0.3; cursor: not-allowed; }
    .pagination-info { font-size: 12px; color: var(--text-muted); margin-left: 8px; }
  `]
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() totalItems = 0;
  @Output() pageChange = new EventEmitter<number>();

  goTo(p: number): void {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }

  pages(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const pages: number[] = [];
    let start = Math.max(0, current - 2);
    let end = Math.min(total - 1, current + 2);
    if (end - start < 4) {
      if (start === 0) end = Math.min(total - 1, start + 4);
      else start = Math.max(0, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
