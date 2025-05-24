
import React from 'react';
import Cell from './Cell';
import './Board.css';

const Board = ({ cells, onCellClick, disabled, vacatedCellThisTurn, winningLine }) => {
  return (
    <div className={`board ${disabled ? 'disabled' : ''}`}>
      {cells.map((cellData, index) => {
        const isWinningCell = winningLine && winningLine.includes(index);
        return (
          <Cell
            key={index}
            value={cellData ? cellData.emoji : null}
            onClick={() => onCellClick(index)}
            isDisabled={disabled || !!cellData || vacatedCellThisTurn === index}
            isVacatedThisTurn={vacatedCellThisTurn === index}
            isWinningCell={isWinningCell}
            cellData={cellData} 
          />
        );
      })}
    </div>
  );
};

export default Board;