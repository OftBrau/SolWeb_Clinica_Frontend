import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-header-title">{{ title }}</h1>
        @if (subtitle) {
          <p class="page-header-subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      animation: fadeSlideIn 0.25s ease-out;
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-header-text {
      flex: 1;
      min-width: 0;
    }

    .page-header-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--text-primary);
    }

    .page-header-subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
