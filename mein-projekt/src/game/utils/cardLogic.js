// --- Card Value Mapping ---
export const getCardValue = (card) => {
  if (card.isJoker) return 0;
  
  switch (card.rank) {
    case 'A': return 14;
    case 'K': return 13;
    case 'Q': return 12;
    case 'J': return 11;
    default: 
      return parseInt(card.rank, 10);
  }
};

// --- Battle Score Calculation ---
export const calculateBattleScore = (playedCards) => {
  let redScore = 0;
  let blackScore = 0;
  let hasRedDragon = false;
  let hasBlackDragon = false;
  
  playedCards.forEach(card => {
    if (!card) return;

    if (card.isJoker) {
      if (card.id === 'Joker1') hasRedDragon = true;
      if (card.id === 'Joker2') hasBlackDragon = true;
      return;
    }
    
    const value = getCardValue(card);
    
    if (card.color === '#DC2626') {
      redScore += value;
    } else if (card.color === '#000000') {
      blackScore += value;
    }
  });

  if (hasRedDragon) {
    redScore *= 2;
  }
  if (hasBlackDragon) {
    blackScore *= 2;
  }

  return redScore + blackScore;
};

// --- Deck Generation ---
export const generateDeck = () => {
  const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5','4','3','2'];
  const suits = [
    { symbol: '♠', color: '#000000' }, 
    { symbol: '♥', color: '#DC2626' }, 
    { symbol: '♦', color: '#DC2626' }, 
    { symbol: '♣', color: '#000000' } 
  ];

  let cards = [];

  ranks.forEach(rank => {
    suits.forEach(suit => {
      cards.push({
        id: `${rank}${suit.symbol}`,
        rank: rank,
        suit: suit.symbol,
        color: suit.color,
        isJoker: false,
      });
    });
  });

  cards.push({ id: 'Joker1', rank: 'DRAGON', suit: '🐉', color: '#991B1B', isJoker: true });
  cards.push({ id: 'Joker2', rank: 'DRAGON', suit: '🐉', color: '#374151', isJoker: true });

  return cards.sort(() => Math.random() - 0.5);
};