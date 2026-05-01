import { createReducer, on } from '@ngrx/store';
import { GameState, initialGameState, ContractStatus, StoryAct } from '../models/game.models';
import * as GameActions from './game.actions';

export const gameReducer = createReducer(
  initialGameState,

  // ── Init ─────────────────────────────────────────────────
  on(GameActions.loadSavedGameSuccess, (state, { state: saved }) => ({
    ...state,
    ...saved,
    initialized: true
  })),
  on(GameActions.loadSavedGameFailure, (state) => ({
    ...state,
    initialized: true
  })),

  // ── Identity ─────────────────────────────────────────────
  on(GameActions.setPlayerIdentity, (state, { player }) => ({
    ...state,
    player,
    initialized: true,
    currentAct: StoryAct.Act1,
    currentChapter: 1
  })),

  // ── Economy ──────────────────────────────────────────────
  on(GameActions.earnCredits, (state, { amount }) => ({
    ...state,
    credits: state.credits + amount,
    totalCreditsEarned: state.totalCreditsEarned + amount
  })),
  on(GameActions.spendCredits, (state, { amount }) => ({
    ...state,
    credits: Math.max(0, state.credits - amount)
  })),

  // ── Contracts ────────────────────────────────────────────
  on(GameActions.setContracts, (state, { contracts }) => ({
    ...state,
    contracts
  })),
  on(GameActions.appendContracts, (state, { contracts }) => {
    const existingIds = new Set(state.contracts.map(c => c.id));
    const existingTitles = new Set(state.contracts
      .filter(c => c.status === ContractStatus.Available)
      .map(c => c.title));
    const fresh = contracts.filter(c => !existingIds.has(c.id) && !existingTitles.has(c.title));
    return { ...state, contracts: [...state.contracts, ...fresh] };
  }),
  on(GameActions.startContract, (state, { contractId }) => ({
    ...state,
    activeContractId: contractId,
    contracts: state.contracts.map(c =>
      c.id === contractId ? { ...c, status: ContractStatus.Active } : c
    )
  })),
  on(GameActions.completeContract, (state, { contractId }) => ({
    ...state,
    activeContractId: state.activeContractId === contractId ? null : state.activeContractId,
    contracts: state.contracts.map(c =>
      c.id === contractId ? { ...c, status: ContractStatus.Completed } : c
    ),
    contractsCompleted: state.contractsCompleted + 1,
    currentChapter: state.currentChapter + 1
  })),
  on(GameActions.failContract, (state, { contractId }) => ({
    ...state,
    activeContractId: state.activeContractId === contractId ? null : state.activeContractId,
    contracts: state.contracts.map(c =>
      c.id === contractId ? { ...c, status: ContractStatus.Failed } : c
    )
  })),
  on(GameActions.expireContracts, (state) => {
    const now = Date.now();
    return {
      ...state,
      contracts: state.contracts.map(c =>
        c.status === ContractStatus.Available && c.expiresAt && c.expiresAt < now
          ? { ...c, status: ContractStatus.Expired }
          : c
      )
    };
  }),

  // ── Faction ──────────────────────────────────────────────
  on(GameActions.adjustReputation, (state, { factionId, delta }) => ({
    ...state,
    factionReputations: {
      ...state.factionReputations,
      [factionId]: {
        ...state.factionReputations[factionId],
        score: Math.min(100, Math.max(-100,
          state.factionReputations[factionId].score + delta
        ))
      }
    }
  })),
  on(GameActions.revealFaction, (state, { factionId }) => ({
    ...state,
    factionReputations: {
      ...state.factionReputations,
      [factionId]: { ...state.factionReputations[factionId], revealed: true }
    }
  })),

  // ── Rig ──────────────────────────────────────────────────
  on(GameActions.upgradeRig, (state, { stat, newValue }) => ({
    ...state,
    rig: { ...state.rig, [stat]: Math.min(10, newValue) }
  })),
  on(GameActions.acquireSoftware, (state, { item }) => ({
    ...state,
    ownedSoftware: [...state.ownedSoftware, item]
  })),
  on(GameActions.toggleSoftware, (state, { itemId }) => ({
    ...state,
    ownedSoftware: state.ownedSoftware.map(s =>
      s.id === itemId ? { ...s, equipped: !s.equipped } : s
    )
  })),
  on(GameActions.upgradeSoftware, (state, { itemId, newTier }) => ({
    ...state,
    ownedSoftware: state.ownedSoftware.map(s =>
      s.id === itemId ? { ...s, tier: Math.min(5, newTier) } : s
    )
  })),

  // ── Nodes ────────────────────────────────────────────────
  on(GameActions.acquireNode, (state, { node }) => ({
    ...state,
    ownedNodes: [...state.ownedNodes, { ...node, owned: true }]
  })),
  on(GameActions.setActiveRoute, (state, { nodeIds }) => ({
    ...state,
    activeRouteNodeIds: nodeIds
  })),

  // ── Story ────────────────────────────────────────────────
  on(GameActions.setStoryFlag, (state, { key, value }) => ({
    ...state,
    storyFlags: {
      ...state.storyFlags,
      [key]: { key, value, setAt: Date.now() }
    }
  })),
  on(GameActions.advanceChapter, (state, { chapter, act }) => ({
    ...state,
    currentChapter: chapter,
    currentAct: act
  })),
  on(GameActions.setEnding, (state, { ending }) => ({
    ...state,
    ending
  })),

  // ── Inbox ────────────────────────────────────────────────
  on(GameActions.addMessage, (state, { message }) => ({
    ...state,
    inbox: [message, ...state.inbox]
  })),
  on(GameActions.markMessageRead, (state, { messageId }) => ({
    ...state,
    inbox: state.inbox.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    )
  })),

  // ── Monetization ─────────────────────────────────────────
  on(GameActions.setAdFree, (state, { adFree }) => ({
    ...state,
    isAdFree: adFree
  })),

  // ── Achievements ─────────────────────────────────────────
  on(GameActions.unlockAchievement, (state, { achievementId }) => {
    const already = state.achievements.find(a => a.id === achievementId && a.unlockedAt !== null);
    if (already) return state;
    const achievement = state.achievements.find(a => a.id === achievementId);
    return {
      ...state,
      achievements: state.achievements.map(a =>
        a.id === achievementId ? { ...a, unlockedAt: Date.now() } : a
      ),
      credits: state.credits + (achievement?.creditReward ?? 0),
      totalCreditsEarned: state.totalCreditsEarned + (achievement?.creditReward ?? 0)
    };
  }),

  // ── Daily Challenges ─────────────────────────────────────
  on(GameActions.setDailyChallenges, (state, { challenges }) => ({
    ...state,
    dailyChallenges: challenges
  })),
  on(GameActions.updateChallengeProgress, (state, { challengeId, value }) => ({
    ...state,
    dailyChallenges: state.dailyChallenges.map(c =>
      c.id === challengeId ? { ...c, currentValue: Math.min(c.targetValue, c.currentValue + value) } : c
    )
  })),
  on(GameActions.completeDailyChallenge, (state, { challengeId }) => {
    const challenge = state.dailyChallenges.find(c => c.id === challengeId);
    return {
      ...state,
      dailyChallenges: state.dailyChallenges.map(c =>
        c.id === challengeId ? { ...c, completed: true, currentValue: c.targetValue } : c
      ),
      credits: state.credits + (challenge?.creditReward ?? 0),
      totalCreditsEarned: state.totalCreditsEarned + (challenge?.creditReward ?? 0)
    };
  }),

  // ── Leaderboard ──────────────────────────────────────────
  on(GameActions.addLeaderboardEntry, (state, { entry }) => {
    const updated = [...state.leaderboard, entry]
      .sort((a, b) => b.totalCreditsEarned - a.totalCreditsEarned)
      .slice(0, 10);
    return { ...state, leaderboard: updated };
  }),

  // ── Accessibility ────────────────────────────────────────
  on(GameActions.setAccessibility, (state, { settings }) => ({
    ...state,
    accessibility: settings
  })),

  // ── Persistence ──────────────────────────────────────────
  on(GameActions.gameSaved, (state, { timestamp }) => ({
    ...state,
    lastSavedAt: timestamp
  }))
);
