import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FarmaciaService, MedicamentoDTO } from '../../services/farmacia.service';
import { AuthService } from '../../../../core/services/auth';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.css'
})
export class ProductosPageComponent {
  private service = inject(FarmaciaService);
  private auth = inject(AuthService);
  private router = inject(Router);
  cartSvc = inject(CartService);
  private allProducts = signal<MedicamentoDTO[]>([]);
  productos = signal<MedicamentoDTO[]>([]);
  categorias = signal<string[]>([]);
  categoriaSeleccionada = signal<string>('TODOS');
  cargando = signal(true);
  searchText = signal('');
  precioMaximo = signal<number>(200);
  soloReceta = signal<boolean | null>(null);

  constructor() {
    if (this.auth.isAuthenticated()) {
      const rol = this.auth.getRol();
      if (rol === 'ADMINISTRADOR' || rol === 'ADMINISTRATIVO') {
        this.router.navigate(['/app/farmacia/admin']);
        return;
      }
    }
    this.service.medicamentos.activos().subscribe({
      next: (data) => {
        this.allProducts.set(data);
        this.productos.set(data);
        const cats = [...new Set(data.map(p => p.categoria || 'MEDICAMENTO'))];
        this.categorias.set(['TODOS', ...cats]);
        // Precio maximo inicial = el mayor precio
        const maxPrecio = Math.max(...data.map(p => p.precioUnitario));
        this.precioMaximo.set(maxPrecio || 200);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  filtrar(cat: string) {
    this.categoriaSeleccionada.set(cat);
    this.aplicarFiltros();
  }

  filtrarBusqueda(texto: string) {
    this.searchText.set(texto);
    this.aplicarFiltros();
  }

  actualizarPrecio(precio: number) {
    this.precioMaximo.set(precio);
    this.aplicarFiltros();
  }

  alternarReceta(valor: boolean | null) {
    this.soloReceta.set(this.soloReceta() === valor ? null : valor);
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    const texto = this.searchText().toLowerCase();
    const cat = this.categoriaSeleccionada();
    const precioMax = this.precioMaximo();
    const receta = this.soloReceta();

    let resultado = this.allProducts();

    // Filtro por categoria
    if (cat !== 'TODOS') {
      resultado = resultado.filter(p => (p.categoria || 'MEDICAMENTO') === cat);
    }

    // Filtro por busqueda
    if (texto) {
      resultado = resultado.filter(p =>
        p.nombreComercial.toLowerCase().includes(texto) ||
        (p.nombreGenerico || '').toLowerCase().includes(texto) ||
        (p.laboratorio || '').toLowerCase().includes(texto)
      );
    }

    // Filtro por precio maximo
    resultado = resultado.filter(p => p.precioUnitario <= precioMax);

    // Filtro por receta
    if (receta === true) {
      resultado = resultado.filter(p => p.requiereReceta);
    } else if (receta === false) {
      resultado = resultado.filter(p => !p.requiereReceta);
    }

    this.productos.set(resultado);
  }

  agregarAlCarrito(producto: MedicamentoDTO) {
    this.cartSvc.agregar({
      idMedicamento: producto.idMedicamento!,
      nombreComercial: producto.nombreComercial,
      precioUnitario: producto.precioUnitario,
      categoria: producto.categoria
    });
    if (this.autenticado) {
      this.service.carrito.agregar(producto.idMedicamento!, 1).subscribe({
        next: () => { window.dispatchEvent(new CustomEvent('cart-updated')); },
        error: (err) => alert(err.error?.message || 'Error al agregar al carrito')
      });
    }
  }

  irACarrito() {
    if (this.autenticado) {
      this.router.navigate(['/app/farmacia/carrito']);
    } else {
      this.router.navigate(['/login'], { queryParams: { return: '/app/farmacia/carrito' } });
    }
  }

  labelCat(cat: string): string {
    const labels: Record<string, string> = {
      MEDICAMENTO: 'Medicamentos', VITAMINA: 'Vitaminas',
      SUPLEMENTO: 'Suplementos', OTRO: 'Otros'
    };
    return labels[cat] || cat;
  }

  get autenticado(): boolean { return this.auth.isAuthenticated(); }
  get carritoLink(): string { return this.autenticado ? '/app/farmacia/carrito' : '/login'; }
}
