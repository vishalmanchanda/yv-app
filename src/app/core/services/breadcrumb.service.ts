import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  private showBreadcrumbSubject = new BehaviorSubject<boolean>(true);
  
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();
  showBreadcrumb$ = this.showBreadcrumbSubject.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Check if current route should hide breadcrumb
      let route = this.activatedRoute.root;
      let hideBreadcrumb = false;
      
      // Traverse route tree to find hideBreadcrumb data
      while (route.firstChild) {
        route = route.firstChild;
        if (route.snapshot.data['hideBreadcrumb']) {
          hideBreadcrumb = true;
          break;
        }
      }
      
      this.showBreadcrumbSubject.next(!hideBreadcrumb);
      
      if (!hideBreadcrumb) {
        const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbsSubject.next(breadcrumbs);
      }
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      const icon = child.snapshot.data['icon'];
      if (label) {
        breadcrumbs.push({ label, url, icon });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  // Manually set breadcrumbs (useful for dynamic content)
  setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
    this.breadcrumbsSubject.next(breadcrumbs);
  }
} 