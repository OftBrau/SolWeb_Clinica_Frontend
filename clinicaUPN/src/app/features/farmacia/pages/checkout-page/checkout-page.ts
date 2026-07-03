import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout-page.html',
  styles: [`
    .page-wrapper { max-width: 600px; margin: 0 auto; padding: 120px 1rem 3rem; }
    .card-item { padding: .75rem 0; border-bottom: 1px solid var(--bs-border-color); }
  `]
})
export class CheckoutPageComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private cartSvc = inject(CartService);
  auth = inject(AuthService);

  form = { nombre: '', email: '', telefono: '' };
  procesando = signal(false);
  items = this.cartSvc.items();

  ngOnInit() {
    if (this.items.length === 0 && !this.cartSvc.count()) {
      this.router.navigate(['/farmacia']);
      return;
    }
    if (this.auth.isAuthenticated()) {
      const u = this.auth.getUser();
      if (u) {
        this.form.nombre = u.nombre || '';
        this.form.email = u.email || '';
      }
    }
  }

  get total() { return this.cartSvc.total(); }

  pagar() {
    if (!this.form.nombre || !this.form.email) return;
    this.procesando.set(true);
    const request = {
      nombre: this.form.nombre,
      email: this.form.email,
      telefono: this.form.telefono,
      items: this.items.map(i => ({ idMedicamento: i.idMedicamento, cantidad: i.cantidad }))
    };
    this.http.post<{data: any}>('http://localhost:8080/api/farmacia/ventas/checkout-public', request)
      .subscribe({
        next: (r) => {
          this.procesando.set(false);
          this.cartSvc.vaciar();
          if (r.data.initPoint) {
            window.location.href = r.data.initPoint;
          } else {
            alert('Venta creada. Redirigiendo a mis compras...');
            this.router.navigate(['/app/farmacia/mis-compras']);
          }
        },
        error: (e) => { this.procesando.set(false); alert(e.error?.message || 'Error al procesar'); }
      });
  }
}
