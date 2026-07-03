import { Injectable, signal, computed } from '@angular/core';

export interface LocalCartItem {
  idMedicamento: number;
  nombreComercial: string;
  precioUnitario: number;
  cantidad: number;
  categoria?: string;
}

const CART_KEY = 'farmacia_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<LocalCartItem[]>(this.load());
  readonly items = computed(() => this._items());
  readonly count = computed(() => this._items().reduce((s, i) => s + i.cantidad, 0));
  readonly total = computed(() => this._items().reduce((s, i) => s + i.precioUnitario * i.cantidad, 0));

  private load(): LocalCartItem[] {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  }

  private save() {
    localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
  }

  agregar(item: { idMedicamento: number; nombreComercial: string; precioUnitario: number; categoria?: string }) {
    this._items.update(list => {
      const exist = list.find(i => i.idMedicamento === item.idMedicamento);
      if (exist) {
        exist.cantidad++;
        return [...list];
      }
      return [...list, { ...item, cantidad: 1 }];
    });
    this.save();
  }

  actualizar(idMedicamento: number, cantidad: number) {
    this._items.update(list => {
      if (cantidad <= 0) return list.filter(i => i.idMedicamento !== idMedicamento);
      return list.map(i => i.idMedicamento === idMedicamento ? { ...i, cantidad } : i);
    });
    this.save();
  }

  eliminar(idMedicamento: number) {
    this._items.update(list => list.filter(i => i.idMedicamento !== idMedicamento));
    this.save();
  }

  vaciar() {
    this._items.set([]);
    this.save();
  }
}
