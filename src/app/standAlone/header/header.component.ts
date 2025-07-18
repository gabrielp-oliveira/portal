import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Subway_Settings } from '../../models/paperTrailTypes';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../modules/api.service';
import { WorldDataService } from '../../modules/dashboard/world-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() default: boolean = false;

  settings$?: Observable<Subway_Settings>;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private wd: WorldDataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Carrega settings apenas se NÃO estiver em modo "default"
    if (!this.default) {
      this.settings$ = this.wd.settings$;
    }
  }



  shareStore(): void {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'Minha Loja de Livros',
        url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('📋 Link da loja copiado!');
      });
    }
  }

  toggleTheme(settings: Subway_Settings): void {
    const updatedSettings = { ...settings, theme: !settings.theme };

    this.api.updateSettings(settings.id, updatedSettings).subscribe(() => {
      this.wd.setSettings(updatedSettings); // Atualiza no estado global
    });
  }


    
    
    GoTo(route:string){
      
      this.router.navigate([route]);
  }

}
