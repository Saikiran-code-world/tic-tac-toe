// src/components/HelpModal.jsx
import React from 'react';
import './HelpModal.css';

const HelpModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        <h2>How to Play Blink Tac Toe</h2>
        
        <section>
          <h3>Objective</h3>
          <p>Be the first player to get 3 of your emojis in a row (horizontally, vertically, or diagonally).</p>
        </section>

        <section>
          <h3>Game Setup</h3>
          <ol>
            <li>Each player chooses an emoji category.</li>
            <li>Player 1 starts the game.</li>
          </ol>
        </section>
        
        <section>
          <h3>Gameplay</h3>
          <ul>
            <li>On your turn, you'll be assigned a random emoji from your chosen category.</li>
            <li>Click an empty cell on the 3x3 grid to place your emoji.</li>
          </ul>
        </section>

        <section>
          <h3>The Vanishing Rule (Important!)</h3>
          <ul>
            <li>Each player can only have a maximum of <strong>3 emojis</strong> on the board at any time.</li>
            <li>When you place your 4th emoji:
              <ul>
                <li>Your <strong>oldest</strong> emoji on the board disappears (First-In, First-Out).</li>
                <li>The cell where your oldest emoji was becomes empty.</li>
                <li><strong>Crucially:</strong> You cannot place your new (4th) emoji onto the exact cell where your oldest emoji just vanished *in the same turn*.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h3>Winning</h3>
          <p>Form a line of 3 of your own emojis to win. The winning emojis must all belong to you.</p>
        </section>
        
        <section>
          <h3>Game End</h3>
          <p>The game ends when a player wins. Draws are not possible due to the dynamic nature of the board.</p>
          <p>Click "Play Again" to start a new game from category selection.</p>
        </section>

        <button onClick={onClose} className="modal-understand-button">Got it!</button>
      </div>
    </div>
  );
};

export default HelpModal;