import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { ContentItem } from '../../../../../core/models/content.models';


@Injectable({
  providedIn: 'root'
})
export class ImportService {
  constructor() {}

  importContent(): Observable<ContentItem | null> {
    return of(null);
  }
} 