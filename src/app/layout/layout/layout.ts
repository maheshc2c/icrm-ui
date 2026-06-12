import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { ToastComponent } from '../../shared/toast/toast.component';
import { Dashboard } from "../../pages/dashboard/dashboard";
import { CommonModule } from '@angular/common';
import { Button } from "../../shared/button/button";

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

}
