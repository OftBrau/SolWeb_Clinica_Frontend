import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { Subject, interval, startWith, Subscription } from 'rxjs';
import { Client } from '@stomp/stompjs';
import { AuthService } from '../../../core/services/auth';

export interface Notificacion {
  tipo: string;
  mensaje: string;
  teleconsultaId: number;
  timestamp: string;
  leida: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService implements OnDestroy {
  private auth = inject(AuthService);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly noLeidas = computed(() => this.notificaciones().filter(n => !n.leida).length);
  readonly muted = signal(localStorage.getItem('noti_muted') === 'true');

  private _nueva = new Subject<void>();
  readonly onNotificacion$ = this._nueva.asObservable();

  private stompClient: Client | null = null;
  private pollSub: Subscription | null = null;

  toggleMute() {
    this.muted.update(v => !v);
    localStorage.setItem('noti_muted', String(this.muted()));
  }

  constructor() {
    // Intentar conectar cada 10s si no está conectado y el usuario ya está autenticado
    this.pollSub = interval(10000).pipe(startWith(0)).subscribe(() => {
      if (this.auth.isAuthenticated() && !this.stompClient?.active) {
        this.conectar();
      }
    });
  }

  conectar() {
    const user = this.auth.getUser();
    if (!user) return;
    if (this.stompClient?.active) return;

    const token = this.auth.getToken();
    console.log('[NotificacionService] conectando STOMP a ws://localhost:8080/ws, rol:', user.rol);

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP]', msg),
      onConnect: () => {
        console.log('[NotificacionService] STOMP conectado');
        const rol = user.rol;
        if (rol === 'DOCTOR' || rol === 'MEDICO') {
          this.stompClient!.subscribe('/topic/notificaciones/doctor', (msg) => {
            this.agregar(JSON.parse(msg.body));
          });
        }
        if (rol === 'ASISTENTE') {
          this.stompClient!.subscribe('/topic/notificaciones/asistente', (msg) => {
            this.agregar(JSON.parse(msg.body));
          });
        }
        // Todos se suscriben a sus notificaciones personales
        this.stompClient!.subscribe(`/topic/notificaciones/paciente/${user.email}`, (msg) => {
          this.agregar(JSON.parse(msg.body));
        });
      },
      onStompError: (frame) => {
        console.error('[NotificacionService] STOMP error:', frame.headers['message']);
      },
      onWebSocketClose: (evt) => {
        console.warn('[NotificacionService] WS cerrado:', evt.code, evt.reason);
      },
    });
    this.stompClient.activate();
  }

  desconectar() {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }

  marcarLeidas() {
    this.notificaciones.update(list => list.map(n => ({ ...n, leida: true })));
  }

  limpiar() {
    this.notificaciones.set([]);
  }

  private agregar(data: any) {
    console.log('[NotificacionService] agregando notificacion:', data.tipo, data.mensaje);
    this.notificaciones.update(list => [{ ...data, leida: false }, ...list]);
    this._nueva.next();
    this.reproducirSonido();
    this.mostrarNotificacionSO(data);
  }

  private requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  activarNotificacionesSO() {
    this.requestPermission();
  }

  private mostrarNotificacionSO(data: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification('Clínica UPN', {
          body: data.mensaje || 'Nueva notificación',
          icon: 'https://res.cloudinary.com/dmm3qtoe6/image/upload/v1783095188/doctores/byd28szpbbtopdavexc1.jpg',
          tag: data.tipo,
          requireInteraction: false
        });
        n.onclick = () => { window.focus(); n.close(); };
      } catch { /* no soportado */ }
    }
  }

  private reproducirSonido() {
    if (this.muted()) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 800; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch { /* no audio */ }
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
    this.desconectar();
  }
}
