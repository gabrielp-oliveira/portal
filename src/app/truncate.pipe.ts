import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
    standalone: true // <- adicione isso

})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit = 30, trail = '...'): string {
    return value?.length > limit ? value.substring(0, limit) + trail : value;
  }

}
