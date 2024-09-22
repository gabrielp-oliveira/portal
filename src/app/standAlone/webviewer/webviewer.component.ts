import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { MfService, FileChangesResponse } from './mf.service';
import { HttpClientModule } from '@angular/common/http';


declare const WebViewer: any;

@Component({
  selector: 'web-viewer',
  templateUrl: './webviewer.component.html',
  standalone: true,
  providers: [MfService],
  imports: [HttpClientModule],
  styleUrls: ['./webviewer.component.scss']
})
export class WebViewerComponent implements OnInit, AfterViewInit {
  // Syntax if using Angular 8+
  // true or false depending on code
  constructor(private mfService: MfService){}
  @ViewChild('viewer', {static: false}) viewer: ElementRef;

  fileChangesResponse: FileChangesResponse | null = null;

  wvInstance: any;

  ngOnInit() {
    this.getFileChangesAndDocx();

    this.wvDocumentLoadedHandler = this.wvDocumentLoadedHandler.bind(this);
  }

  wvDocumentLoadedHandler(): void {
    // you can access docViewer object for low-level APIs
    const { documentViewer, annotationManager, Annotations } = this.wvInstance.Core;
    // and access classes defined in the WebViewer iframe
    console.log(Annotations)
    const rectangle = new Annotations.RectangleAnnotation();
    rectangle.PageNumber = 1;
    rectangle.X = 100;
    rectangle.Y = 100;
    rectangle.Width = 250;
    rectangle.Height = 250;
    rectangle.StrokeThickness = 5;
    rectangle.Author = annotationManager.getCurrentUser();
    annotationManager.addAnnotation(rectangle);
    annotationManager.drawAnnotations(rectangle.PageNumber);
    // see https://docs.apryse.com/api/web/WebViewerInstance.html for the full list of low-level APIs
  }

  ngAfterViewInit(): void {
    // The following code initiates a new instance of WebViewer.

    WebViewer({
      path: '../../wv-resources/lib',
      licenseKey: 'demo:1717359173672:7fd3a1f80300000000d59e9419a27fb1b83df39de2949229da2bbc07fe', // sign up to get a key at https://dev.apryse.com
      enableOfficeEditing: true,
      initialDoc: 'https://res.cloudinary.com/desqxln7i/raw/upload/v1720008617/file_l52bno.docx',
    }, this.viewer.nativeElement).then(async (instance :any) => {
      console.log(instance)
      this.wvInstance = await instance;
      // const document = await instance.Core.createDocument('test.docx',);
      // instance.UI.loadDocument(document);


      instance.UI.openElement('notesPanel');

      instance.Core.documentViewer.addEventListener('documentLoaded', this.wvDocumentLoadedHandler)
    })
  }

  getFileChangesAndDocx(): void {
    this.mfService.getFileChangesAndDocx().subscribe(
      (response) => {
        this.fileChangesResponse = response;
        console.log('File Changes Response:', this.fileChangesResponse);
        
        if (this.fileChangesResponse?.docx) {
          this.downloadDocx(this.fileChangesResponse.docx, this.fileChangesResponse.filename);
        }
      },
      (error) => {
        console.error('Erro ao obter as mudanças no arquivo e o DOCX:', error);
      }
    );
  }

  downloadDocx(encodedDocx: string, filename: string): void {
    const byteCharacters = atob(encodedDocx);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

}