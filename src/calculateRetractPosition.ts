export function calculateRetractPosition(
  blockPosition: [number, number, number],
  retractDistance: number
) {
  // Center of the screen (core)
  const center = [0, 0, 0];

  // Calculate the direction vector towards the center
  const direction = [
    center[0] - blockPosition[0],
    center[1] - blockPosition[1],
    center[2] - blockPosition[2],
  ];

  // Compute the magnitude (length) of the direction vector
  const magnitude = Math.sqrt(
    direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2
  );

  // Normalize the direction vector (unit vector)
  const normalizedDirection = [
    direction[0] / magnitude,
    direction[1] / magnitude,
    direction[2] / magnitude,
  ];

  // Scale the normalized direction by the retract distance
  const scaledDirection = [
    normalizedDirection[0] * retractDistance,
    normalizedDirection[1] * retractDistance,
    normalizedDirection[2] * retractDistance,
  ];

  // Calculate the new retracted position
  const newPosition = [
    blockPosition[0] + scaledDirection[0],
    blockPosition[1] + scaledDirection[1],
    blockPosition[2] + scaledDirection[2],
  ];

  return newPosition as [number, number, number];
}
