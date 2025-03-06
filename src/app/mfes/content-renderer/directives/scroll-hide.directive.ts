import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[crScrollHide]',
  standalone: true
})
export class ScrollHideDirective {
  private lastScroll = 0;
  private readonly SCROLL_THRESHOLD = 50;
  private readonly TRANSITION_DURATION = '0.3s';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    // Set initial styles
    this.renderer.setStyle(this.el.nativeElement, 'transition', `transform ${this.TRANSITION_DURATION} ease`);
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.scrollY;
    
    if (currentScroll <= 0) {
      // At the top of the page - show navbar
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
    } else if (currentScroll > this.lastScroll && currentScroll > this.SCROLL_THRESHOLD) {
      // Scrolling down & past threshold - hide navbar
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-100%)');
    } else {
      // Scrolling up - show navbar
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
    }
    
    this.lastScroll = currentScroll;
  }
} 