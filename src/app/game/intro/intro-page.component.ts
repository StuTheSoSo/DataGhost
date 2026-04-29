import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-intro-page',
  templateUrl: './intro-page.component.html',
  styleUrls: ['./intro-page.component.scss'],
  standalone: false
})
export class IntroPageComponent {
  constructor(
    private tutorial: TutorialService,
    private router: Router
  ) {}

  async continueToIdentity(): Promise<void> {
    await this.tutorial.complete('worldIntro');
    await this.router.navigate(['/identity'], { replaceUrl: true });
  }
}
