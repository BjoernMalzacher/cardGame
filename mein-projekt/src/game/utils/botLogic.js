export const botPlayCard = (hand, played) => {
  if (played.every(c => c !== null)) return null;
  const emptyIndex = played.findIndex(c => c === null);
  if (hand.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * hand.length);
  return { cardIndex: randomIndex, slotIndex: emptyIndex };
};

export const botRevealCard = (isOpen) => {
  const revealableIndices = isOpen.map((open, idx) => open ? idx : -1).filter(idx => idx !== -1);
  if (revealableIndices.length === 0) return null;
  return revealableIndices[Math.floor(Math.random() * revealableIndices.length)];
};

export const botSwapCard = (hand, played, isOpen) => {
  // Can only swap if the card is NOT yet revealed
  const swappableIndices = played.map((card, idx) => card && isOpen[idx] ? idx : -1).filter(idx => idx !== -1);
  if (swappableIndices.length === 0) return null;
  return swappableIndices[Math.floor(Math.random() * swappableIndices.length)];
};

export const botSelectCard = (played) => {
  // Joker cards cannot be selected (Rule)
  const validCards = played.filter(c => c !== null && !c.isJoker);
  if (validCards.length === 0) return null;
  return validCards[Math.floor(Math.random() * validCards.length)];
};