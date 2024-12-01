import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
// import { Editor, Toolbar } from '@kolkov/';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularEditorModule, AngularEditorConfig, AeToolbarSetComponent} from '@kolkov/angular-editor';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Chapter, description } from '../../models/paperTrailTypes';
import { ApiService } from '../../modules/api.service';

@Component({
  selector: 'app-txt-editor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AngularEditorModule, MatButtonModule],
  templateUrl: './txt-editor.component.html',
  styleUrls: ['./txt-editor.component.scss'],
})
export class TxtEditorComponent implements OnInit, OnDestroy {

@Input() data: description; 
private contentSubject = new Subject<string>();
private destroy$ = new Subject<void>();
@Output() valueChanged = new EventEmitter<string>();
content = new FormControl('');
editorConfig: AngularEditorConfig = {
  editable: true,
    spellcheck: true,
    height: '300px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: 'Calibri',
    defaultFontSize: '3',
    toolbarHiddenButtons: [
      ['superscript'],
      ['subscript'],
      ['strikeThrough'],
      ['insertVideo'],          
      ['insertImage'],          
      ['toggleEditorMode'],    
    ],
    fonts: [
      {class: 'arial', name: 'Arial'},
      {class: 'times-new-roman', name: 'Times New Roman'},
      {class: 'calibri', name: 'Calibri'},
      {class: 'comic-sans-ms', name: 'Comic Sans MS'}
    ],
  
  
  uploadWithCredentials: false,
  sanitize: true,
  toolbarPosition: 'top',

};

  constructor(private api:ApiService) {
    // Configura o debounceTime para atrasar a execução do emitVal
    this.contentSubject
      .pipe(
        // debounceTime(1000), // 30 segundos de debounce
        takeUntil(this.destroy$)
      )
      .subscribe((content) => {
        this.emitVal(content);
      });
  }
  onContentChange(content: string): void {
    this.contentSubject.next(content); // Emite o valor atualizado
  }




emitVal(a:string): void {
  console.log(this.data)
  this.data.description_data = a
  this.valueChanged.emit(a);
}

ngOnChanges(changes: any) {
  const data = changes.data.currentValue
  const val :string = !data?.description_data ? "": data?.description_data
  console.log(val)
  this.content.setValue(val)
}
  ngOnInit(): void {
    // Inicializar o editor

    const val :string = !this.data?.description_data ? "": this.data?.description_data
    console.log(this.data)
    this.content.setValue(val)

    if(this.data?.resource_id !== undefined && this.data?.resource_id != ""){
      this.api.getDescription(this.data).subscribe((val) => {
        const txt :string = val.description_data != undefined?val.description_data:""
        this.content.setValue(txt)

      })
    }
  }

  ngOnDestroy(): void {
    // Destruir o editor ao destruir o componente
  }

  // Método para salvar o conteúdo

}
