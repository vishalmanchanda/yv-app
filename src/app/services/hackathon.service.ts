import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HackathonDetails } from '../types/hackathon';
import { Observable, forkJoin, of, map, catchError, switchMap, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HackathonService {
  private hackathons: Record<string, HackathonDetails> = {};
  private isLoaded = false;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadHackathons();
  }

  private loadHackathons(): void {
    // Set loading state
    this.loadingSubject.next(true);
    
    // Get the hackathons from the index file
    this.http.get<string[]>('assets/hackathons/index.json')
      .pipe(
        catchError(error => {
          console.error('Error loading hackathon index:', error);
          // Fall back to hardcoded IDs
          return of(['iyd-2025', 'nyd-2025']);
        }),
        switchMap(hackathonIds => {
          // Create an array of observables for each hackathon JSON file
          const hackathonObservables = hackathonIds.map(id => 
            this.http.get<HackathonDetails>(`assets/hackathons/${id}.json`).pipe(
              catchError(error => {
                console.error(`Error loading hackathon ${id}:`, error);
                return of(null);
              })
            )
          );
          
          // Use forkJoin to wait for all requests to complete
          return forkJoin(hackathonObservables);
        })
      )
      .subscribe({
        next: (results) => {
          // Filter out any null results and build the hackathons record
          results.filter(result => result !== null).forEach(hackathon => {
            if (hackathon && hackathon.id) {
              this.hackathons[hackathon.id] = hackathon;
            }
          });
          this.isLoaded = true;
          this.loadingSubject.next(false);
        },
        error: (error) => {
          console.error('Error loading hackathons:', error);
          this.isLoaded = false;
          this.loadingSubject.next(false);
        }
      });
  }

  /**
   * Check if the data has been loaded yet
   */
  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Get hackathon details synchronously
   * Use this only if you're sure the data is already loaded
   */
  getHackathonDetails(id: string): HackathonDetails | undefined {
    return this.hackathons[id];
  }

  /**
   * Get all hackathons synchronously
   * Use this only if you're sure the data is already loaded
   */
  getAllHackathons(): HackathonDetails[] {
    return Object.values(this.hackathons);
  }

  /**
   * Get hackathon details asynchronously
   * This ensures data is loaded before returning
   */
  getHackathonDetailsAsync(id: string): Observable<HackathonDetails | undefined> {
    // If data is already loaded, return it immediately
    if (this.isLoaded) {
      return of(this.hackathons[id]);
    }
    
    // Otherwise, try to load the specific hackathon file
    return this.http.get<HackathonDetails>(`assets/hackathons/${id}.json`).pipe(
      tap(hackathon => {
        if (hackathon && hackathon.id) {
          // Store it in our cache
          this.hackathons[hackathon.id] = hackathon;
        }
      }),
      catchError(() => of(undefined))
    );
  }

  /**
   * Get all hackathons asynchronously
   * This ensures data is loaded before returning
   */
  getAllHackathonsAsync(): Observable<HackathonDetails[]> {
    // If data is already loaded, return it immediately
    if (this.isLoaded) {
      return of(Object.values(this.hackathons));
    }

    // This will scan the hackathons directory and load all JSON files
    return this.http.get<string[]>('assets/hackathons/index.json').pipe(
      catchError(() => {
        console.warn('No index.json found, falling back to known hackathon IDs');
        return of(['iyd-2025', 'nyd-2025']);
      }),
      switchMap(hackathonIds => 
        forkJoin(
          hackathonIds.map(id => 
            this.http.get<HackathonDetails>(`assets/hackathons/${id}.json`).pipe(
              catchError(() => of(null))
            )
          )
        )
      ),
      map(results => results.filter((h): h is HackathonDetails => h !== null)),
      tap(hackathons => {
        // Store the results in our cache
        hackathons.forEach(hackathon => {
          if (hackathon && hackathon.id) {
            this.hackathons[hackathon.id] = hackathon;
          }
        });
        this.isLoaded = true;
      })
    );
  }
} 