import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../../../content-renderer/services/content.service';
import { ToastService } from '../../../../content-renderer/core/services/toast.service';
import { ContentConfigService } from '../../services/content-config.service';

@Component({
  selector: 'app-content-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="row min-vh-100 align-items-center justify-content-center">
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h4 class="mt-3">Loading Content...</h4>
          <div class="progress mt-3" style="height: 10px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                 role="progressbar" 
                 style="width: 100%">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ContentLoaderComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService,
    private toastService: ToastService,
    private contentConfigService: ContentConfigService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const categoryKey = params['key'];
      
      this.route.queryParams.subscribe(async queryParams => {
        const contentId = queryParams['contentId'];
        
        if (categoryKey && contentId) {
          try {
            const contentUrl = this.contentConfigService.getContentUrl(categoryKey, contentId);
            await this.contentService.loadContentPackage(contentUrl);
            
            // Navigate to reader once content is loaded
            this.router.navigate(['/reader'], { 
              queryParams: { 
                partId: '1', 
                sectionId: '1',
                category: categoryKey 
              }
            });
          } catch (error) {
            console.error('Error loading content:', error);
            this.toastService.show('Error', 'Failed to load content');
            this.router.navigate(['/home', categoryKey]);
          }
        }else{
          this.router.navigate(['/home', categoryKey]);
        }
      });
    });
  }
} 