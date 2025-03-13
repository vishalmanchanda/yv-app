import { Injectable } from '@angular/core';
import { HackathonDetails } from '../types/hackathon';

@Injectable({
  providedIn: 'root'
})
export class HackathonService {
  private hackathons: Record<string, HackathonDetails> = {
    'iyd-2025': {
      id: 'iyd-2025',
      title: 'The IYD Hackathon 2025',
      subtitle: 'Code. Collaborate. Conquer.',
      prizes: [
        { position: '1st Prize', amount: 'INR 20k', color: '#ffd700' },
        { position: '2nd Prize', amount: 'INR 10k', color: '#c0c0c0' },
        { position: '3rd Prize', amount: 'INR 5k', color: '#cd7f32' }
      ],
      tasks: [
        {
          description: 'Create a dataset of Valmiki Ramayana verses (English translations only) through web scraping.'
        },
        {
          description: 'Write a function which takes a statement as input from the user (relevant to Ramayana), and returns True if its factually correct and False if its incorrect.'
        },
        {
          description: 'If the user statement is not relevant to Ramayana or vague, return None.'
        },
        {
          description: 'Evaluation Criteria:',
          subTasks: [
            'Accuracy of the responses for 100 test sentences (20 of these will be shared with the registered participants for testing, and rest 80 to be revealed after submission).'
          ]
        }
      ],
      rules: [
        { rule: 'Each team should have 1-3 members.' },
        { rule: 'Team members can be students or working professionals.' },
        { rule: 'All the code or ideas used from elsewhere must be properly cited in the submission report.' },
        { rule: 'Use only Open Source LLMs like SBERT, LLaMA, etc for all tasks like embeddings, text generation, etc.' },
        { rule: 'The code submitted for final evaluation must be made openly available for anyone to use.' },
        { rule: 'Incomplete or inappropriate submissions will be rejected.' },
        { rule: 'Prize money will be distributed through UPI or as Amazon Gift Vouchers to the team lead.' },
        { rule: 'Decision of the judges will be final.' }
      ],
      dates: [
        { event: 'Register for free on UnStop', date: 'April 06, 2025', link: '#' },
        { event: 'First Webinar for registered participants', date: 'April 13, 2024' },
        { event: 'Progress monitoring meetings', date: 'May 11 and June 01' },
        { event: 'Final submission', date: 'June 08, 2025', isHighlighted: true },
        { event: 'Presentation of top 10 submissions', date: 'June 15, 2025' },
        { event: 'Prize Announcement', date: 'June 21, 2025', isHighlighted: true }
      ],
      sponsors: [
        {
          name: 'Dr. Kushal Shah',
          title: 'Chief Advisor to the Founders and Professor, Sitare University',
          link: 'https://www.linkedin.com/in/kushal-shah-95b9a3b/'
        },
        {
          name: 'Mr. Vishal Manchanda',
          title: 'Senior Principal Technology Architect, Infosys',
          link: 'https://www.linkedin.com/in/vishal-manchanda-097a6643/'
        },
        {
          name: 'and other well wishers',
          title: ''
        }
      ],
      contactEmail: 'info@yogavivek.org',
      isCompleted: false
    }
  };

  getHackathonDetails(id: string): HackathonDetails | undefined {
    return this.hackathons[id];
  }

  getAllHackathons(): HackathonDetails[] {
    return Object.values(this.hackathons);
  }
} 