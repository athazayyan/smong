export function getNextBoardPosition(position: number, steps: number) {
  return ((position - 1 + steps) % 25) + 1;
}

export function didPassStart(previousPosition: number, steps: number) {
  return previousPosition - 1 + steps >= 25;
}

export function getClockwiseDistance(fromPosition: number, toPosition: number) {
  if (toPosition >= fromPosition) return toPosition - fromPosition;
  return 25 - fromPosition + toPosition;
}

export function isAtEscapeBuilding(position: number) {
  return position === 8 || position === 15;
}

export function getStepsTowardEscapeBuilding(position: number, maxSteps: number) {
  const dist8 = getClockwiseDistance(position, 8);
  const dist15 = getClockwiseDistance(position, 15);
  const distance = Math.min(dist8, dist15);
  if (distance === 0) return 0;
  return Math.min(distance, maxSteps);
}
