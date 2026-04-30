import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

type TutorialStep = 'worldIntro' | 'identity' | 'hub' | 'inbox' | 'jobBoard' | 'firstMissionsDone' | 'rigUpgrade';

interface TutorialState {
  worldIntro: boolean;
  identity: boolean;
  hub: boolean;
  inbox: boolean;
  jobBoard: boolean;
  firstMissionsDone: boolean;
  rigUpgrade: boolean;
}

const TUTORIAL_KEY = 'dg_tutorial_state';

@Injectable({ providedIn: 'root' })
export class TutorialService {
  private state: TutorialState = {
    worldIntro: false,
    identity: false,
    hub: false,
    inbox: false,
    jobBoard: false,
    firstMissionsDone: false,
    rigUpgrade: false
  };

  async initialize(): Promise<void> {
    const { value } = await Preferences.get({ key: TUTORIAL_KEY });
    if (!value) return;

    try {
      const parsed = JSON.parse(value) as Partial<TutorialState>;
      this.state = {
        worldIntro: !!parsed.worldIntro,
        identity: !!parsed.identity,
        hub: !!parsed.hub,
        inbox: !!parsed.inbox,
        jobBoard: !!parsed.jobBoard,
        firstMissionsDone: !!parsed.firstMissionsDone,
        rigUpgrade: !!parsed.rigUpgrade
      };
    } catch {
      this.state = { worldIntro: false, identity: false, hub: false, inbox: false, jobBoard: false, firstMissionsDone: false, rigUpgrade: false };
    }
  }

  shouldShow(step: TutorialStep): boolean {
    return !this.state[step];
  }

  async complete(step: TutorialStep): Promise<void> {
    this.state = { ...this.state, [step]: true };
    await Preferences.set({ key: TUTORIAL_KEY, value: JSON.stringify(this.state) });
  }

  async reset(): Promise<void> {
    this.state = { worldIntro: false, identity: false, hub: false, inbox: false, jobBoard: false, firstMissionsDone: false, rigUpgrade: false };
    await Preferences.set({ key: TUTORIAL_KEY, value: JSON.stringify(this.state) });
  }
}
