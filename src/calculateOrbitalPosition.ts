export function calculateOrbitPosition(
  blockPosition: [number, number, number],
  angle: number
) {
  // Center of the screen
  const center = [0, 0, 0]; // Assuming the pole is at (0, 0, 0)

  // Calculate relative position to the center
  const relativePosition = [
    blockPosition[0] - center[0],
    blockPosition[1] - center[1], // Y remains unchanged
    blockPosition[2] - center[2],
  ];

  // Apply rotation around the Y-axis
  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);

  const rotatedX =
    relativePosition[0] * cosTheta - relativePosition[2] * sinTheta;
  const rotatedZ =
    relativePosition[0] * sinTheta + relativePosition[2] * cosTheta;

  // Calculate the new world position
  const newPosition = [
    rotatedX + center[0],
    blockPosition[1], // Y stays constant
    rotatedZ + center[2],
  ];

  return newPosition as [number, number, number];
}
