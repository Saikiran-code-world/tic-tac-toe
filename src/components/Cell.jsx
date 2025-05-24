// src/components/Cell.jsx
import React from 'react';
import './Cell.css';
import { PLAYER_1 } from '../constants'; // To style based on player

const Cell = ({ value, onClick, isDisabled, isVacatedThisTurn, isWinningCell, cellData }) => {
  let cellClasses = "cell";
  if (isDisabled && value) cellClasses += " filled"; // Already has an emoji
  if (isDisabled && !value && !isVacatedThisTurn) cellClasses += " disabled-empty"; // Game over, cell empty
  if (isVacatedThisTurn) cellClasses += " vacated-temporarily";
  if (isWinningCell) cellClasses += " winning-cell";
  
  // Add player-specific class if value exists
  if (cellData) {
    cellClasses += cellData.player === PLAYER_1 ? " player1" : " player2";
  }


  return (
    <button
      className={cellClasses}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`Cell ${value ? `contains ${value}` : 'empty'}`}
    >
      {value && <span className="emoji-display">{value}</span>}
      {isVacatedThisTurn && <span className="vacated-marker">🚫</span>}
    </button>
  );
};

export default Cell;