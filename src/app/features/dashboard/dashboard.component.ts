import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HealthService } from '../../core/services/health.service';
import { AuthService } from '../../core/auth/auth.service';


interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'list' | 'table';
  data: any;
  options?: any;
  config?: any;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="material-icons">trending_up</span>
          <h3>Total Users</h3>
          <p class="stat">1,234</p>
        </div>
        <div class="stat-card">
          <span class="material-icons">schedule</span>
          <h3>Active Sessions</h3>
          <p class="stat">856</p>
        </div>
        <div class="stat-card">
          <span class="material-icons">done_all</span>
          <h3>Tasks Completed</h3>
          <p class="stat">432</p>
        </div>
        <div class="stat-card">
          <span class="material-icons">error_outline</span>
          <h3>Pending Issues</h3>
          <p class="stat">13</p>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          @for (item of recentActivity; track item.id) {
            <div class="activity-item">
              <span class="material-icons">{{item.icon}}</span>
              <div class="activity-content">
                <p>{{item.description}}</p>
                <small>{{item.time}}</small>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card .material-icons {
      font-size: 2.5rem;
      color: var(--bs-primary);
    }

    .stat-card h3 {
      margin: 10px 0;
      color: var(--text-secondary);
    }

    .stat-card .stat {
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
      color: var(--text-primary);
    }

    .recent-activity {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      border-radius: 8px;
      background: var(--bg-secondary);
    }

    .activity-item .material-icons {
      color: var(--bs-primary);
    }

    .activity-content p {
      margin: 0;
      color: var(--text-primary);
    }

    .activity-content small {
      color: var(--text-secondary);
    }
  `]
})
export class DashboardComponent implements OnInit {
  recentActivity = [
    { id: 1, icon: 'person_add', description: 'New user registered', time: '5 minutes ago' },
    { id: 2, icon: 'task_alt', description: 'Task "Update Documentation" completed', time: '1 hour ago' },
    { id: 3, icon: 'sync', description: 'System update completed', time: '2 hours ago' },
    { id: 4, icon: 'warning', description: 'Server load high', time: '3 hours ago' }
  ];

  widgets: DashboardWidget[] = [];

  constructor(
    private healthService: HealthService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadWidgets();
  }

  private loadWidgets(): void {
    this.widgets = [
      {
        id: '1',
        title: 'User Growth',
        type: 'chart',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          datasets: [
            {
              label: 'Users',
              data: [120, 150, 180, 200, 220, 250],
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      },
      {
        id: '2',
        title: 'Active Sessions',
        type: 'metric',
        data: 856
      },
      {
        id: '3',
        title: 'Recent Activity',
        type: 'list',
        data: this.recentActivity
      },
      {
        id: '4',
        title: 'System Health',
        type: 'table',
        data: this.healthService.getSystemHealth()
      }
    ];
  }
}