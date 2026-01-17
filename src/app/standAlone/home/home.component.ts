import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { TxtEditorComponent } from "../txt-editor/txt-editor.component";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TxtEditorComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  isUserLogged: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.isLogged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isUserLogged = status;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
