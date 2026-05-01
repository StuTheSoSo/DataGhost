import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState, ContractStatus, FactionId } from '../models/game.models';

export const selectGameState = createFeatureSelector<GameState>('game');

export const selectPlayer          = createSelector(selectGameState, s => s.player);
export const selectCredits         = createSelector(selectGameState, s => s.credits);
export const selectCurrentAct      = createSelector(selectGameState, s => s.currentAct);
export const selectCurrentChapter  = createSelector(selectGameState, s => s.currentChapter);
export const selectEnding          = createSelector(selectGameState, s => s.ending);
export const selectRig             = createSelector(selectGameState, s => s.rig);
export const selectOwnedSoftware   = createSelector(selectGameState, s => s.ownedSoftware);
export const selectEquippedSoftware = createSelector(selectOwnedSoftware, items => items.filter(i => i.equipped));
export const selectOwnedNodes      = createSelector(selectGameState, s => s.ownedNodes);
export const selectActiveRouteIds  = createSelector(selectGameState, s => s.activeRouteNodeIds);
export const selectActiveRoute     = createSelector(
  selectOwnedNodes, selectActiveRouteIds,
  (nodes, ids) => ids.map(id => nodes.find(n => n.id === id)).filter(Boolean)
);
export const selectFactionReps     = createSelector(selectGameState, s => s.factionReputations);
export const selectRevealedFactions = createSelector(selectFactionReps, reps =>
  Object.values(reps).filter(r => r.revealed)
);
export const selectFactionRep = (factionId: FactionId) =>
  createSelector(selectFactionReps, reps => reps[factionId]);

export const selectContracts       = createSelector(selectGameState, s => s.contracts);
export const selectAvailableContracts = createSelector(selectContracts, contracts =>
  contracts.filter(c => c.status === ContractStatus.Available)
);
export const selectActiveContractId = createSelector(selectGameState, s => s.activeContractId);
export const selectActiveContract  = createSelector(
  selectContracts, selectActiveContractId,
  (contracts, id) => contracts.find(c => c.id === id) ?? null
);

export const selectInbox           = createSelector(selectGameState, s => s.inbox);
export const selectAllMessages     = createSelector(selectInbox, msgs => [...msgs].reverse());
export const selectUnreadCount     = createSelector(selectInbox, msgs => msgs.filter(m => !m.read).length);
export const selectStoryFlags      = createSelector(selectGameState, s => s.storyFlags);
export const selectStoryFlag = (key: string) =>
  createSelector(selectStoryFlags, flags => flags[key]?.value ?? null);

export const selectIsAdFree        = createSelector(selectGameState, s => s.isAdFree);
export const selectIsInitialized   = createSelector(selectGameState, s => s.initialized);
export const selectStats           = createSelector(selectGameState, s => ({
  totalCreditsEarned: s.totalCreditsEarned,
  contractsCompleted: s.contractsCompleted
}));

// ── Achievements ─────────────────────────────────────────
export const selectAchievements        = createSelector(selectGameState, s => s.achievements);
export const selectUnlockedAchievements = createSelector(selectAchievements, list => list.filter(a => a.unlockedAt !== null));
export const selectLockedAchievements   = createSelector(selectAchievements, list => list.filter(a => a.unlockedAt === null));

// ── Daily Challenges ─────────────────────────────────────
export const selectDailyChallenges = createSelector(selectGameState, s => s.dailyChallenges);
export const selectActiveChallenges = createSelector(selectDailyChallenges, challenges => {
  const now = Date.now();
  return challenges.filter(c => !c.completed && c.expiresAt > now);
});
export const selectCompletedChallengesCount = createSelector(selectDailyChallenges, challenges =>
  challenges.filter(c => c.completed).length
);

// ── Leaderboard ───────────────────────────────────────────
export const selectLeaderboard = createSelector(selectGameState, s => s.leaderboard);

// ── Accessibility ─────────────────────────────────────────
export const selectAccessibility = createSelector(selectGameState, s => s.accessibility);

export const selectStoryBlocked = createSelector(selectGameState, s => s.storyBlocked);
