import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  activeSection = 'inicio';

  @HostListener('window:scroll')
  onScroll() {
    const sections = ['inicio','servicios','especialidades','nosotros','contacto'];
    for (const id of sections.reverse()) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 80) {
        this.activeSection = id;
        break;
      }
    }
  }
}