import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FarmaciaService, CarritoItemDTO, CrearVentaRequest } from '../../services/farmacia.service';
import { CartService } from '../../services/cart.service';
import { concatMap, from } from 'rxjs';

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito-page.html',
  styleUrl: './carrito-page.css'
})
export class CarritoPageComponent {
  private service = inject(FarmaciaService);
  private router = inject(Router);
  private cartSvc = inject(CartService);

  items = signal<CarritoItemDTO[]>([]);
  cargando = signal(true);
  procesando = signal(false);

  constructor() { this.transferirLocal(); }

  private transferirLocal() {
    const local = this.cartSvc.items();
    if (local.length === 0) { this.cargar(); return; }

    const obs = from(local).pipe(
      concatMap(item => this.service.carrito.agregar(item.idMedicamento, item.cantidad))
    );
    obs.subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        this.cartSvc.vaciar();
        this.cargar();
      }
    });
  }

  cargar() {
    this.cargando.set(true);
    this.service.carrito.listar().subscribe({
      next: (data) => { this.items.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  get total(): number {
    return this.items().reduce((sum, i) => sum + i.subtotal, 0);
  }

  actualizarCantidad(item: CarritoItemDTO, nueva: number) {
    if (nueva <= 0) {
      this.eliminar(item);
      return;
    }
    this.service.carrito.actualizar(item.idCarrito!, nueva).subscribe({
      next: () => this.cargar(),
      error: (e) => alert(e.error?.message || 'Error al actualizar')
    });
  }

  eliminar(item: CarritoItemDTO) {
    this.service.carrito.eliminar(item.idCarrito!).subscribe({ next: () => this.cargar() });
  }

  vaciar() {
    this.service.carrito.vaciar().subscribe({ next: () => this.items.set([]) });
  }

  checkout() {
    if (this.items().length === 0) return;
    this.procesando.set(true);
    const request: CrearVentaRequest = {
      items: this.items().map(i => ({ idMedicamento: i.idMedicamento, cantidad: i.cantidad }))
    };
    this.service.ventas.checkout(request).subscribe({
      next: (venta) => {
        this.procesando.set(false);
        if (venta.initPoint) {
          window.location.href = venta.initPoint;
        } else {
          this.router.navigate(['/app/farmacia/mis-compras']);
        }
      },
      error: (e) => {
        this.procesando.set(false);
        alert(e.error?.message || 'Error al procesar la compra');
      }
    });
  }
}
