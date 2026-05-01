// ── Enums ──────────────────────────────────────────────────

export enum OriginArchetype {
  ExMilitary = 'ex_military',
  ExCorp = 'ex_corp',
  SelfTaught = 'self_taught',
  AcademicDropout = 'academic_dropout'
}

export enum FactionId {
  DataGhost = 'dataghost',
  EasternNetwork = 'ens',
  WesternAlliance = 'wa',
  Helios = 'helios'
}

export enum ContractType {
  DataTheft = 'data_theft',
  AccountAccess = 'account_access',
  EvidencePlant = 'evidence_plant',
  TraceClean = 'trace_clean',
  Sabotage = 'sabotage',
  SocialEngineering = 'social_engineering'
}

export enum ContractStatus {
  Available = 'available',
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed',
  Expired = 'expired'
}

export enum StoryAct {
  Act0 = 0,
  Act1 = 1,
  Act2 = 2,
  Act3 = 3,
  Sandbox = 4
}

export enum GameEndingType {
  None = 'none',
  Whistleblower = 'whistleblower',
  Ghost = 'ghost',
  Operator = 'operator'
}

export enum PuzzleType {
  CipherDecode = 'cipher_decode',
  NetworkTopology = 'network_topology',
  PatternIntrusion = 'pattern_intrusion',
  BinaryHexDecode = 'binary_hex_decode',
  SocialEngineering = 'social_engineering',
  FilesystemTraverse = 'filesystem_traverse',
  PasswordCascade = 'password_cascade'
}

export enum HardwareSlot {
  CPU = 'cpu',
  RAM = 'ram',
  Bandwidth = 'bandwidth'
}

export enum AchievementCategory {
  Story       = 'story',
  Skill       = 'skill',
  Economy     = 'economy',
  Faction     = 'faction',
  Progression = 'progression'
}

export type DailyChallengeType =
  | 'complete_contracts'
  | 'no_trace'
  | 'earn_credits'
  | 'faction_contract';

// ── Core interfaces ─────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt: number | null; // unix ms; null = locked
  creditReward: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: DailyChallengeType;
  targetValue: number;
  currentValue: number;
  creditReward: number;
  expiresAt: number; // unix ms
  completed: boolean;
}

export interface LeaderboardEntry {
  alias: string;
  archetype: string;
  totalCreditsEarned: number;
  contractsCompleted: number;
  timestamp: number; // unix ms
}

export interface AccessibilitySettings {
  colorblindMode: boolean;
  largeFontMode: boolean;
}

export interface PlayerIdentity {
  alias: string;
  archetype: OriginArchetype;
  /** Stat bonuses granted by archetype: keys are stat names, values are 0-10 */
  statBonuses: Record<string, number>;
}

export interface FactionReputation {
  factionId: FactionId;
  score: number; // -100 to 100
  revealed: boolean; // Helios is hidden until Act 2
}

export interface ProxyNode {
  id: string;
  name: string;
  region: string;
  latency: number;   // ms — affects trace rate
  reliability: number; // 0-1
  owned: boolean;
  tier: number; // 1-5
}

export interface RigStats {
  cpu: number;      // 1-10: puzzle timer bonus
  ram: number;      // 1-10: simultaneous tool slots
  bandwidth: number; // 1-10: affects trace accumulation rate
}

export interface SoftwareItem {
  id: string;
  name: string;
  type: 'exploit' | 'decoy' | 'cracker' | 'wiper' | 'social_kit';
  tier: number;
  equipped: boolean;
  description: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  type: ContractType;
  difficulty: number; // 1-10
  payout: number;
  factionAffiliation: FactionId | null;
  /** Rep change per faction on completion { factionId: delta } */
  repEffects: Partial<Record<FactionId, number>>;
  timeLimit: number | null; // seconds, null = no limit
  status: ContractStatus;
  puzzleType: PuzzleType;
  /** If set, the objective stage requires the player to enter this answer (case-insensitive, trimmed) */
  puzzleAnswer?: string;
  isStoryMission: boolean;
  chapterRequirement: number | null;
  storyFlag?: string;
  expiresAt: number | null; // unix ms
}

export interface NpcMessage {
  id: string;
  fromAlias: string;
  factionId: FactionId | null;
  subject: string;
  body: string;
  timestamp: number;
  read: boolean;
  isStoryTrigger: boolean;
  storyFlag?: string;
  isBlocking?: boolean;
}

export interface StoryBlockedState {
  isBlocked: boolean;
  messageId: string | null;
}

export interface StoryFlag {
  key: string;
  value: boolean | string | number;
  setAt: number; // unix ms
}

// ── Root game state ─────────────────────────────────────────

export interface GameState {
  initialized: boolean;
  player: PlayerIdentity | null;
  credits: number;
  currentAct: StoryAct;
  currentChapter: number;
  ending: GameEndingType;
  factionReputations: Record<FactionId, FactionReputation>;
  rig: RigStats;
  ownedSoftware: SoftwareItem[];
  ownedNodes: ProxyNode[];
  activeRouteNodeIds: string[]; // ordered bounce route
  contracts: Contract[];
  activeContractId: string | null;
  inbox: NpcMessage[];
  storyFlags: Record<string, StoryFlag>;
  totalCreditsEarned: number;
  contractsCompleted: number;
  isAdFree: boolean;
  lastSavedAt: number; // unix ms
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  leaderboard: LeaderboardEntry[];
  accessibility: AccessibilitySettings;
  storyBlocked: StoryBlockedState;
}

export const initialFactionReputations: Record<FactionId, FactionReputation> = {
  [FactionId.DataGhost]: { factionId: FactionId.DataGhost, score: 0, revealed: true },
  [FactionId.EasternNetwork]: { factionId: FactionId.EasternNetwork, score: 0, revealed: true },
  [FactionId.WesternAlliance]: { factionId: FactionId.WesternAlliance, score: 0, revealed: true },
  [FactionId.Helios]: { factionId: FactionId.Helios, score: 0, revealed: false }
};

export const initialRig: RigStats = { cpu: 1, ram: 1, bandwidth: 1 };

export const initialSoftware: SoftwareItem[] = [
  {
    id: 'password-cracker',
    name: 'Password Cracker',
    type: 'cracker',
    tier: 1,
    equipped: true,
    description: 'Cracks weak auth layers and reduces password challenge time.'
  },
  {
    id: 'log-deleter',
    name: 'Log Deleter',
    type: 'wiper',
    tier: 1,
    equipped: true,
    description: 'Erases intrusion records and keeps trace growth under control.'
  }
];

export const initialAchievements: Achievement[] = [
  { id: 'first_contract',        title: 'First Blood',          description: 'Complete your first contract.',                      icon: 'checkmark-circle-outline',   category: AchievementCategory.Progression, unlockedAt: null, creditReward: 200 },
  { id: 'ten_contracts',         title: 'Network Phantom',      description: 'Complete 10 contracts.',                             icon: 'flash-outline',              category: AchievementCategory.Progression, unlockedAt: null, creditReward: 500 },
  { id: 'twenty_five_contracts', title: 'Digital Ghost',        description: 'Complete 25 contracts.',                             icon: 'skull-outline',              category: AchievementCategory.Progression, unlockedAt: null, creditReward: 1500 },
  { id: 'ghost_run',             title: 'Ghost Protocol',       description: 'Complete a contract with 0% trace at disconnect.',   icon: 'eye-off-outline',            category: AchievementCategory.Skill,       unlockedAt: null, creditReward: 750 },
  { id: 'speed_demon',           title: 'Overclock',            description: 'Complete a hack in under 90 seconds.',               icon: 'speedometer-outline',        category: AchievementCategory.Skill,       unlockedAt: null, creditReward: 600 },
  { id: 'puzzle_master',         title: 'Access Granted',       description: 'Solve a mission access code on the first attempt.',  icon: 'key-outline',                category: AchievementCategory.Skill,       unlockedAt: null, creditReward: 400 },
  { id: 'rig_hardened',          title: 'Hardened Rig',         description: 'Upgrade any hardware stat to level 5.',              icon: 'hardware-chip-outline',      category: AchievementCategory.Progression, unlockedAt: null, creditReward: 800 },
  { id: 'full_loadout',          title: 'Full Loadout',         description: 'Own 5 or more software tools.',                      icon: 'apps-outline',               category: AchievementCategory.Progression, unlockedAt: null, creditReward: 600 },
  { id: 'crypto_flush',          title: 'Crypto Flush',         description: 'Earn a total of 10,000 credits.',                    icon: 'cash-outline',               category: AchievementCategory.Economy,     unlockedAt: null, creditReward: 500 },
  { id: 'crypto_whale',          title: 'Crypto Whale',         description: 'Earn a total of 50,000 credits.',                    icon: 'diamond-outline',            category: AchievementCategory.Economy,     unlockedAt: null, creditReward: 2000 },
  { id: 'faction_allied',        title: 'Allied',               description: 'Reach +50 reputation with any faction.',             icon: 'ribbon-outline',             category: AchievementCategory.Faction,     unlockedAt: null, creditReward: 700 },
  { id: 'faction_rival',         title: 'Marked',               description: 'Reach -50 reputation with any faction.',             icon: 'alert-circle-outline',       category: AchievementCategory.Faction,     unlockedAt: null, creditReward: 400 },
  { id: 'helios_exposed',        title: 'Helios Exposed',       description: 'Uncover the hidden Helios faction.',                 icon: 'warning-outline',            category: AchievementCategory.Story,       unlockedAt: null, creditReward: 1000 },
  { id: 'act2_reached',          title: 'Deeper Network',       description: 'Reach Act 2 of the story.',                         icon: 'layers-outline',             category: AchievementCategory.Story,       unlockedAt: null, creditReward: 500 },
  { id: 'act3_reached',          title: 'Point of No Return',   description: 'Reach Act 3 of the story.',                         icon: 'nuclear-outline',            category: AchievementCategory.Story,       unlockedAt: null, creditReward: 1000 },
  { id: 'ending_ghost',          title: 'Ghost',                description: 'Finish the story as a Ghost.',                       icon: 'moon-outline',               category: AchievementCategory.Story,       unlockedAt: null, creditReward: 2000 },
  { id: 'ending_whistleblower',  title: 'Whistleblower',        description: 'Finish the story as a Whistleblower.',               icon: 'megaphone-outline',          category: AchievementCategory.Story,       unlockedAt: null, creditReward: 2000 },
  { id: 'ending_operator',       title: 'Operator',             description: 'Finish the story as an Operator.',                   icon: 'briefcase-outline',          category: AchievementCategory.Story,       unlockedAt: null, creditReward: 2000 }
];

export const initialGameState: GameState = {
  initialized: false,
  player: null,
  credits: 500,
  currentAct: StoryAct.Act0,
  currentChapter: 0,
  ending: GameEndingType.None,
  factionReputations: initialFactionReputations,
  rig: initialRig,
  ownedSoftware: initialSoftware,
  ownedNodes: [],
  activeRouteNodeIds: [],
  contracts: [],
  activeContractId: null,
  inbox: [],
  storyFlags: {},
  totalCreditsEarned: 0,
  contractsCompleted: 0,
  isAdFree: false,
  lastSavedAt: 0,
  achievements: initialAchievements,
  dailyChallenges: [],
  leaderboard: [],
  accessibility: { colorblindMode: false, largeFontMode: false },
  storyBlocked: {
    isBlocked: false,
    messageId: null
  }
};
