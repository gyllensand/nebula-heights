// src/Maze.tsx
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";

interface Point {
  x: number;
  y: number;
}

interface LineProps {
  start: Point;
  end: Point;
}

const Maze: React.FC = () => {
  const [lines, setLines] = useState<LineProps[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const mazeLines = generateMaze(10, 10); // Customize grid size
    setLines(mazeLines);
  }, []);

  useFrame(() => {
    if (!expanded) {
      expandMaze();
    }
  });

  const expandMaze = () => {
    // Logic to gradually expand the maze lines
  };

  return (
    <>
      {lines.map((line, index) => (
        <Line
          key={index}
          points={[
            [line.start.x, line.start.y, 0],
            [line.end.x, line.end.y, 0],
          ]}
          color="black"
          lineWidth={2}
        />
      ))}
    </>
  );
};

const generateMaze = (width: number, height: number): LineProps[] => {
  // Depth-First Search or other maze generation algorithm
  const lines: LineProps[] = [];
  // Add lines to the array
  return lines;
};

export default Maze;
