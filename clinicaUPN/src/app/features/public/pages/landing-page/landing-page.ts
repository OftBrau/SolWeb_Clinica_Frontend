import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as L from 'leaflet';
import { CitaPublicaService, DoctorDisponible } from '../../services/cita-publica';
import { LanguageService, Lang } from '../../../../core/services/language.service';
import { AuthService } from '../../../../core/services/auth';
import { PUBLIC_TRANSLATIONS } from '../../../../shared/utils/public-translations';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private citaService = inject(CitaPublicaService);
  private languageService = inject(LanguageService);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map: L.Map | null = null;
  private routeLine: L.Polyline | null = null;
  private userMarker: L.Marker | null = null;

  videoMuted = signal(true);

  get currentLang(): Lang {
    return this.languageService.currentLang;
  }

  t(key: string): string {
    return PUBLIC_TRANSLATIONS[key]?.[this.currentLang] ?? key;
  }

  readonly logoUpn =
    'https://res.cloudinary.com/dxuk9bogw/image/upload/v1777099556/b6a20ee7-0a8d-4ba0-be44-ca617db1cb2e.png';

  servicios = [
    {
      key: 'med',
      titulo: 'Medicina General',
      icon: 'bi-heart-pulse-fill',
      tituloKey: 'srv.medicina',
      descKey: 'srv.medicinaDesc',
      imagen:
        'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&auto=format&fit=crop&q=80',
    },
    {
      key: 'obs',
      titulo: 'Obstetricia',
      icon: 'bi-gender-female',
      tituloKey: 'srv.obstetricia',
      descKey: 'srv.obstetriciaDesc',
      imagen:
        'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&auto=format&fit=crop&q=80',
    },
    {
      key: 'nut',
      titulo: 'Nutrición',
      icon: 'bi-egg-fried',
      tituloKey: 'srv.nutricion',
      descKey: 'srv.nutricionDesc',
      imagen:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80',
    },
    {
      key: 'psi',
      titulo: 'Psicología',
      icon: 'bi-brain',
      tituloKey: 'srv.psicologia',
      descKey: 'srv.psicologiaDesc',
      imagen:
        'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&auto=format&fit=crop&q=80',
    },
    {
      key: 'reh',
      titulo: 'Rehabilitación',
      icon: 'bi-activity',
      tituloKey: 'srv.rehabilitacion',
      descKey: 'srv.rehabilitacionDesc',
      imagen:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
    },
    {
      key: 'fis',
      titulo: 'Fisioterapia',
      icon: 'bi-person-walking',
      tituloKey: 'srv.fisioterapia',
      descKey: 'srv.fisioterapiaDesc',
      imagen:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    },
  ];

  especialidades = signal<
    {
      nombre: string;
      especialidad: string;
      foto: string;
      descripcion: string;
      bibliografia: string;
    }[]
  >([]);

  features = [
    {
      key: 'hce',
      titleKey: 'feat.hce',
      descKey: 'feat.hceDesc',
      bg: '#E6F1FB',
      icon: 'bi-file-earmark-text-fill',
      color: '#185FA5',
    },
    {
      key: 'citas',
      titleKey: 'feat.citas',
      descKey: 'feat.citasDesc',
      bg: '#EAF3DE',
      icon: 'bi-calendar2-check-fill',
      color: '#3B6D11',
    },
    {
      key: 'tele',
      titleKey: 'feat.teleconsulta',
      descKey: 'feat.teleconsultaDesc',
      bg: '#EEEDFE',
      icon: 'bi-camera-video-fill',
      color: '#534AB7',
    },
    {
      key: 'prac',
      titleKey: 'feat.practicantes',
      descKey: 'feat.practicantesDesc',
      bg: '#FAEEDA',
      icon: 'bi-people-fill',
      color: '#854F0B',
    },
  ];

  stats = [
    { key: 'profs', value: '+50', labelKey: 'stats.professionals', color: '#1da2ca' },
    { key: 'specs', value: '8', labelKey: 'stats.specialties', color: '#534AB7' },
  ];

  // ── Carrusel servicios ──
  servicioIndex = signal(0);
  private servicioInterval: any;

  get serviciosPrev() {
    return (this.servicioIndex() - 1 + this.servicios.length) % this.servicios.length;
  }
  get serviciosNext() {
    return (this.servicioIndex() + 1) % this.servicios.length;
  }

  servicioScrollPrev() {
    clearInterval(this.servicioInterval);
    this.servicioIndex.set(
      (this.servicioIndex() - 1 + this.servicios.length) % this.servicios.length,
    );
    this.startServicioInterval();
  }
  servicioScrollNext() {
    clearInterval(this.servicioInterval);
    this.servicioIndex.set((this.servicioIndex() + 1) % this.servicios.length);
    this.startServicioInterval();
  }
  servicioGoTo(i: number) {
    clearInterval(this.servicioInterval);
    this.servicioIndex.set(i);
    this.startServicioInterval();
  }
  private startServicioInterval() {
    this.servicioInterval = setInterval(() => this.servicioScrollNext(), 7500);
  }

  // ── Formulario de cita ──
  paso = signal<'elegir' | 'existente' | 'nuevo' | 'cita' | 'exito'>('elegir');
  formNombre = signal('');
  formApellido = signal('');
  formEmail = signal('');
  formTelefono = signal('');
  formEspecialidad = signal('');
  formMedico = signal('');
  formFecha = signal('');
  formHora = signal('');
  formLoading = signal(false);
  formError = signal('');
  formFechaNacimiento = signal('');
  formGenero = signal('');
  formTipoReserva = signal<'BASICA' | 'ESPECIALISTA'>('BASICA');
  formIdEspecialidad = signal<number | null>(null);
  formDoctorPreferido = signal<number | null>(null);
  doctoresPorEspecialidad = signal<DoctorDisponible[]>([]);
  pacienteId: number | null = null;

  citaCreadaId = signal<number | null>(null);
  citaMontoExtra = signal<number>(0);
  pagando = signal(false);

  especialidadesActivas = signal<{ idEspecialidad: number; nombre: string; costoExtra: number }[]>([]);

  // ── Doctores dinámicos desde el backend ──
  doctoresReales = signal<DoctorDisponible[]>([]);
  cargandoDoctores = signal(false);

  productosDestacados = signal<any[]>([]);
  carruselVisible = signal(true);
  carruselHovered = signal(false);
  @ViewChild('destacadosScroll') destacadosScroll!: ElementRef<HTMLElement>;

  productosCarousel = computed(() => {
    const prods = this.productosDestacados();
    if (prods.length === 0) return [];
    const items: { type: 'single' | 'double'; products: any[] }[] = [];
    let idx = 0;
    while (idx < prods.length) {
      if (items.length % 2 === 0) {
        items.push({ type: 'single', products: [prods[idx]] });
        idx++;
      } else {
        const remaining = prods.length - idx;
        const count = remaining >= 2 ? 2 : remaining;
        items.push({ type: 'double', products: prods.slice(idx, idx + count) });
        idx += count;
      }
    }
    return items;
  });

  // doctoresDisponibles ahora usa los datos reales del backend
  doctoresDisponibles = computed(() => this.doctoresReales());

  slotsDisponibles = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ];
  slotsOcupados = signal<Set<string>>(new Set());
  cargandoSlots = signal(false);

  get esAutoAsignar(): boolean {
    return !this.formMedico() || this.formMedico() === 'AUTO';
  }

  onMedicoChange(medico: string) {
    this.formMedico.set(medico);
    this.formHora.set('');
    if (this.formFecha() && !this.esAutoAsignar) this.cargarSlots();
  }

  onFechaChange(fecha: string) {
    this.formFecha.set(fecha);
    this.formHora.set('');
    if (!this.esAutoAsignar) this.cargarSlots();
  }

  cargarSlots() {
    const fecha = this.formFecha();
    const medico = this.formMedico();
    if (!fecha) {
      this.slotsOcupados.set(new Set());
      return;
    }

    const doctor = this.doctoresReales().find((d) => d.nombre === medico);
    if (!doctor) {
      this.slotsOcupados.set(new Set());
      return;
    }

    this.cargandoSlots.set(true);
    this.http
      .get<{
        data: { startTime: string }[];
      }>(`http://localhost:8080/api/doctors/${doctor.idDoctor}/available-slots?date=${fecha}`)
      .subscribe({
        next: (r) => {
          const available = new Set(r.data.map((s) => s.startTime));
          const ocupados = new Set(this.slotsDisponibles.filter((s) => !available.has(s)));
          this.slotsOcupados.set(ocupados);
          this.cargandoSlots.set(false);
        },
        error: () => {
          this.cargandoSlots.set(false);
          this.slotsOcupados.set(new Set());
        },
      });
  }

  // ── Llamado al backend al cambiar especialidad ──
  cargarDoctores(especialidad: string) {
    this.formMedico.set('');
    this.doctoresReales.set([]);
    this.slotsOcupados.set(new Set());
    if (!especialidad) return;

    this.cargandoDoctores.set(true);
    this.citaService.listarDoctores(especialidad).subscribe({
      next: (docs) => {
        this.doctoresReales.set(docs);
        this.cargandoDoctores.set(false);
      },
      error: () => {
        this.doctoresReales.set([]);
        this.cargandoDoctores.set(false);
        this.formError.set(this.t('err.doctorsLoad'));
      },
    });
  }

  onEspecialidadChange(): void {
    this.formDoctorPreferido.set(null);
    const idEsp = this.formIdEspecialidad();
    if (!idEsp) {
      this.doctoresPorEspecialidad.set([]);
      return;
    }
    const esp = this.especialidadesActivas().find(e => e.idEspecialidad === idEsp);
    if (esp) {
      this.citaService.listarDoctores(esp.nombre).subscribe({
        next: (docs) => this.doctoresPorEspecialidad.set(docs),
        error: () => this.doctoresPorEspecialidad.set([])
      });
    }
  }

  cargarEspecialidadesActivas(): void {
    this.http.get<{ data: { idEspecialidad: number; nombre: string; costoExtra: number }[] }>(
      'http://localhost:8080/api/cita-publica/especialidades'
    ).subscribe({
      next: (r) => this.especialidadesActivas.set(r.data || []),
      error: () => {}
    });
  }

  elegirPacienteExistente() {
    this.paso.set('existente');
    this.formError.set('');
  }
  elegirPacienteNuevo() {
    this.paso.set('nuevo');
    this.formError.set('');
  }

  buscarPaciente() {
    if (!this.formEmail()) {
      this.formError.set(this.t('agenda.searchErrorEmail'));
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    this.citaService.buscarPaciente(this.formEmail()).subscribe({
      next: (paciente) => {
        this.formLoading.set(false);
        this.pacienteId = paciente.idPaciente;
        this.formNombre.set(paciente.nombre);
        this.formApellido.set(paciente.apellido);
        this.formEmail.set(paciente.email);
        this.formTelefono.set(paciente.telefono ?? '');
        this.paso.set('cita');
      },
      error: (err) => {
        console.log('>>> Error completo:', err);
        console.log('>>> err.status:', err.status);
        console.log('>>> err.error:', err.error);
        this.formLoading.set(false);
        this.formError.set(err.error?.message || this.t('err.notFound'));
      },
    });
  }

  irACita() {
    if (
      !this.formNombre() ||
      !this.formApellido() ||
      !this.formEmail() ||
      !this.formTelefono() ||
      !this.formFechaNacimiento() ||
      !this.formGenero()
    ) {
      this.formError.set(this.t('agenda.completeAll'));
      return;
    }
    this.formError.set('');
    this.paso.set('cita');
  }

  agendarCita() {
    if (this.formTipoReserva() === 'ESPECIALISTA') {
      this.agendarEspecialista();
    } else {
      this.agendarBasica();
    }
  }

  agendarBasica() {
    if (!this.formFecha() || !this.formHora()) {
      this.formError.set('Selecciona fecha y hora');
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    const body: any = {
      fecha: this.formFecha(),
      hora: this.formHora(),
      motivo: 'Consulta general',
      tipo: 'PRESENCIAL',
    };

    this.agregarDatosPaciente(body);

    this.http.post('http://localhost:8080/api/cita-publica/reservar-basica', body).subscribe({
      next: (resp: any) => {
        this.paso.set('exito');
        this.formLoading.set(false);
        if (resp?.data?.doctor) {
          this.formMedico.set(resp.data.doctor);
        }
      },
      error: (err) => {
        this.formLoading.set(false);
        this.formError.set(err.error?.message || this.t('err.booking'));
      },
    });
  }

  agendarEspecialista() {
    if (!this.formIdEspecialidad() || !this.formFecha() || !this.formHora()) {
      this.formError.set('Selecciona especialidad, fecha y hora');
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    const body: any = {
      idEspecialidad: this.formIdEspecialidad(),
      fecha: this.formFecha(),
      hora: this.formHora(),
      motivo: 'Consulta con especialista',
      tipo: 'PRESENCIAL',
    };

    if (this.formDoctorPreferido()) {
      body.idDoctorPreferido = this.formDoctorPreferido();
    }

    this.agregarDatosPaciente(body);

    this.http.post('http://localhost:8080/api/cita-publica/reservar-especialista', body).subscribe({
      next: (resp: any) => {
        this.formLoading.set(false);
        if (resp?.data?.idCita) {
          this.citaCreadaId.set(resp.data.idCita);
          this.citaMontoExtra.set(resp.data.montoExtra || 0);
          this.paso.set('exito');
        }
      },
      error: (err) => {
        this.formLoading.set(false);
        this.formError.set(err.error?.message || this.t('err.booking'));
      },
    });
  }

  pagarCita(): void {
    const idCita = this.citaCreadaId();
    if (!idCita) return;
    this.pagando.set(true);
    this.http.post<{ data: { urlPago: string } }>(
      'http://localhost:8080/api/pagos/citas/crear',
      { idCita, monto: this.citaMontoExtra(), metodoPago: 'MERCADOPAGO' }
    ).subscribe({
      next: (r) => {
        this.pagando.set(false);
        if (r.data?.urlPago) {
          window.location.href = r.data.urlPago;
        }
      },
      error: () => {
        this.pagando.set(false);
        this.formError.set('Error al crear el pago. Intente nuevamente.');
      }
    });
  }

  private agregarDatosPaciente(body: any) {
    if (this.pacienteId) {
      body.idPaciente = this.pacienteId;
    } else {
      body.nombre = this.formNombre();
      body.apellido = this.formApellido();
      body.email = this.formEmail();
      body.telefono = this.formTelefono();
      body.fechaNacimiento = this.formFechaNacimiento();
      body.genero = this.formGenero();
    }
  }

  reiniciarFormulario() {
    this.paso.set('elegir');
    this.pacienteId = null;
    this.formNombre.set('');
    this.formApellido.set('');
    this.formEmail.set('');
    this.formTelefono.set('');
    this.formEspecialidad.set('');
    this.formMedico.set('');
    this.formFecha.set('');
    this.formHora.set('');
    this.formError.set('');
    this.formTipoReserva.set('BASICA');
    this.formIdEspecialidad.set(null);
    this.doctoresReales.set([]);
    this.citaCreadaId.set(null);
    this.citaMontoExtra.set(0);
  }

  // ── Carrusel de especialidades ──
  readonly currentYear = new Date().getFullYear();
  readonly today = new Date().toISOString().split('T')[0]; // ← AGREGA ESTA
  activeIndex = signal(0);
  animating = signal(false);

  private interval: any;

  prevIndex = computed(
    () => (this.activeIndex() - 1 + this.especialidades().length) % this.especialidades().length,
  );
  nextIndex = computed(() => (this.activeIndex() + 1) % this.especialidades().length);

  ngOnInit() {
    import('@splinetool/viewer');
    this.cargarEspecialidades();
    this.cargarProductos();
    this.cargarEspecialidadesActivas();
    this.interval = setInterval(() => this.goNext(), 5000);
    this.startServicioInterval();
    this.autoFillIfLoggedIn();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(this.interval);
      clearInterval(this.servicioInterval);
    } else {
      this.interval = setInterval(() => this.goNext(), 5000);
      this.startServicioInterval();
    }
  };

  private autoFillIfLoggedIn() {
    const user = this.auth.getUser();
    if (!user?.email || !user?.nombre) return;
    const rol = user.rol;
    if (rol !== 'PACIENTE' && rol !== 'PATIENT') return;
    const partes = user.nombre.split(' ');
    this.formNombre.set(partes[0] || '');
    this.formApellido.set(partes.slice(1).join(' ') || '');
    this.formEmail.set(user.email);
    this.paso.set('cita');
  }

  cargarProductos(): void {
    this.http
      .get<{ message: string; data: any[] }>(
        'http://localhost:8080/api/farmacia/medicamentos/activos',
      )
      .pipe(map((r) => r.data.slice(0, 5)))
      .subscribe({
        next: (p) => {
          this.productosDestacados.set(p);
          setTimeout(() => {
            const el = document.querySelector('.product-carousel-section');
            if (!el) return;
            new IntersectionObserver(([e]) => this.carruselVisible.set(e.isIntersecting), {
              threshold: 0.1,
            }).observe(el);
          });
        },
      });
  }

  scrollDestacados(dir: number): void {
    const el = this.destacadosScroll?.nativeElement;
    if (!el) return;
    const card = el.querySelector('.producto-destacado-item') as HTMLElement | null;
    const scrollAmount = card ? card.offsetWidth + 16 : 260;
    el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
  }

  cargarEspecialidades(): void {
    this.citaService.listarTodosDoctores().subscribe({
      next: (docs) => {
        const items = docs.map((d) => ({
          nombre: d.nombre,
          especialidad: d.especialidad,
          foto: d.fotoUrl || 'https://via.placeholder.com/400x400?text=Sin+foto',
          descripcion: d.descripcion || '',
          bibliografia: d.bibliografia || '',
        }));
        this.especialidades.set(items);
      },
      error: () => {
        this.especialidades.set([]);
      },
    });
  }

  onCarouselEnter() {
    this.carruselHovered.set(true);
    const el = document.querySelector('.product-carousel-track');
    if (!el) return;
    const anims = el.getAnimations();
    for (const a of anims) {
      if (a instanceof CSSAnimation) {
        (a as CSSAnimation).playbackRate = 0.25;
      }
    }
  }

  onCarouselLeave() {
    this.carruselHovered.set(false);
    const el = document.querySelector('.product-carousel-track');
    if (!el) return;
    const anims = el.getAnimations();
    for (const a of anims) {
      if (a instanceof CSSAnimation) {
        (a as CSSAnimation).playbackRate = 1;
      }
    }
  }

  ngAfterViewInit() {
    if (!this.mapContainer) return;

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = icon;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-12.0770736, -77.0348904],
      zoom: 15,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
    L.marker([-12.0770736, -77.0348904])
      .addTo(this.map)
      .bindPopup('Clínica UPN - Los Olivos');
    setTimeout(() => this.map?.invalidateSize(), 300);
  }

  mostrarRuta() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origen: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const destino: [number, number] = [-12.0770736, -77.0348904];

        this.routeLine?.remove();
        this.userMarker?.remove();

        this.userMarker = L.marker(origen, {
          icon: L.divIcon({
            className: '',
            html: '<div style="background:#1d4ed8;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        })
          .addTo(this.map!)
          .bindPopup('Tu ubicación');

        this.http
          .get<any>(
            `https://router.project-osrm.org/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?geometries=geojson`
          )
          .subscribe({
            next: (res) => {
              const coords = res.routes[0].geometry.coordinates.map(
                (c: number[]) => [c[1], c[0]] as [number, number]
              );
              this.routeLine = L.polyline(coords, { color: '#1d4ed8', weight: 4 })
                .addTo(this.map!)
                .bindPopup('Ruta a la clínica');
              this.map?.fitBounds(this.routeLine.getBounds().pad(0.2));
            },
            error: () => {
              this.routeLine = L.polyline([origen, destino], {
                color: '#1d4ed8',
                weight: 3,
                dashArray: '8 8',
              })
                .addTo(this.map!)
                .bindPopup('Ruta aproximada (sin conexión)');
              this.map?.fitBounds(this.routeLine.getBounds().pad(0.2));
            },
          });
      },
      () => {
        this.routeLine?.remove();
        const destino: [number, number] = [-12.0770736, -77.0348904];
        this.routeLine = L.polyline([destino], { color: '#1d4ed8', weight: 3 })
          .addTo(this.map!);
        this.map?.setView(destino, 15);
      }
    );
  }

  abrirMaps() {
    window.open(
      'https://www.google.com/maps/dir/?api=1&destination=-12.0770736,-77.0348904',
      '_blank'
    );
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    clearInterval(this.servicioInterval);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.map?.remove();
  }

  goNext() {
    const len = this.especialidades().length;
    if (len === 0) return;
    clearInterval(this.interval);
    this.activeIndex.set((this.activeIndex() + 1) % len);
    this.interval = setInterval(() => this.goNext(), 5000);
  }
  goPrev() {
    const len = this.especialidades().length;
    if (len === 0) return;
    clearInterval(this.interval);
    this.activeIndex.set((this.activeIndex() - 1 + len) % len);
    this.interval = setInterval(() => this.goNext(), 5000);
  }

  getCardClass(i: number): string {
    const active = this.activeIndex();
    const total = this.especialidades().length;
    if (total === 0) return 'card-hidden';
    if (i === active) return 'card-center';
    if (i === (active - 1 + total) % total) return 'card-left';
    if (i === (active + 1) % total) return 'card-right';
    return 'card-hidden';
  }
}
