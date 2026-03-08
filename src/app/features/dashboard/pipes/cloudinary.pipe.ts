import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforma URLs do Cloudinary inserindo transformações de otimização:
 * - f_auto: melhor formato suportado pelo browser (WebP, AVIF, etc.)
 * - q_auto: qualidade automática otimizada
 * - c_fill: crop preenchendo as dimensões exatamente
 * - width / height: tamanho alvo (em pixels — use 2x para suporte a retina)
 *
 * Uso: [src]="item.cover_url | cloudinary:260:390"
 *
 * Se a URL não for do Cloudinary, retorna sem modificação.
 */
@Pipe({ name: 'cloudinary', standalone: true, pure: true })
export class CloudinaryPipe implements PipeTransform {
  private static readonly UPLOAD_MARKER = '/upload/';

  transform(url: string | null | undefined, width: number, height: number): string {
    if (!url) return '';
    const idx = url.indexOf(CloudinaryPipe.UPLOAD_MARKER);
    if (idx < 0) return url;

    const base = url.substring(0, idx + CloudinaryPipe.UPLOAD_MARKER.length);
    const rest = url.substring(idx + CloudinaryPipe.UPLOAD_MARKER.length);

    // Remove um segmento de transformação existente (ex: "w_300,f_auto,q_auto/")
    // detectado por ter pelo menos um token no formato "x_..." antes do primeiro "/"
    const slashIdx = rest.indexOf('/');
    const firstSegment = slashIdx >= 0 ? rest.substring(0, slashIdx) : '';
    const hasTransforms = firstSegment.length > 0 && /^[a-z]+_/.test(firstSegment);

    const assetPath = hasTransforms && slashIdx >= 0
      ? rest.substring(slashIdx + 1)
      : rest;

    return `${base}f_auto,q_auto,w_${width},h_${height},c_fill/${assetPath}`;
  }
}
