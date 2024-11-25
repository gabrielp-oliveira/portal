import { Component } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {

  navItems = ['Item 1Item 1Item 1Item 1Item 1', 'Item 2', 'Item 3'];

  constructor() {}
}
