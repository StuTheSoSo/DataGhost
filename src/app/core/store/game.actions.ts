import { createAction, props } from '@ngrx/store';
import {
  PlayerIdentity, Contract, NpcMessage, ProxyNode,
  SoftwareItem, RigStats, FactionId, StoryAct,
  GameEndingType, GameState
} from '../models/game.models';

// ── Init ───────────────────────────────────────────────────
export const loadSavedGame    = createAction('[Game] Load Saved Game');
export const loadSavedGameSuccess = createAction('[Game] Load Saved Game Success', props<{ state: Partial<GameState> }>());
export const loadSavedGameFailure = createAction('[Game] Load Saved Game Failure');

// ── Identity ───────────────────────────────────────────────
export const setPlayerIdentity = createAction('[Game] Set Player Identity', props<{ player: PlayerIdentity }>());

// ── Economy ───────────────────────────────────────────────
export const earnCredits  = createAction('[Economy] Earn Credits',  props<{ amount: number; reason: string }>());
export const spendCredits = createAction('[Economy] Spend Credits', props<{ amount: number; reason: string }>());

// ── Contracts ─────────────────────────────────────────────
export const setContracts        = createAction('[Contracts] Set Contracts',         props<{ contracts: Contract[] }>());
export const startContract       = createAction('[Contracts] Start Contract',        props<{ contractId: string }>());
export const completeContract    = createAction('[Contracts] Complete Contract',     props<{ contractId: string }>());
export const failContract        = createAction('[Contracts] Fail Contract',         props<{ contractId: string }>());
export const expireContracts     = createAction('[Contracts] Expire Stale Contracts');

// ── Faction ───────────────────────────────────────────────
export const adjustReputation    = createAction('[Faction] Adjust Reputation',      props<{ factionId: FactionId; delta: number }>());
export const revealFaction       = createAction('[Faction] Reveal Faction',         props<{ factionId: FactionId }>());

// ── Rig ───────────────────────────────────────────────────
export const upgradeRig          = createAction('[Rig] Upgrade Stat',               props<{ stat: keyof RigStats; newValue: number }>());
export const acquireSoftware     = createAction('[Rig] Acquire Software',           props<{ item: SoftwareItem }>());
export const toggleSoftware      = createAction('[Rig] Toggle Software Equipped',   props<{ itemId: string }>());

// ── Nodes ─────────────────────────────────────────────────
export const acquireNode         = createAction('[Nodes] Acquire Node',             props<{ node: ProxyNode }>());
export const setActiveRoute      = createAction('[Nodes] Set Active Route',         props<{ nodeIds: string[] }>());

// ── Story ─────────────────────────────────────────────────
export const setStoryFlag        = createAction('[Story] Set Flag',                 props<{ key: string; value: boolean | string | number }>());
export const advanceChapter      = createAction('[Story] Advance Chapter',          props<{ chapter: number; act: StoryAct }>());
export const setEnding           = createAction('[Story] Set Ending',               props<{ ending: GameEndingType }>());

// ── Inbox ─────────────────────────────────────────────────
export const addMessage          = createAction('[Inbox] Add Message',              props<{ message: NpcMessage }>());
export const markMessageRead     = createAction('[Inbox] Mark Read',                props<{ messageId: string }>());

// ── Monetization ──────────────────────────────────────────
export const setAdFree           = createAction('[Settings] Set Ad Free',           props<{ adFree: boolean }>());

// ── Persistence ───────────────────────────────────────────
export const gameSaved           = createAction('[Game] Game Saved',                props<{ timestamp: number }>());
