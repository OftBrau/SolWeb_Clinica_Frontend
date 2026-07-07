import { Component, Input } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink],
  template: `
    <div class="ph-wrapper">
      <nav *ngIf="breadcrumbs && breadcrumbs.length > 0" class="ph-breadcrumb" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li *ngFor="let item of breadcrumbs; let last = last" class="breadcrumb-item" [class.active]="last">
            <a *ngIf="!last && item.link" [routerLink]="item.link">{{ item.label }}</a>
            <span *ngIf="last || !item.link">{{ item.label }}</span>
          </li>
        </ol>
      </nav>

      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-header-title">
            <i *ngIf="icon" class="bi" [ngClass]="icon"></i>
            {{ title }}
          </h1>
          <p *ngIf="subtitle" class="page-header-subtitle">{{ subtitle }}</p>
        </div>
        <div *ngIf="hasActions" class="page-header-actions">
          <ng-content></ng-content>
        </div>
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

    .ph-wrapper {
      margin-bottom: 32px;
    }

    .ph-breadcrumb {
      margin-bottom: 8px;
    }

    .ph-breadcrumb .breadcrumb {
      margin-bottom: 0;
      font-size: 13px;
    }

    .ph-breadcrumb .breadcrumb-item a {
      color: var(--bs-primary, #1976d2);
      text-decoration: none;
    }

    .ph-breadcrumb .breadcrumb-item a:hover {
      text-decoration: underline;
    }

    .ph-breadcrumb .breadcrumb-item.active {
      color: var(--text-secondary, #6c757d);
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
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
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-header-title i {
      font-size: 24px;
      color: var(--bs-primary, #1976d2);
      flex-shrink: 0;
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
  @Input() icon?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];

  get hasActions(): boolean {
    return true;
  }
}
