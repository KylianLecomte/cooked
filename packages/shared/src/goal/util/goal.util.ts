import { GOAL_KCAL_DELTA, Goal } from "../type/goal.type";

export function getGoalDeltaLabel(goal: Goal) {
  const goalDelta = GOAL_KCAL_DELTA[goal];
  if (goalDelta < 0) return `-${Math.abs(goalDelta)}`;
  if (goalDelta > 0) return `+${goalDelta}`;
  return "Maintenance";
}
