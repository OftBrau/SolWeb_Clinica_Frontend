import { Component, signal, computed, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
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
export class LandingPageComponent implements OnInit, OnDestroy {
  private citaService = inject(CitaPublicaService);
  private languageService = inject(LanguageService);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

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
    { key: 'med',  titulo: 'Medicina General',  icon: 'bi-heart-pulse-fill',  tituloKey: 'srv.medicina',        descKey: 'srv.medicinaDesc',        imagen: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&auto=format&fit=crop&q=80' },
    { key: 'obs',  titulo: 'Obstetricia',       icon: 'bi-gender-female',     tituloKey: 'srv.obstetricia',     descKey: 'srv.obstetriciaDesc',     imagen: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&auto=format&fit=crop&q=80' },
    { key: 'nut',  titulo: 'Nutrición',         icon: 'bi-egg-fried',          tituloKey: 'srv.nutricion',       descKey: 'srv.nutricionDesc',       imagen: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80' },
    { key: 'psi',  titulo: 'Psicología',        icon: 'bi-brain',              tituloKey: 'srv.psicologia',      descKey: 'srv.psicologiaDesc',      imagen: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&auto=format&fit=crop&q=80' },
    { key: 'reh',  titulo: 'Rehabilitación',    icon: 'bi-activity',           tituloKey: 'srv.rehabilitacion',  descKey: 'srv.rehabilitacionDesc',  imagen: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80' },
    { key: 'fis',  titulo: 'Fisioterapia',      icon: 'bi-person-walking',    tituloKey: 'srv.fisioterapia',    descKey: 'srv.fisioterapiaDesc',    imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80' },
  ];

  stockFotos = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612531386530-97286d97c2b2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  ];

  especialidades = signal<{ nombre: string; especialidad: string; foto: string; descripcion: string; bibliografia: string }[]>([]);

  features = [
    { key: 'hce',    titleKey: 'feat.hce',             descKey: 'feat.hceDesc',       bg: '#E6F1FB', icon: 'bi-file-earmark-text-fill', color: '#185FA5' },
    { key: 'citas',  titleKey: 'feat.citas',           descKey: 'feat.citasDesc',     bg: '#EAF3DE', icon: 'bi-calendar2-check-fill', color: '#3B6D11' },
    { key: 'tele',   titleKey: 'feat.teleconsulta',    descKey: 'feat.teleconsultaDesc', bg: '#EEEDFE', icon: 'bi-camera-video-fill', color: '#534AB7' },
    { key: 'prac',   titleKey: 'feat.practicantes',    descKey: 'feat.practicantesDesc', bg: '#FAEEDA', icon: 'bi-people-fill', color: '#854F0B' },
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
  formCodigo = signal('');
  formEspecialidad = signal('');
  formMedico = signal('');
  formFecha = signal('');
  formHora = signal('');
  formLoading = signal(false);
  formError = signal('');
  formFechaNacimiento = signal('');
  formGenero = signal('');
  pacienteId: number | null = null;

  // ── Doctores dinámicos desde el backend ──
  doctoresReales = signal<DoctorDisponible[]>([]);
  cargandoDoctores = signal(false);

  productosDestacados = signal<any[]>([]);

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
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  slotsOcupados = signal<Set<string>>(new Set());
  cargandoSlots = signal(false);

  get esAutoAsignar(): boolean { return !this.formMedico() || this.formMedico() === 'AUTO'; }

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
    if (!fecha) { this.slotsOcupados.set(new Set()); return; }

    const doctor = this.doctoresReales().find(d => d.nombre === medico);
    if (!doctor) { this.slotsOcupados.set(new Set()); return; }

    this.cargandoSlots.set(true);
    this.http.get<{data: {startTime: string}[]}>(`http://localhost:8080/api/doctors/${doctor.idDoctor}/available-slots?date=${fecha}`)
      .subscribe({
        next: r => {
          const available = new Set(r.data.map(s => s.startTime));
          const ocupados = new Set(this.slotsDisponibles.filter(s => !available.has(s)));
          this.slotsOcupados.set(ocupados);
          this.cargandoSlots.set(false);
        },
        error: () => { this.cargandoSlots.set(false); this.slotsOcupados.set(new Set()); }
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

  elegirPacienteExistente() {
    this.paso.set('existente');
    this.formError.set('');
  }
  elegirPacienteNuevo() {
    this.paso.set('nuevo');
    this.formError.set('');
  }

  buscarPaciente() {
    if (!this.formEmail() || !this.formCodigo()) {
      this.formError.set(this.t('agenda.searchError'));
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    this.citaService.buscarPaciente(this.formEmail(), this.formCodigo()).subscribe({
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
        this.formError.set(
          err.error?.message || this.t('err.notFound'),
        );
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
    let medico = this.formMedico();
    if (this.esAutoAsignar) {
      const docs = this.doctoresReales();
      medico = docs.length > 0 ? docs[0].nombre : '';
    }
    if (!this.formEspecialidad() || !medico || !this.formFecha() || !this.formHora()) {
      this.formError.set(this.t('agenda.completeAppt'));
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');

    this.citaService
      .agendar({
        idPaciente: this.pacienteId ?? undefined,
        nombre: this.formNombre(),
        apellido: this.formApellido(),
        email: this.formEmail(),
        telefono: this.formTelefono(),
        fechaNacimiento: this.formFechaNacimiento(),
        genero: this.formGenero(),
        especialidad: this.formEspecialidad(),
        medico: medico,
        fecha: this.formFecha(),
        hora: this.formHora(),
        motivo: 'Consulta general',
        tipo: 'PRESENCIAL',
      })
      .subscribe({
        next: () => {
          this.paso.set('exito');
          this.formLoading.set(false);
        },
        error: (err) => {
          this.formLoading.set(false);
          this.formError.set(err.error?.message || this.t('err.booking'));
        },
      });
  }

  reiniciarFormulario() {
    this.paso.set('elegir');
    this.pacienteId = null;
    this.formNombre.set('');
    this.formApellido.set('');
    this.formEmail.set('');
    this.formTelefono.set('');
    this.formCodigo.set('');
    this.formEspecialidad.set('');
    this.formMedico.set('');
    this.formFecha.set('');
    this.formHora.set('');
    this.formError.set('');
    this.doctoresReales.set([]);
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
    this.interval = setInterval(() => this.goNext(), 5000);
    this.startServicioInterval();
    this.autoFillIfLoggedIn();
  }

  private autoFillIfLoggedIn() {
    if (!this.auth.isAuthenticated()) return;
    const rol = this.auth.getRol();
    if (rol !== 'PACIENTE' && rol !== 'PATIENT') return;
    const user = this.auth.getUser();
    if (!user?.email || !user?.nombre) return;
    // nombre viene como "Nombre Apellido" desde el backend
    const partes = user.nombre.split(' ');
    this.formNombre.set(partes[0] || '');
    this.formApellido.set(partes.slice(1).join(' ') || '');
    this.formEmail.set(user.email);
    this.paso.set('cita');
  }

  cargarProductos(): void {
    this.http.get<{ message: string; data: any[] }>('http://localhost:8080/api/farmacia/medicamentos/activos')
      .pipe(map(r => r.data.slice(0, 6)))
      .subscribe({ next: (p) => this.productosDestacados.set(p) });
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

  ngOnDestroy() {
    clearInterval(this.interval);
    clearInterval(this.servicioInterval);
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
