import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../content-renderer/services/settings.service';
import { UserPreferences } from '../../../../../core/models/content.models';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  preferences!: UserPreferences;

  constructor(
    private settingsService: SettingsService,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.settingsService.getPreferences().subscribe(prefs => {
      this.preferences = { ...prefs };
    });
  }

  onThemeChange() {
    // document.documentElement.dataset['theme'] = this.preferences.theme;

    this.settingsService.updatePreferences({ theme: this.preferences.theme });
  }

  async saveAndClose() {
    await this.settingsService.updatePreferences(this.preferences);
    this.activeModal.close();
  }

  dismiss() {
    this.activeModal.dismiss();
  }
} 
