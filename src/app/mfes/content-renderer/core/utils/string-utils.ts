import { Pipe, PipeTransform } from "@angular/core";

export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function sentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// create pipe for sentence case
@Pipe({
  name: 'sentenceCase',
  standalone: true
})
export class SentenceCasePipe implements PipeTransform {
  transform(value: string): string {
    return sentenceCase(value);
  }
}


@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, length: number): string {
    return value.length > length ? value.substring(0, length) + '...' : value;
  }
} 