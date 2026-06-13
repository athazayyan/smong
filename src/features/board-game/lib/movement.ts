export function getNextBoardPosition(position: number, steps: number) {
  return ((position - 1 + steps) % 40) + 1;
}

export function didPassStart(previousPosition: number, steps: number) {
  return previousPosition - 1 + steps >= 40;
}

export function getClockwiseDistance(fromPosition: number, toPosition: number) {
  if (toPosition >= fromPosition) return toPosition - fromPosition;
  return 40 - fromPosition + toPosition;
}

export function isAtEscapeBuilding(position: number) {
  return position === 11;
}

export function getStepsTowardEscapeBuilding(position: number, maxSteps: number) {
  const distance = getClockwiseDistance(position, 11);
  if (distance === 0) return 0;
  return Math.min(distance, maxSteps);
}
