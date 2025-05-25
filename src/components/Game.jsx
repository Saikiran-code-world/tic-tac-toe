// src/components/Game.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import EmojiCategorySelector from './EmojiCategorySelector';
import HelpModal from './HelpModal';
import { EMOJI_CATEGORIES, PLAYER_1, PLAYER_2, MAX_EMOJIS_PER_PLAYER, GAME_PHASES } from '../constants';
import './Game.css';

const initialBoard = () => Array(9).fill(null);

const Game = () => {
  const [board, setBoard] = useState(initialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [player1Category, setPlayer1Category] = useState(null);
  const [player2Category, setPlayer2Category] = useState(null);
  const [player1Emojis, setPlayer1Emojis] = useState([]);
  const [player2Emojis, setPlayer2Emojis] = useState([]);
  const [currentTurnEmoji, setCurrentTurnEmoji] = useState(null); // This holds the random emoji for the current turn
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.CATEGORY_SELECTION);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('Select your emoji categories to start!');
  const [vacatedCellThisTurn, setVacatedCellThisTurn] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [winningLine, setWinningLine] = useState([]);

  // useCallback ensures getRandomEmoji function reference is stable unless its own dependencies change (none here)
  const getRandomEmoji = useCallback((categoryKey) => {
    if (!categoryKey || !EMOJI_CATEGORIES[categoryKey] || EMOJI_CATEGORIES[categoryKey].emojis.length === 0) {
      // Fallback if category is invalid or empty
      console.warn(`Invalid or empty category: ${categoryKey}`);
      return '❓'; 
    }
    const emojis = EMOJI_CATEGORIES[categoryKey].emojis;
    return emojis[Math.floor(Math.random() * emojis.length)];
  }, []); // Empty dependency array means this function is created once and memoized

  // This useEffect hook runs when `currentPlayer` changes (among other dependencies)
  // It's responsible for setting the new random emoji for the upcoming turn.
  useEffect(() => {
    if (gamePhase === GAME_PHASES.PLAYING && !winner) {
      const categoryKeyForCurrentPlayer = currentPlayer === PLAYER_1 ? player1Category : player2Category;
      
      // *** THIS IS WHERE THE NEW RANDOM EMOJI FOR THE TURN IS PICKED ***
      const newRandomEmojiForTurn = getRandomEmoji(categoryKeyForCurrentPlayer);
      setCurrentTurnEmoji(newRandomEmojiForTurn); // Update state with the new random emoji

      const categoryName = EMOJI_CATEGORIES[categoryKeyForCurrentPlayer]?.name || 'Selected Category';
      setMessage(`Player ${currentPlayer}'s turn. Place your ${categoryName} emoji!`);
    }
  }, [currentPlayer, gamePhase, player1Category, player2Category, winner, getRandomEmoji]);
  // getRandomEmoji is stable due to useCallback, so this effect primarily re-runs due to currentPlayer changing.

  const handleCategorySelection = (p1Category, p2Category) => {
    setPlayer1Category(p1Category);
    setPlayer2Category(p2Category);
    setGamePhase(GAME_PHASES.PLAYING);
    setCurrentPlayer(PLAYER_1); // Player 1 starts
    // The useEffect above will then pick the first emoji for Player 1
  };

  const checkWinCondition = useCallback((currentBoard) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (currentBoard[a] && currentBoard[a].player === currentBoard[b]?.player && currentBoard[a].player === currentBoard[c]?.player) {
        const winningPlayer = currentBoard[a].player;
        const playerCategoryKey = winningPlayer === PLAYER_1 ? player1Category : player2Category;
        const isEmojiFromCategory = (emoji, categoryKey) => EMOJI_CATEGORIES[categoryKey]?.emojis.includes(emoji);

        if (isEmojiFromCategory(currentBoard[a].emoji, playerCategoryKey) &&
            isEmojiFromCategory(currentBoard[b].emoji, playerCategoryKey) &&
            isEmojiFromCategory(currentBoard[c].emoji, playerCategoryKey)) {
              setWinningLine(line);
              return winningPlayer;
            }
      }
    }
    return null;
  }, [player1Category, player2Category]);

  const handleCellClick = (index) => {
    if (gamePhase !== GAME_PHASES.PLAYING || board[index] || winner || (vacatedCellThisTurn === index)) {
      if (vacatedCellThisTurn === index) {
        setMessage("Cannot place on the cell where an emoji just vanished this turn. Try another cell!");
      }
      return;
    }

    const newBoard = [...board];
    let newPlayerEmojis = currentPlayer === PLAYER_1 ? [...player1Emojis] : [...player2Emojis];
    const newEmojiId = crypto.randomUUID(); 

    if (newPlayerEmojis.length >= MAX_EMOJIS_PER_PLAYER) {
      const oldestEmoji = newPlayerEmojis.shift(); 
      newBoard[oldestEmoji.cellIndex] = null; 
      setVacatedCellThisTurn(oldestEmoji.cellIndex); 
    } else {
      setVacatedCellThisTurn(null); 
    }

    // Place the currentTurnEmoji (which was randomly selected by the useEffect)
    newBoard[index] = { emoji: currentTurnEmoji, player: currentPlayer, id: newEmojiId };
    newPlayerEmojis.push({ emoji: currentTurnEmoji, cellIndex: index, id: newEmojiId });

    setBoard(newBoard);
    if (currentPlayer === PLAYER_1) {
      setPlayer1Emojis(newPlayerEmojis);
    } else {
      setPlayer2Emojis(newPlayerEmojis);
    }

    const gameWinner = checkWinCondition(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGamePhase(GAME_PHASES.WON);
      const winnerCategoryName = EMOJI_CATEGORIES[gameWinner === PLAYER_1 ? player1Category : player2Category]?.name || `Player ${gameWinner}`;
      setMessage(`${winnerCategoryName} (Player ${gameWinner}) Wins! 🎉`);
    } else {
      // Switch player, which will trigger the useEffect to pick a new random emoji for the next turn
      setCurrentPlayer(currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    }
  };

  const resetGame = () => {
    setBoard(initialBoard());
    setCurrentPlayer(PLAYER_1);
    setPlayer1Emojis([]);
    setPlayer2Emojis([]);
    setCurrentTurnEmoji(null);
    setGamePhase(GAME_PHASES.CATEGORY_SELECTION);
    setWinner(null);
    setMessage('Select your emoji categories to start!');
    setPlayer1Category(null);
    setPlayer2Category(null);
    setVacatedCellThisTurn(null);
    setWinningLine([]);
  };

  if (gamePhase === GAME_PHASES.CATEGORY_SELECTION) {
    return (
      <EmojiCategorySelector
        categories={EMOJI_CATEGORIES}
        onSelection={handleCategorySelection}
        player1Default={Object.keys(EMOJI_CATEGORIES)[0]}
        player2Default={Object.keys(EMOJI_CATEGORIES)[1] || Object.keys(EMOJI_CATEGORIES)[0]}
      />
    );
  }

  return (
    <div className="game-container">
      <div className="status-bar">
        <p className={`message ${winner ? 'winner-message' : ''}`}>{message}</p>
        {!winner && gamePhase === GAME_PHASES.PLAYING && currentTurnEmoji && (
          <p className="current-emoji-display">
            Your emoji: <span className="emoji-char">{currentTurnEmoji}</span> {/* This displays the random emoji for the turn */}
          </p>
        )}
      </div>

      <Board
        cells={board}
        onCellClick={handleCellClick}
        disabled={gamePhase !== GAME_PHASES.PLAYING || !!winner}
        vacatedCellThisTurn={vacatedCellThisTurn}
        winningLine={winningLine}
      />

      <div className="game-controls">
        <button onClick={resetGame} className="control-button">
          {gamePhase === GAME_PHASES.WON ? 'Play Again' : 'Restart Game'}
        </button>
        <button onClick={() => setShowHelp(true)} className="control-button help-button">
          Help
        </button>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      <div className="player-info-panel">
        <div className={`player-info ${currentPlayer === PLAYER_1 && gamePhase === GAME_PHASES.PLAYING ? 'active-player' : ''}`}>
          <strong>Player 1 ({EMOJI_CATEGORIES[player1Category]?.name || 'N/A'}) Emojis:</strong>
          <div className="emoji-queue">
            {player1Emojis.map(e => <span key={e.id} className="emoji-char-small">{e.emoji}</span>)}
          </div>
        </div>
        <div className={`player-info ${currentPlayer === PLAYER_2 && gamePhase === GAME_PHASES.PLAYING ? 'active-player' : ''}`}>
          <strong>Player 2 ({EMOJI_CATEGORIES[player2Category]?.name || 'N/A'}) Emojis:</strong>
          <div className="emoji-queue">
            {player2Emojis.map(e => <span key={e.id} className="emoji-char-small">{e.emoji}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;