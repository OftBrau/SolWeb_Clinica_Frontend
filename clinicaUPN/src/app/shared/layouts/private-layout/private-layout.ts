import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.css'
})
export class PrivateLayoutComponent {}