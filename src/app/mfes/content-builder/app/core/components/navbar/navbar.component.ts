import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { ImportService } from '../../services/import.service';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { ScrollHideDirective } from '../../../../../content-renderer/directives/scroll-hide.directive';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ScrollHideDirective],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary" crScrollHide>
      <div class="container-fluid">
        <!-- Brand -->
        <a class="navbar-brand fw-semibold" href="#">  <i class="fas fa-layer-group me-2"></i>Content Builder</a>

        <!-- Navbar Toggler for Mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Content -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav ms-auto align-items-center">
            <!-- New Content Dropdown -->
            <li class="nav-item">
              <a class="nav-link btn-link" href="#" role="button">
                <i class="fas fa-home me-2"></i>Home
              </a>                         
            </li> 
            <!-- <li class="nav-item">
              <a class="nav-link btn-link" href="/preview/101">
                <i class="fas fa-eye me-2"></i>Viewer
              </a>
            </li>          -->

            <!-- User Dropdown -->
            <li class="nav-item dropdown ms-2">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle fs-5"></i>
              </a>

       
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      padding: 0.5rem 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }

    .navbar-brand {
      font-size: 1.25rem;
      padding: 0;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      color: rgba(255,255,255,.9) !important;
      
      &:hover {
        color: #fff !important;
      }
    }

    .dropdown-menu {
      margin-top: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15);
      border: none;
      
      .dropdown-item {
        padding: 0.5rem 1rem;
        
        &:hover {
          background-color: var(--bs-light);
        }
        
        i {
          opacity: 0.7;
        }
      }
    }

    .btn-link {
      text-decoration: none;
      
      &:hover {
        opacity: 0.9;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isEditorRoute = false;

  constructor(
    private router: Router,
    private importService: ImportService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isEditorRoute = this.router.url.includes('/editor/');
    });
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }



  async exportContent() {
    // const contentId = this.router.url.split('/editor/')[1];
    // if (contentId) {
    //   try {
    //     const content = await this.importService.exportContent(contentId);
    //     const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    //     const url = window.URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = `${content.title || 'content'}.json`;
    //     link.click();
    //     window.URL.revokeObjectURL(url);
    //   } catch (error) {
    //     console.error('Error exporting content:', error);
    //   }
    // }
  }
} 