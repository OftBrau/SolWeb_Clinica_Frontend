import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { CartService, LocalCartItem } from '../../../features/farmacia/services/cart.service';

interface BackendCartItem {
  idCarrito: number;
  idMedicamento: number;
  nombreComercial: string;
  precioUnitario: number;
  categoria?: string;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css'
})
export class CartDrawerComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  private cartSvc = inject(CartService);

  abierto = signal(false);
  backendItems = signal<BackendCartItem[]>([]);
  cargando = signal(false);
  private pollSub: Subscription | null = null;

  get autenticado(): boolean { return this.auth.isAuthenticated(); }
  get esPaciente(): boolean { const r = this.auth.getRol(); return r === 'PACIENTE' || r === 'PATIENT'; }

  get items(): (BackendCartItem | LocalCartItem)[] {
    return this.autenticado ? this.backendItems() : this.cartSvc.items();
  }

  get count(): number {
    return this.autenticado
      ? this.backendItems().reduce((s, i) => s + i.cantidad, 0)
      : this.cartSvc.count();
  }

  get total(): number {
    return this.autenticado
      ? this.backendItems().reduce((s, i) => s + i.subtotal, 0)
      : this.cartSvc.total();
  }

  ngOnInit() {
    if (this.autenticado && this.esPaciente) {
      this.cargarLigero();
      window.addEventListener('cart-updated', this.onCartUpdated);
      const timer = setInterval(() => { if (this.autenticado && this.esPaciente) this.cargarLigero(); }, 60000);
      this.pollSub = new Subscription();
      this.pollSub.add(() => clearInterval(timer));
    }
  }

  ngOnDestroy() {
    window.removeEventListener('cart-updated', this.onCartUpdated);
    this.pollSub?.unsubscribe();
  }

  private onCartUpdated = () => { if (this.autenticado) this.cargarLigero(); };

  cargarLigero() {
    if (!this.autenticado || !this.esPaciente) return;
    this.http.get<{ message: string; data: BackendCartItem[] }>('http://localhost:8080/api/farmacia/carrito')
      .pipe(map(r => r.data))
      .subscribe({ next: (d) => this.backendItems.set(d) });
  }

  cargar() {
    if (!this.autenticado) return;
    this.cargando.set(true);
    this.http.get<{ message: string; data: BackendCartItem[] }>('http://localhost:8080/api/farmacia/carrito')
      .pipe(map(r => r.data))
      .subscribe({ next: (d) => { this.backendItems.set(d); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }

  toggle() {
    this.abierto.set(!this.abierto());
    if (this.abierto() && this.autenticado && this.esPaciente) this.cargar();
  }

  actualizar(item: any, delta: number) {
    const nueva = item.cantidad + delta;
    if (this.autenticado) {
      if (nueva <= 0) { this.eliminarBackend(item.idCarrito); return; }
      this.http.put<{ message: string; data: BackendCartItem }>(
        `http://localhost:8080/api/farmacia/carrito/${item.idCarrito}`, { cantidad: nueva })
        .pipe(map(r => r.data))
        .subscribe({ next: () => this.cargar() });
    } else {
      this.cartSvc.actualizar(item.idMedicamento, nueva);
    }
  }

  eliminar(item: any) {
    if (this.autenticado) {
      this.eliminarBackend(item.idCarrito);
    } else {
      this.cartSvc.eliminar(item.idMedicamento);
    }
  }

  private eliminarBackend(id: number) {
    this.http.delete(`http://localhost:8080/api/farmacia/carrito/${id}`)
      .subscribe({ next: () => this.cargar() });
  }

  checkout() {
    this.abierto.set(false);
    this.router.navigate(['/checkout']);
  }
}
