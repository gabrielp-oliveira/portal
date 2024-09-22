import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MfService {
  private apiUrl = 'http://localhost:9090/GetCommitDiff?repo=Um%20Belo%20livro%20para%20ficar%20rico&sha=d68a7b887ecfb855d056c06b8143d5af0f634099&path=1_Um_Belo_livro_para_ficar_rico/demo.docx';

  constructor(private http: HttpClient) {}

  getFileChangesAndDocx(): Observable<FileChangesResponse> {
    const headers = new HttpHeaders({
      'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQGV4YW1wbGUuY29tIiwiZXhwIjoxNzIwMDkzODE1LCJ1c2VySWQiOjF9.NCVfLlJSsV3oCiYBdjJ09D6_6ZG8sxgxeD10SMJXdnw'
    });
    return this.http.get<FileChangesResponse>(this.apiUrl, { headers });
  }
}

export interface FileChangesResponse {
  sha: string;
  filename: string;
  additions?: number;
  deletions?: number;
  changes?: number;
  status: string;
  patch: string;
  diff?: string[];
  docx?: string;
}
