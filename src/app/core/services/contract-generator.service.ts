import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Contract, ContractType, ContractStatus, FactionId,
  PuzzleType, GameState, StoryAct
} from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectCurrentChapter, selectFactionReps, selectStoryFlags } from '../store/game.selectors';

const CONTRACT_TITLES: Record<ContractType, string[]> = {
  [ContractType.DataTheft]:         ['Extract R&D Files', 'Siphon Financial Records', 'Clone Database Shard', 'Proprietary Source Leak', 'Ransomware Retrieval'],
  [ContractType.AccountAccess]:     ['Ghost Login — Executive Account', 'Backdoor Priority System', 'Credential Harvest', 'Biometric Bypass', 'SSH Key Injection'],
  [ContractType.EvidencePlant]:     ['Fabricate Transaction Log', 'Insert Fake Comms Trail', 'Seed False Metadata', 'Digital Frame-up', 'Modify Financial Ledger'],
  [ContractType.TraceClean]:        ['Wipe Bounce Trail', 'Scrub Proxy Logs', 'Erase Intrusion Signature', 'Zero-Day Cleanup', 'Over-write Forensic Logs'],
  [ContractType.Sabotage]:          ['Corrupt Firmware Update', 'Brick SCADA Node', 'Inject Logic Bomb', 'Overload Power Grid', 'Brute-force Hardware Shutdown'],
  [ContractType.SocialEngineering]: ['Phish Senior Analyst', 'Impersonate IT Support', 'Manipulate Insider', 'Vishing Campaign', 'Deepfake Audio Injection']
};

const PUZZLE_FOR_TYPE: Record<ContractType, PuzzleType> = {
  [ContractType.DataTheft]:         PuzzleType.FilesystemTraverse,
  [ContractType.AccountAccess]:     PuzzleType.PasswordCascade,
  [ContractType.EvidencePlant]:     PuzzleType.BinaryHexDecode,
  [ContractType.TraceClean]:        PuzzleType.NetworkTopology,
  [ContractType.Sabotage]:          PuzzleType.PatternIntrusion,
  [ContractType.SocialEngineering]: PuzzleType.SocialEngineering
};

const STORY_MISSIONS: Array<Omit<Contract, 'id' | 'status' | 'expiresAt'>> = [
  {
    title: 'Signal Source — Vector Trace',
    description:
      'A binary relay signature came back from a ghost node. Decode the probe report and identify the hidden source tag that betrayed the contact chain.',
    type: ContractType.AccountAccess,
    difficulty: 3,
    payout: 2600,
    factionAffiliation: FactionId.DataGhost,
    repEffects: { [FactionId.DataGhost]: 4 },
    timeLimit: null,
    puzzleType: PuzzleType.BinaryHexDecode,
    puzzleAnswer: 'echo',
    isStoryMission: true,
    chapterRequirement: 1,
    storyFlag: 'act1_signal_found'
  },
  {
    title: 'Helios Probe — Confirm the Leak',
    description:
      'A leak from the Helios network suggests an insider data operation. Infiltrate, validate the breach, and prove the facility is compromised.',
    type: ContractType.DataTheft,
    difficulty: 5,
    payout: 4200,
    factionAffiliation: FactionId.Helios,
    repEffects: { [FactionId.Helios]: 3 },
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'helios',
    isStoryMission: true,
    chapterRequirement: 1,
    storyFlag: 'act1_helios_confirmed'
  },
  {
    title: 'Relay Corruption — Hidden Node',
    description:
      'A phantom relay node is corrupting the eastern backbone. Map the node topology and enter the missing node identifier to expose the hidden threat.',
    type: ContractType.TraceClean,
    difficulty: 4,
    payout: 3600,
    factionAffiliation: FactionId.EasternNetwork,
    repEffects: { [FactionId.EasternNetwork]: 3 },
    timeLimit: null,
    puzzleType: PuzzleType.NetworkTopology,
    puzzleAnswer: '3',
    isStoryMission: true,
    chapterRequirement: 2,
    storyFlag: 'act2_relay_exposed'
  },
  {
    title: 'Archive Cipher — Material Proof',
    description:
      'A buried archive holds the evidence of a cover-up. Recover the secret passphrase hidden inside the briefing and prove the deeper conspiracy.',
    type: ContractType.EvidencePlant,
    difficulty: 4,
    payout: 3800,
    factionAffiliation: FactionId.WesternAlliance,
    repEffects: { [FactionId.WesternAlliance]: 3, [FactionId.DataGhost]: -1 },
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'proof',
    isStoryMission: true,
    chapterRequirement: 2,
    storyFlag: 'act2_archive_recovered'
  }
];

const FACTIONS = [FactionId.DataGhost, FactionId.EasternNetwork, FactionId.WesternAlliance];

/** Pre-written puzzle contracts — all clues self-contained in the description. */
const PUZZLE_MISSIONS: Array<Omit<Contract, 'id' | 'status' | 'expiresAt'>> = [
  {
    title: 'Logical Silo — Redundant Array',
    description:
      'Three servers (Red, Blue, Green) store three unique archives (Alpha, Beta, Gamma). ' +
      'The Red server does not hold Alpha. The Green server holds Gamma. ' +
      'The access key is the name of the server holding the Alpha archive, lowercase.',
    type: ContractType.AccountAccess,
    difficulty: 2,
    payout: 1800,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.PasswordCascade,
    puzzleAnswer: 'blue',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Bit-Shift — Handshake Protocol',
    description:
      'The legacy auth-gate uses a simple character shift. ' +
      'Shift each letter of the word "DATA" forward by exactly one position ' +
      'in the alphabet (e.g., A becomes B). Enter the resulting 4-letter string, lowercase.',
    type: ContractType.AccountAccess,
    difficulty: 2,
    payout: 1500,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'ebub',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'The "Knock" Sequence — BIOS Gate',
    description:
      'The firewall requires a "knock" based on an incremental sequence. ' +
      'The last four digits were: 2, 6, 12, 20. ' +
      'The next number is the access code.',
    type: ContractType.AccountAccess,
    difficulty: 3,
    payout: 2200,
    factionAffiliation: FactionId.EasternNetwork,
    repEffects: { [FactionId.EasternNetwork]: 2 },
    timeLimit: null,
    puzzleType: PuzzleType.PatternIntrusion,
    puzzleAnswer: '30',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Binary Weight — Parity Check',
    description:
      'The system checksum is based on "Bit Weight." ' +
      'Calculate the number of "1" bits in the binary representation of decimal 15. ' +
      'Enter the total count as a single digit.',
    type: ContractType.TraceClean,
    difficulty: 4,
    payout: 2800,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.PatternIntrusion,
    puzzleAnswer: '4',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Subnet Topology — Node Count',
    description:
      'A deep-space network has 3 subnets. Each subnet contains 3 nodes. ' +
      'Each node hosts 3 distinct databases. ' +
      'The master key is the total number of databases in the network.',
    type: ContractType.DataTheft,
    difficulty: 3,
    payout: 2400,
    factionAffiliation: FactionId.Helios,
    repEffects: { [FactionId.Helios]: 2 },
    timeLimit: null,
    puzzleType: PuzzleType.PatternIntrusion,
    puzzleAnswer: '27',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Keyboard Offset — Input Error',
    description:
      'A password was typed one key to the right of the intended keys on a QWERTY keyboard. ' +
      'The typed string was: "f_s_y_s". ' +
      'Recover the original 4-letter word and enter it in lowercase.',
    type: ContractType.AccountAccess,
    difficulty: 3,
    payout: 2500,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'data',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Logical Triage — Admin Clearance',
    description:
      'Three admins (Chen, Novak, Park) have access levels: 1, 2, and 3. ' +
      'Park is level 2. Chen is not level 3. ' +
      'The access key is the surname of the Level 3 admin, lowercase.',
    type: ContractType.SocialEngineering,
    difficulty: 3,
    payout: 2100,
    factionAffiliation: FactionId.EasternNetwork,
    repEffects: { [FactionId.EasternNetwork]: 3 },
    timeLimit: null,
    puzzleType: PuzzleType.SocialEngineering,
    puzzleAnswer: 'novak',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'ASCII Sum — Checkpoint Beta',
    description:
      'In the standard ASCII table, "A" is 65 and "B" is 66. ' +
      'The access code is the character located at position (65 + 7). ' +
      'Enter the single character, lowercase.',
    type: ContractType.AccountAccess,
    difficulty: 2,
    payout: 1600,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'h',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'The Prime Directive — Security Level',
    description:
      'The security override is the only prime number between 90 and 100. ' +
      'Enter the 2-digit number to bypass the gate.',
    type: ContractType.Sabotage,
    difficulty: 4,
    payout: 3200,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.PatternIntrusion,
    puzzleAnswer: '97',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Keyword Anagram — Storage Vault',
    description:
      'The vault unlock key is an anagram of the word "ROUTED". ' +
      'The plaintext keyword means "a long or roundabout journey." ' +
      'Enter the 6-letter word, lowercase.',
    type: ContractType.DataTheft,
    difficulty: 4,
    payout: 3500,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'detour',
    isStoryMission: false,
    chapterRequirement: null,
  },
];

@Injectable({ providedIn: 'root' })
export class ContractGeneratorService {
  private chapter = 1;
  private storyFlags: Record<string, unknown> = {};

  constructor(private store: Store<{ game: GameState }>) {
    this.store.select(selectCurrentChapter).subscribe(c => this.chapter = c);
    this.store.select(selectStoryFlags).subscribe(flags => this.storyFlags = flags);
  }

  /** Generate a pool of procedural contracts for the job board */
  generatePool(count: number, seed?: number): Contract[] {
    const rng = this.seededRng(seed ?? Date.now());

    // Pick 2 puzzle missions (different each refresh via seed)
    const puzzleCount = Math.min(2, PUZZLE_MISSIONS.length);
    const shuffledPuzzles = [...PUZZLE_MISSIONS].sort(() => rng() - 0.5);
    const chosenPuzzles: Contract[] = shuffledPuzzles.slice(0, puzzleCount).map((p, i) => ({
      ...p,
      id: `puzzle_${Date.now()}_${i}`,
      status: ContractStatus.Available,
      expiresAt: Date.now() + (3600 * 1000 * 24),
    }));

    // Add story missions to the board so the narrative path is visible and unlocks over time.
    const storyContracts = this.buildStoryContracts().slice(0, 2);
    const storyCount = storyContracts.length;

    const tutorialFollowup = this.chapter === 1 ? [this.buildTutorialFollowupContract(rng)] : [];
    const tutorialCount = tutorialFollowup.length;

    // Fill the rest with procedural contracts
    const proceduralCount = Math.max(0, count - puzzleCount - storyCount - tutorialCount);
    const procedural: Contract[] = [];
    for (let i = 0; i < proceduralCount; i++) {
      procedural.push(this.generateOne(rng, i));
    }

    // Shuffle together so puzzles and story missions don't always appear in the same order.
    return [...chosenPuzzles, ...storyContracts, ...tutorialFollowup, ...procedural].sort(() => rng() - 0.5);
  }

  private buildStoryContracts(): Contract[] {
    const available = STORY_MISSIONS.filter(m => {
      if (m.chapterRequirement && this.chapter < m.chapterRequirement) return false;
      if (!m.storyFlag) return true;
      return !this.storyFlags[m.storyFlag];
    });

    return available.map((m, i) => ({
      ...m,
      id: `story_${Date.now()}_${i}`,
      status: ContractStatus.Available,
      expiresAt: Date.now() + (3600 * 1000 * 24 * 3)
    }));
  }

  private buildTutorialFollowupContract(rng: () => number): Contract {
    return {
      id: `tut_followup_${Date.now()}_${Math.floor(rng() * 1000)}`,
      title: 'Port Mapping — Gateway Scan',
      description:
        'Three ports are active on this gateway: 80, 443, and 8080. ' +
        'The target port is not the highest number. ' +
        'The target port is not the standard unencrypted web port (80). ' +
        'Enter the target port number.',
      type: ContractType.AccountAccess,
      difficulty: 2,
      payout: 1200,
      factionAffiliation: FactionId.DataGhost,
      repEffects: { [FactionId.DataGhost]: 1 },
      timeLimit: null,
      puzzleType: PuzzleType.PatternIntrusion,
      puzzleAnswer: '443',
      isStoryMission: false,
      chapterRequirement: 2,
      status: ContractStatus.Available,
      expiresAt: Date.now() + (3600 * 1000 * 24 * 2)
    };
  }

  private generateOne(rng: () => number, index: number): Contract {
    // First contract is always tutorial-friendly
    const isFirstContract = index === 0 && this.chapter === 1;
    
    let type: ContractType;
    let difficulty: number;
    
    if (isFirstContract) {
      // Tutorial contract: network entry flow, low pressure
      type = ContractType.TraceClean;
      difficulty = 1;
    } else {
      const types = Object.values(ContractType);
      type = types[Math.floor(rng() * types.length)] as ContractType;
      difficulty = Math.max(1, Math.min(10,
        Math.floor(this.chapter * 0.8 + rng() * 3)
      ));
    }
    
    const payout = Math.floor(difficulty * 800 + rng() * difficulty * 400);
    const factionRoll = rng();
    const faction = isFirstContract 
      ? FactionId.DataGhost  // First mission from DataGhost
      : (factionRoll < 0.3
        ? null
        : FACTIONS[Math.floor(rng() * FACTIONS.length)]);

    const titles = CONTRACT_TITLES[type];
    const title = isFirstContract 
      ? 'First Contact — Prove Your Chops'
      : titles[Math.floor(rng() * titles.length)];
    
    const hasTimeLimit = !isFirstContract && rng() > 0.5;
    const repEffects: Partial<Record<FactionId, number>> = {};
    if (faction) {
      repEffects[faction] = Math.ceil(difficulty / 2);
      // Opposing factions lose rep
      const opposing = FACTIONS.filter(f => f !== faction);
      opposing.forEach(f => {
        repEffects[f] = -Math.ceil(difficulty / 4);
      });
    }

    return {
      id: `proc_${Date.now()}_${index}`,
      title,
      description: isFirstContract
        ? 'Route through a clean proxy chain and breach the target gateway. Low-security intro contract with no time limit.'
        : this.buildDescription(type, difficulty, rng),
      type,
      difficulty,
      payout: isFirstContract ? 500 : payout, // Lower payout for tutorial
      factionAffiliation: faction,
      repEffects,
      timeLimit: hasTimeLimit ? 120 + Math.floor(rng() * 180) : null,
      status: ContractStatus.Available,
      puzzleType: PUZZLE_FOR_TYPE[type],
      isStoryMission: false,
      chapterRequirement: null,
      expiresAt: Date.now() + (3600 * 1000 * (6 + Math.floor(rng() * 18)))
    };
  }

  private buildDescription(type: ContractType, difficulty: number, rng: () => number): string {
    const tier = difficulty <= 3 ? 'low-security' : difficulty <= 6 ? 'standard-grade' : 'military-grade';
    const pressure = difficulty >= 7 ? 'Extreme caution advised.' : difficulty >= 4 ? 'Avoid prolonged exposure.' : 'Standard operational protocol applies.';

    const descs: Record<ContractType, string> = {
      [ContractType.DataTheft]:
        `Probe the target host, locate the vault node, and exfiltrate the payload across a stealthy route. ${tier} encryption detected. ${pressure}`,
      [ContractType.AccountAccess]:
        `Breach a protected login gateway and escalate privileges without tripping the IDS. This is a ${tier} access challenge. ${pressure}`,
      [ContractType.EvidencePlant]:
        `Insert forged packets into a target database stream and make the event appear legitimate. ${tier} stealth and precision required. ${pressure}`,
      [ContractType.TraceClean]:
        `Wipe intrusion footprints from the relay chain and restore log integrity. High-priority ${tier} cleanup operation. ${pressure}`,
      [ContractType.Sabotage]:
        `Deliver a covert payload to hostile infrastructure and trigger a plausible failure. ${tier} system hardening in place. ${pressure}`,
      [ContractType.SocialEngineering]:
        `Bend a human target into granting you access to a secure network via a ${tier} psychological operation. ${pressure}`
    };

    const flavors = [
      " Intel suggests a narrow window of opportunity.",
      " The target is currently under routine maintenance.",
      " Expect increased network traffic during the operation.",
      " Remote monitoring has been heightened in this sector.",
      " Local admins are reporting anomalous behavior.",
      " The system appears to be undergoing a security audit."
    ];
    const flavor = flavors[Math.floor(rng() * flavors.length)];

    return descs[type] + flavor;
  }

  /** Mulberry32 seeded RNG — deterministic, no crypto use */
  private seededRng(seed: number): () => number {
    let s = seed;
    return () => {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}
