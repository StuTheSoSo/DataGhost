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

// ── Core interfaces ─────────────────────────────────────────

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
  lastSavedAt: 0
};
