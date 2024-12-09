export function calculateOutwardPosition(
  blockPosition: [number, number, number],
  distance: number
) {
  // Center of the screen
  const center = [0, 0, 0]; // Assuming the center of the screen is at (0, 0, 0)

  // Calculate direction vector
  const direction = [
    blockPosition[0] - center[0],
    blockPosition[1] - center[1],
    blockPosition[2] - center[2],
  ];

  // Calculate the magnitude (length) of the direction vector
  const magnitude = Math.sqrt(
    direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2
  );

  // Normalize the direction vector
  const normalizedDirection = direction.map((v) => v / magnitude);

  // Calculate the new position by moving outward
  const newPosition = [
    blockPosition[0] + normalizedDirection[0] * distance,
    blockPosition[1] + normalizedDirection[1] * distance,
    blockPosition[2] + normalizedDirection[2] * distance,
  ];

  return newPosition as [number, number, number];
}
