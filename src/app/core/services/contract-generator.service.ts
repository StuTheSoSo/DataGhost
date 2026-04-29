import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Contract, ContractType, ContractStatus, FactionId,
  PuzzleType, GameState, StoryAct
} from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectCurrentChapter, selectFactionReps } from '../store/game.selectors';

const CONTRACT_TITLES: Record<ContractType, string[]> = {
  [ContractType.DataTheft]:         ['Extract R&D Files', 'Siphon Financial Records', 'Clone Database Shard'],
  [ContractType.AccountAccess]:     ['Ghost Login — Executive Account', 'Backdoor Priority System', 'Credential Harvest'],
  [ContractType.EvidencePlant]:     ['Fabricate Transaction Log', 'Insert Fake Comms Trail', 'Seed False Metadata'],
  [ContractType.TraceClean]:        ['Wipe Bounce Trail', 'Scrub Proxy Logs', 'Erase Intrusion Signature'],
  [ContractType.Sabotage]:          ['Corrupt Firmware Update', 'Brick SCADA Node', 'Inject Logic Bomb'],
  [ContractType.SocialEngineering]: ['Phish Senior Analyst', 'Impersonate IT Support', 'Manipulate Insider']
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
      'A suspicious connection left a faint signature in the relay chain. Trace the source and confirm whether the contact is friend or foe.',
    type: ContractType.AccountAccess,
    difficulty: 3,
    payout: 2200,
    factionAffiliation: FactionId.DataGhost,
    repEffects: { [FactionId.DataGhost]: 3 },
    timeLimit: null,
    puzzleType: PuzzleType.PatternIntrusion,
    puzzleAnswer: undefined,
    isStoryMission: true,
    chapterRequirement: 4,
    storyFlag: 'act1_signal_found'
  },
  {
    title: 'Helios Probe — Confirm the Leak',
    description:
      'Helios intel points to a compromised facility. Get in, validate the leak, and leave a clean trail. This is not a paycheck — it is proof.',
    type: ContractType.DataTheft,
    difficulty: 5,
    payout: 4200,
    factionAffiliation: FactionId.Helios,
    repEffects: { [FactionId.Helios]: 3 },
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: undefined,
    isStoryMission: true,
    chapterRequirement: 9,
    storyFlag: 'helios_identified'
  }
];

const FACTIONS = [FactionId.DataGhost, FactionId.EasternNetwork, FactionId.WesternAlliance];

/** Pre-written puzzle contracts — all clues self-contained in the description. */
const PUZZLE_MISSIONS: Array<Omit<Contract, 'id' | 'status' | 'expiresAt'>> = [
  {
    title: 'Pattern Lock — Helios Sub-Node',
    description:
      'The Helios relay node uses a numeric PIN derived from its cluster config. ' +
      'Internal docs list 4 active relay clusters: Alpha (3 nodes), Beta (4 nodes), ' +
      'Gamma (2 nodes), Delta (5 nodes). ' +
      'The PIN is the product of all cluster sizes.',
    type: ContractType.AccountAccess,
    difficulty: 2,
    payout: 1600,
    factionAffiliation: FactionId.Helios,
    repEffects: { [FactionId.Helios]: -2 },
    timeLimit: null,
    puzzleType: PuzzleType.PatternIntrusion,
    puzzleAnswer: '120',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Mirror Protocol — Dev Credentials',
    description:
      'NovaCorp\'s lead developer uses a reversed codename as their system password. ' +
      'The company directory lists their assigned codename as NEXUS. ' +
      'Enter the reversed string, all lowercase.',
    type: ContractType.AccountAccess,
    difficulty: 1,
    payout: 900,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'suxen',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Ghost Signal — Auth Node Echo',
    description:
      'A probe bounced off the internal auth node and returned binary data: ' +
      '01000111 01001000 01001111 01010011 01010100. ' +
      'Each 8-bit group encodes a standard ASCII character. ' +
      'The access keyword is the full decoded string, lowercase.',
    type: ContractType.DataTheft,
    difficulty: 4,
    payout: 3200,
    factionAffiliation: FactionId.DataGhost,
    repEffects: { [FactionId.DataGhost]: 3, [FactionId.WesternAlliance]: -1 },
    timeLimit: null,
    puzzleType: PuzzleType.BinaryHexDecode,
    puzzleAnswer: 'ghost',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Sequential Gate — Bootloader Cipher',
    description:
      'The vault access counter increments following the pattern embedded in the bootloader. ' +
      'The log shows the last five values: 3, 6, 12, 24, 48. ' +
      'The correct PIN is the next number in the sequence.',
    type: ContractType.AccountAccess,
    difficulty: 3,
    payout: 2400,
    factionAffiliation: FactionId.EasternNetwork,
    repEffects: { [FactionId.EasternNetwork]: 2 },
    timeLimit: null,
    puzzleType: PuzzleType.PatternIntrusion,
    puzzleAnswer: '96',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Intercepted Transmission — Cipher Layer',
    description:
      'A traffic intercept captured the target\'s encrypted passphrase: YDXOW. ' +
      'The sysadmin\'s recovered personal notes mention: "standard shift of three, like always." ' +
      'Each letter was shifted forward by 3 positions in the alphabet. ' +
      'Decode the ciphertext and enter the plaintext word, lowercase.',
    type: ContractType.TraceClean,
    difficulty: 4,
    payout: 3400,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'vault',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Embedded Key — Security Briefing',
    description:
      'A leaked internal security briefing contains a hidden acrostic — the first letter of each ' +
      'sentence spells the master key. The briefing reads:\n' +
      '"Segregated access tiers protect against insider threats. ' +
      'Kernel-level monitoring is active on all nodes. ' +
      'You must authenticate with a hardware token. ' +
      'Logs are archived offsite every 24 hours. ' +
      'Only root admins can override MFA. ' +
      'Communications are TLS 1.3 encrypted. ' +
      'Keepalive packets are signed with HMAC."\n' +
      'Enter the seven-letter acrostic, lowercase.',
    type: ContractType.EvidencePlant,
    difficulty: 5,
    payout: 4200,
    factionAffiliation: FactionId.WesternAlliance,
    repEffects: { [FactionId.WesternAlliance]: 3, [FactionId.EasternNetwork]: -2 },
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'skylock',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Seniority Protocol — Root Token Access',
    description:
      'Root token generation is restricted to the sysadmin hired earliest. ' +
      'Three admins have access: Chen, Novak, and Park. ' +
      'Records show: the company was founded in 2019. ' +
      'Chen joined 3 years after the founding. ' +
      'Novak joined 2 years after Chen. ' +
      'Park joined the year the company was founded. ' +
      'Enter the eligible admin\'s surname, lowercase.',
    type: ContractType.AccountAccess,
    difficulty: 3,
    payout: 2600,
    factionAffiliation: null,
    repEffects: {},
    timeLimit: null,
    puzzleType: PuzzleType.SocialEngineering,
    puzzleAnswer: 'park',
    isStoryMission: false,
    chapterRequirement: null,
  },
  {
    title: 'Corporate Override — Motto Passphrase',
    description:
      'NovaCorp\'s emergency override passphrase is built from the last letter of each word ' +
      'in their internal motto. The motto is printed on the leaked employee handbook cover: ' +
      '"SECURE NETWORK ACCESS PROTOCOL". ' +
      'Concatenate the four terminal letters, uppercase, no spaces.',
    type: ContractType.Sabotage,
    difficulty: 2,
    payout: 1800,
    factionAffiliation: FactionId.EasternNetwork,
    repEffects: { [FactionId.EasternNetwork]: -3, [FactionId.DataGhost]: 1 },
    timeLimit: null,
    puzzleType: PuzzleType.CipherDecode,
    puzzleAnswer: 'EKSL',
    isStoryMission: false,
    chapterRequirement: null,
  },
];

@Injectable({ providedIn: 'root' })
export class ContractGeneratorService {
  private chapter = 1;

  constructor(private store: Store<{ game: GameState }>) {
    this.store.select(selectCurrentChapter).subscribe(c => this.chapter = c);
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

    // Fill the rest with procedural contracts
    const proceduralCount = Math.max(0, count - puzzleCount - storyCount);
    const procedural: Contract[] = [];
    for (let i = 0; i < proceduralCount; i++) {
      procedural.push(this.generateOne(rng, i));
    }

    // Shuffle together so puzzles and story missions don't always appear in the same order.
    return [...chosenPuzzles, ...storyContracts, ...procedural].sort(() => rng() - 0.5);
  }

  private buildStoryContracts(): Contract[] {
    return STORY_MISSIONS.map((m, i) => ({
      ...m,
      id: `story_${Date.now()}_${i}`,
      status: ContractStatus.Available,
      expiresAt: Date.now() + (3600 * 1000 * 24 * 3)
    }));
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
        : this.buildDescription(type, difficulty),
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

  private buildDescription(type: ContractType, difficulty: number): string {
    const tier = difficulty <= 3 ? 'entry-level' : difficulty <= 6 ? 'mid-tier' : 'high-value';
    const descs: Record<ContractType, string> = {
      [ContractType.DataTheft]:         `Probe the target host, locate the vault node, and exfiltrate the payload across a stealthy route. ${tier} security expected.`,
      [ContractType.AccountAccess]:     `Breach a protected login gateway and escalate privileges without tripping the IDS. ${tier} access challenge.`,
      [ContractType.EvidencePlant]:     `Insert forged packets into a target database stream and make the event appear legitimate. ${tier} stealth required.`,
      [ContractType.TraceClean]:        `Wipe intrusion footprints from the relay chain and restore log integrity. ${tier} cleanup operation.`,
      [ContractType.Sabotage]:          `Deliver a covert payload to hostile infrastructure and trigger a plausible failure. ${tier} hardening in place.`,
      [ContractType.SocialEngineering]: `Bend a human target into granting you access to a secure network. ${tier} psychological op.`
    };
    return descs[type];
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
