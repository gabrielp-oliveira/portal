import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  
  numberToRGB(id: string): string {
    // Converte o ID em um número baseado nos caracteres do ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    // Garante que o hash seja positivo
    hash = Math.abs(hash);
  
    // Extrai valores de R, G, B a partir do hash
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = (hash & 0x0000FF);
  
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  
}
