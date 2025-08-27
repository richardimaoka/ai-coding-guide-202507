#!/usr/bin/env node
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import { findNextStep, Position } from './dijkstra.js';

const GRID_SIZE = 10;

interface GameState {
  player: Position;
  enemy: Position;
  grid: number[][];
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: { x: 0, y: 0 },
    enemy: { x: 4, y: 8 },
    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  });

  const [turn, setTurn] = useState(0);

  useInput((input, key) => {
    if (key.escape) {
      process.exit(0);
    }

    let newPlayer = { ...gameState.player };
    let moved = false;

    if (key.upArrow && gameState.player.y > 0) {
      newPlayer.y--;
      moved = true;
    } else if (key.downArrow && gameState.player.y < GRID_SIZE - 1) {
      newPlayer.y++;
      moved = true;
    } else if (key.leftArrow && gameState.player.x > 0) {
      newPlayer.x--;
      moved = true;
    } else if (key.rightArrow && gameState.player.x < GRID_SIZE - 1) {
      newPlayer.x++;
      moved = true;
    }

    if (moved) {
      // プレイヤーのターン後、敵を移動
      const nextStep = findNextStep(gameState.grid, gameState.enemy, newPlayer);
      const newEnemy = nextStep || gameState.enemy;

      setGameState({
        ...gameState,
        player: newPlayer,
        enemy: newEnemy
      });
      
      setTurn(turn + 1);
    }
  });

  const renderGrid = () => {
    const rows = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      let row = '';
      for (let x = 0; x < GRID_SIZE; x++) {
        if (gameState.player.x === x && gameState.player.y === y) {
          row += '@';
        } else if (gameState.enemy.x === x && gameState.enemy.y === y) {
          row += '#';
        } else {
          row += '.';
        }
      }
      rows.push(row);
    }
    
    return rows;
  };

  const gridRows = renderGrid();

  return (
    <Box flexDirection="column">
      <Text>ローグライクゲーム (Turn: {turn})</Text>
      <Text>矢印キー: 移動, ESC: 終了</Text>
      <Text>プレイヤー: @, 敵: #</Text>
      <Text> </Text>
      {gridRows.map((row, index) => (
        <Text key={index}>{row}</Text>
      ))}
      <Text> </Text>
      <Text>プレイヤー位置: ({gameState.player.x}, {gameState.player.y})</Text>
      <Text>敵位置: ({gameState.enemy.x}, {gameState.enemy.y})</Text>
    </Box>
  );
};

render(<Game />);