// src/components/EmojiCategorySelector.jsx
import React, { useState } from 'react';
import './EmojiCategorySelector.css';

const EmojiCategorySelector = ({ categories, onSelection, player1Default, player2Default }) => {
  const categoryKeys = Object.keys(categories);
  const [p1Cat, setP1Cat] = useState(player1Default || categoryKeys[0]);
  const [p2Cat, setP2Cat] = useState(player2Default || (categoryKeys.length > 1 ? categoryKeys[1] : categoryKeys[0]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (p1Cat && p2Cat) {
      onSelection(p1Cat, p2Cat);
    }
  };

  const renderSelector = (playerId, value, onChange, otherPlayerCat) => {
    return (
      <div className="player-selection">
        <label htmlFor={`player${playerId}-category`}>Player {playerId} Category:</label>
        <select
          id={`player${playerId}-category`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {categoryKeys.map(key => (
            <option key={key} value={key} disabled={key === otherPlayerCat && categoryKeys.length > 1}>
              {categories[key].name} ({categories[key].emojis.slice(0,3).join(' ') + (categories[key].emojis.length > 3 ? '...' : '')})
            </option>
          ))}
        </select>
      </div>
    );
  };


  return (
    <div className="category-selector-container">
      <h2>Choose Your Emoji Categories!</h2>
      <form onSubmit={handleSubmit} className="category-form">
        {renderSelector(1, p1Cat, setP1Cat, p2Cat)}
        {renderSelector(2, p2Cat, setP2Cat, p1Cat)}
        <button type="submit" className="start-game-button" disabled={!p1Cat || !p2Cat || p1Cat === p2Cat}>
          Start Game
        </button>
        {p1Cat === p2Cat && p1Cat && <p className="category-warning">Players must choose different categories!</p>}
      </form>
    </div>
  );
};

export default EmojiCategorySelector;