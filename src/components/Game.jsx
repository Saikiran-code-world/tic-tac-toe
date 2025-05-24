// src/components/Game.jsx
import React, { useState, useEffect, useCallback } from "react";
import Board from "./Board";
import EmojiCategorySelector from "./EmojiCategorySelector";
import HelpModal from "./HelpModal";
import {
  EMOJI_CATEGORIES,
  PLAYER_1,
  PLAYER_2,
  MAX_EMOJIS_PER_PLAYER,
  GAME_PHASES,
} from "../constants";
import "./Game.css";

const initialBoard = () => Array(9).fill(null);

const Game = () => {
  const [board, setBoard] = useState(initialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [player1Category, setPlayer1Category] = useState(null);
  const [player2Category, setPlayer2Category] = useState(null);
  const [player1Emojis, setPlayer1Emojis] = useState([]);
  const [player2Emojis, setPlayer2Emojis] = useState([]);
  const [currentTurnEmoji, setCurrentTurnEmoji] = useState(null);
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.CATEGORY_SELECTION);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [message, setMessage] = useState("Select your emoji categories to start!");
  const [vacatedCellThisTurn, setVacatedCellThisTurn] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [winningLine, setWinningLine] = useState([]);

  const getRandomEmoji = useCallback((categoryKey) => {
    if (!categoryKey || !EMOJI_CATEGORIES[categoryKey]) return "❓";
    const emojis = EMOJI_CATEGORIES[categoryKey].emojis;
    return emojis[Math.floor(Math.random() * emojis.length)];
  }, []);

  useEffect(() => {
    if (gamePhase === GAME_PHASES.PLAYING && !winner && !isDraw) {
      const category =
        currentPlayer === PLAYER_1 ? player1Category : player2Category;
      setCurrentTurnEmoji(getRandomEmoji(category));
      setMessage(
        `Player ${currentPlayer}'s turn. Place your ${
          EMOJI_CATEGORIES[category]?.name || ""
        } emoji!`
      );
    }
  }, [
    currentPlayer,
    gamePhase,
    player1Category,
    player2Category,
    winner,
    isDraw,
    getRandomEmoji,
  ]);

  const handleCategorySelection = (p1Category, p2Category) => {
    setPlayer1Category(p1Category);
    setPlayer2Category(p2Category);
    setGamePhase(GAME_PHASES.PLAYING);
    setCurrentPlayer(PLAYER_1);
    setMessage(""); // Updated in useEffect
  };

  const checkWinCondition = useCallback(
    (currentBoard) => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (let line of lines) {
        const [a, b, c] = line;
        if (
          currentBoard[a] &&
          currentBoard[a].player === currentBoard[b]?.player &&
          currentBoard[a].player === currentBoard[c]?.player
        ) {
          const winningPlayer = currentBoard[a].player;
          const categoryKey = winningPlayer === PLAYER_1 ? player1Category : player2Category;
          const isEmojiFromCategory = (emoji, categoryKey) =>
            EMOJI_CATEGORIES[categoryKey]?.emojis.includes(emoji);
          if (
            isEmojiFromCategory(currentBoard[a].emoji, categoryKey) &&
            isEmojiFromCategory(currentBoard[b].emoji, categoryKey) &&
            isEmojiFromCategory(currentBoard[c].emoji, categoryKey)
          ) {
            setWinningLine(line);
            return winningPlayer;
          }
        }
      }
      return null;
    },
    [player1Category, player2Category]
  );

  const checkDrawCondition = (boardState) => {
    return boardState.every((cell) => cell !== null);
  };

  const handleCellClick = (index) => {
    if (
      gamePhase !== GAME_PHASES.PLAYING ||
      board[index] ||
      winner ||
      isDraw ||
      vacatedCellThisTurn === index
    ) {
      if (vacatedCellThisTurn === index) {
        setMessage("Cannot place on the cell just vacated this turn. Try another!");
      }
      return;
    }

    const newBoard = [...board];
    let newPlayerEmojis =
      currentPlayer === PLAYER_1 ? [...player1Emojis] : [...player2Emojis];
    const newEmojiId = crypto.randomUUID();

    if (newPlayerEmojis.length >= MAX_EMOJIS_PER_PLAYER) {
      const oldest = newPlayerEmojis.shift();
      newBoard[oldest.cellIndex] = null;
      setVacatedCellThisTurn(oldest.cellIndex);
    } else {
      setVacatedCellThisTurn(null);
    }

    newBoard[index] = {
      emoji: currentTurnEmoji,
      player: currentPlayer,
      id: newEmojiId,
    };
    newPlayerEmojis.push({
      emoji: currentTurnEmoji,
      cellIndex: index,
      id: newEmojiId,
    });

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
      const categoryName =
        EMOJI_CATEGORIES[
          gameWinner === PLAYER_1 ? player1Category : player2Category
        ]?.name || `Player ${gameWinner}`;
      setMessage(`${categoryName} (Player ${gameWinner}) Wins! 🎉`);
    } else if (checkDrawCondition(newBoard)) {
      setIsDraw(true);
      setGamePhase(GAME_PHASES.WON);
      setMessage("It's a Draw! 🤝");
    } else {
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
    setIsDraw(false);
    setMessage("Select your emoji categories to start!");
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
        <p className={`message ${winner || isDraw ? "winner-message" : ""}`}>{message}</p>
        {!winner && !isDraw && gamePhase === GAME_PHASES.PLAYING && currentTurnEmoji && (
          <p className="current-emoji-display">
            Your emoji: <span className="emoji-char">{currentTurnEmoji}</span>
          </p>
        )}
      </div>

      <Board
        cells={board}
        onCellClick={handleCellClick}
        disabled={gamePhase !== GAME_PHASES.PLAYING || !!winner || isDraw}
        vacatedCellThisTurn={vacatedCellThisTurn}
        winningLine={winningLine}
      />

      <div className="game-controls">
        <button onClick={resetGame} className="control-button">
          {gamePhase === GAME_PHASES.WON ? "Play Again" : "Restart Game"}
        </button>
        <button onClick={() => setShowHelp(true)} className="control-button help-button">
          Help
        </button>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="player-info-panel">
        <div className={`player-info ${currentPlayer === PLAYER_1 && gamePhase === GAME_PHASES.PLAYING ? "active-player" : ""}`}>
          <strong>
            Player 1 ({EMOJI_CATEGORIES[player1Category]?.name || "N/A"}) Emojis:
          </strong>
          <div className="emoji-queue">
            {player1Emojis.map((e) => (
              <span key={e.id} className="emoji-char-small">{e.emoji}</span>
            ))}
          </div>
        </div>
        <div className={`player-info ${currentPlayer === PLAYER_2 && gamePhase === GAME_PHASES.PLAYING ? "active-player" : ""}`}>
          <strong>
            Player 2 ({EMOJI_CATEGORIES[player2Category]?.name || "N/A"}) Emojis:
          </strong>
          <div className="emoji-queue">
            {player2Emojis.map((e) => (
              <span key={e.id} className="emoji-char-small">{e.emoji}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
