import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, debounceTime, distinctUntilChanged } from 'rxjs';
import { PerfilProfesionalService, PerfilData } from '../../services/perfil-profesional.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-mi-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './mi-perfil-page.html',
  styles: [`
    .profile-banner { width: 100%; height: 250px; border-radius: 12px 12px 0 0; object-fit: cover; background: linear-gradient(135deg, #0a66c2, #185fa5); }
    .profile-banner-empty { width: 100%; height: 250px; border-radius: 12px 12px 0 0; background: linear-gradient(135deg, #0a66c2, #185fa5); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; }
    .profile-avatar { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #fff; object-fit: cover; margin-top: -60px; position: relative; z-index: 5; }
    .profile-avatar-empty { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #fff; position: relative; z-index: 5; background: var(--bs-secondary); margin-top: -60px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 40px; cursor: pointer; }
    .section-card { background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
    .tag { display: inline-block; background: #eef3fc; color: #0a66c2; border-radius: 20px; padding: 4px 12px; font-size: .8rem; margin: 2px; }
    .tag:hover { background: #dce6f5; }
    .autocomplete-box { position: absolute; z-index: 1000; background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 8px; max-height: 200px; overflow-y: auto; width: 100%; }
    .autocomplete-item { padding: 8px 12px; cursor: pointer; font-size: .9rem; }
    .autocomplete-item:hover { background: var(--bs-primary-bg-subtle); }
    .edit-btn { opacity: 0; transition: opacity .15s; }
    .section-card:hover .edit-btn { opacity: 1; }
    .modal-backdrop { z-index: 1040; }
    .modal { z-index: 1050; }
  `]
})
export class MiPerfilPageComponent implements OnInit {
  private svc = inject(PerfilProfesionalService);
  private http = inject(HttpClient);
  data = signal<PerfilData | null>(null);
  cargando = signal(true);

  // Modal state
  editSection = signal<string | null>(null); // 'basico' | 'cert' | 'exp' | 'edu' | 'hab'
  form: any = {};
  guardando = signal(false);

  // Univ autocomplete
  univSuggestions = signal<string[]>([]);
  typingUniv = signal(false);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.svc.getPerfil().subscribe({ next: d => { this.data.set(d); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }

  bannerMuted = signal(true);
  // --- Photo / Banner ---
  uploadPhoto(event: any) {
    const f = event.target.files?.[0]; if (!f) return;
    this.svc.uploadFoto(f).subscribe({ next: r => { this.data.update(d => d ? { ...d, perfil: { ...d.perfil, fotoUrl: r.url } } : d); } });
  }
  uploadBanner(event: any) {
    const f = event.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    this.http.post('http://localhost:8080/api/perfil/banner', fd).subscribe({ next: (r: any) => this.data.update(d => d ? { ...d, perfil: { ...d.perfil, bannerUrl: r.data.url } } : d) });
  }
  isVideo(url: string | undefined): boolean { return !!url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.includes('video')); }
  uploadCv(event: any) {
    const f = event.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    this.http.post('http://localhost:8080/api/perfil/cv', fd).subscribe({ next: (r: any) => {
      this.data.update(d => d ? { ...d, perfil: { ...d.perfil, cvUrl: r.data.url } } : d);
      // Auto-parser CV
      this.http.post<{data: any}>('http://localhost:8080/api/perfil/parsear-cv', { url: r.data.url }).subscribe(pr => {
        const p = pr.data;
        const perfil = this.data()?.perfil;
        this.form = {
          tituloProfesional: p.tituloProfesional || perfil?.tituloProfesional || '',
          universidad: p.universidad || perfil?.universidad || '',
          anioGraduacion: perfil?.anioGraduacion || null,
          linkedinUrl: p.linkedinUrl || perfil?.linkedinUrl || '',
          biografia: p.biografia || perfil?.biografia || ''
        };
        this.editSection.set('basico');
      });
    } });
  }

  // --- University autocomplete ---
  onUnivInput(q: string) {
    this.form.universidad = q;
    if (q.length < 2) { this.univSuggestions.set([]); return; }
    this.http.get<{ data: string[] }>('http://localhost:8080/api/perfil/universidades', { params: { q } })
      .subscribe(r => this.univSuggestions.set(r.data));
  }
  selectUniv(u: string) { this.form.universidad = u; this.univSuggestions.set([]); }

  // --- Section edit ---
  openEdit(section: string, initialData?: any) {
    this.editSection.set(section);
    if (initialData) {
      this.form = { ...initialData };
    } else if (section === 'basico') {
      const p = this.data()?.perfil;
      this.form = { tituloProfesional: p?.tituloProfesional || '', universidad: p?.universidad || '',
        anioGraduacion: p?.anioGraduacion || null, biografia: p?.biografia || '', linkedinUrl: p?.linkedinUrl || '' };
    } else {
      this.form = {};
    }
    this.univSuggestions.set([]);
  }
  closeEdit() { this.editSection.set(null); this.form = {}; this.univSuggestions.set([]); }

  saveBasico() {
    this.guardando.set(true);
    this.svc.updatePerfil(this.form).subscribe({ next: d => { this.data.set(d); this.guardando.set(false); this.closeEdit(); }, error: (e) => { this.guardando.set(false); alert('Error: ' + (e.error?.message || e.message)); } });
  }
  saveCert() {
    if (!this.form.nombre) return;
    this.guardando.set(true);
    this.svc.addCert(this.form.nombre, this.form.institucion, this.form.fechaEmision, this.form.fechaVencimiento).subscribe({ next: () => { this.guardando.set(false); this.cargar(); this.closeEdit(); } });
  }
  saveExp() {
    this.guardando.set(true);
    this.svc.addExp(this.form.empresa, this.form.cargo, this.form.fechaInicio, this.form.fechaFin, this.form.actualmente, this.form.descripcion).subscribe({ next: () => { this.guardando.set(false); this.cargar(); this.closeEdit(); } });
  }
  saveEdu() {
    this.guardando.set(true);
    this.svc.addEdu(this.form.institucion, this.form.titulo, this.form.fechaInicio, this.form.fechaFin).subscribe({ next: () => { this.guardando.set(false); this.cargar(); this.closeEdit(); } });
  }
  saveHab() {
    if (!this.form.nombre) return;
    this.svc.addHab(this.form.nombre).subscribe({ next: () => { this.cargar(); this.closeEdit(); } });
  }

  delCert(id: number) { this.svc.deleteCert(id).subscribe({ next: () => this.cargar() }); }
  delExp(id: number) { this.svc.deleteExp(id).subscribe({ next: () => this.cargar() }); }
  delEdu(id: number) { this.svc.deleteEdu(id).subscribe({ next: () => this.cargar() }); }
  delHab(id: number) { this.svc.deleteHab(id).subscribe({ next: () => this.cargar() }); }
}
