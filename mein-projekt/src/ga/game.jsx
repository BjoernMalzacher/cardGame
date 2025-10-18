import React, { useState, useEffect } from 'react';

// --- Card Value Mapping ---
const getCardValue = (card) => {
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
const calculateBattleScore = (playedCards) => {
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

const generateDeck = () => {
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

const Card =  ({ card, onClick, selected = false, small = false }) => {
  const { rank, suit, color, isJoker } = card;
  const size = small ? { width: '70px', height: '105px', padding: '6px' } : { width: '100px', height: '150px', padding: '8px' };

  const cardStyle = {
    ...size,
    backgroundColor: isJoker ? '#F3F4F6' : '#FFFFFF',
    border: selected ? '3px solid #3B82F6' : isJoker ? '3px dashed #F87171' : '2px solid #D1D5DB',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  };

  if (!isJoker) {
    return (
      <div 
        style={cardStyle} 
        onClick={onClick}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ textAlign: 'left', color: color }}>
          <div style={{ fontSize: small ? '12px' : '16px', fontWeight: 'bold' }}>{rank}</div>
          <div style={{ fontSize: small ? '10px' : '12px' }}>{suit}</div>
        </div>

        <div style={{ textAlign: 'center', color: color, fontSize: small ? '24px' : '36px', opacity: 0.8 }}>
          {suit}
        </div>

        <div style={{ textAlign: 'right', color: color, transform: 'rotate(180deg)' }}>
          <div style={{ fontSize: small ? '12px' : '16px', fontWeight: 'bold' }}>{rank}</div>
          <div style={{ fontSize: small ? '10px' : '12px' }}>{suit}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{...cardStyle, backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}} 
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ fontSize: small ? '14px' : '18px', fontWeight: 'bold', color: color, letterSpacing: '2px' }}>
        {rank}
      </div>
      <div style={{ fontSize: small ? '28px' : '40px', color: color, marginTop: '4px' }}>
        {suit}
      </div>
    </div>
  );
};

const EmptySlot = ({ onClick }) => {
  return (
    <div 
      style={{
        width: '100px',
        height: '150px',
        border: '3px dashed #888888',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ color: '#888', fontSize: '12px', textAlign: 'center' }}>Leer</div>
    </div>
  );
};

const CardBack = () => {
  return (
    <div 
      style={{
        width: '100px',
        height: '150px',
        backgroundColor: '#1F2937',
        border: '2px solid #111827',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ fontSize: '48px', color: '#4B5563' }}>🂠</div>
    </div>
  );
};

export default function CardGame() {
  const [deck, setDeck] = useState(() => generateDeck());
  const [player1Hand, setPlayer1Hand] = useState(() => deck.slice(0, 9)); 
  const [player2Hand, setPlayer2Hand] = useState(() => deck.slice(9, 18)); 
  const [gameDeck, setGameDeck] = useState(() => deck.slice(18));
  
  const [player1Stack, setPlayer1Stack] = useState([]);
  const [player2Stack, setPlayer2Stack] = useState([]);
  
  const [player1Played, setPlayer1Played] = useState([null, null, null]);
  const [player2Played, setPlayer2Played] = useState([null, null, null]);
  
  const [isOpenPlayer1, setOpenPlayer1] = useState([true, true, true]);
  const [isOpenPlayer2, setOpenPlayer2] = useState([true, true, true]);
  
  const [roundWinner, setRoundWinner] = useState(null); 
  const [isBattleResolved, setIsBattleResolved] = useState(false);
  const [message, setMessage] = useState("Place 3 cards to begin the round.");
  const [gameEnded, setGameEnded] = useState(false);
  const [finalWinner, setFinalWinner] = useState(null);
  const [lastRevealPlayer, setLastRevealPlayer] = useState(null);
  const [isDrawPhase, setIsDrawPhase] = useState(false);
  const [player1DrawCard, setPlayer1DrawCard] = useState(null);
  const [player2DrawCard, setPlayer2DrawCard] = useState(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [botSwapCount, setBotSwapCount] = useState(0);

  // Bot-Logik
  const botPlayCard = (hand, played) => {
    if (played.every(c => c !== null)) return null;
    const emptyIndex = played.findIndex(c => c === null);
    if (hand.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * hand.length);
    return { cardIndex: randomIndex, slotIndex: emptyIndex };
  };

  const botRevealCard = (isOpen) => {
    const revealableIndices = isOpen.map((open, idx) => open ? idx : -1).filter(idx => idx !== -1);
    if (revealableIndices.length === 0) return null;
    return revealableIndices[Math.floor(Math.random() * revealableIndices.length)];
  };

  const botSwapCard = (hand, played, isOpen) => {
    const swappableIndices = played.map((card, idx) => card && isOpen[idx] ? idx : -1).filter(idx => idx !== -1);
    if (swappableIndices.length === 0) return null;
    return swappableIndices[Math.floor(Math.random() * swappableIndices.length)];
  };

  const botSelectCard = (played) => {
    const validCards = played.filter(c => c !== null && !c.isJoker);
    if (validCards.length === 0) return null;
    return validCards[Math.floor(Math.random() * validCards.length)];
  };

  // Bot-Automatisierungen
  useEffect(() => {
    if (!isBotThinking && !isBattleResolved && !gameEnded && !isDrawPhase) {
      if (player2Played.some(c => c === null) && player2Hand.length > 0) {
        setIsBotThinking(true);
        setTimeout(() => {
          const move = botPlayCard(player2Hand, player2Played);
          if (move) {
            const card = player2Hand[move.cardIndex];
            const newHand = player2Hand.filter((_, i) => i !== move.cardIndex);
            const newPlayed = [...player2Played];
            newPlayed[move.slotIndex] = card;
            setPlayer2Hand(newHand);
            setPlayer2Played(newPlayed);
          }
          setIsBotThinking(false);
        }, 800);
      }
    }
  }, [player1Played, player2Played, isBattleResolved, gameEnded, isDrawPhase, isBotThinking, player2Hand]);

  // Bot: Aufdecken und Tauschen
  useEffect(() => {
    if (!isBotThinking && !gameEnded && !isDrawPhase && isBattleResolved === false && player1Played.every(c => c !== null) && player2Played.every(c => c !== null)) {
      const p1HasRevealed = isOpenPlayer1.some(isOpen => !isOpen);
      const p2HasRevealed = isOpenPlayer2.some(isOpen => !isOpen);

      if (lastRevealPlayer !== 2) {
        const revealIdx = botRevealCard(isOpenPlayer2);
        if (revealIdx !== null) {
          setIsBotThinking(true);
          setTimeout(() => {
            const newOpen = [...isOpenPlayer2];
            newOpen[revealIdx] = false;
            setOpenPlayer2(newOpen);
            setLastRevealPlayer(2);

            const allRevealed = isOpenPlayer1.every(is_open => is_open === false) && newOpen.every(is_open => is_open === false);
            if (allRevealed) {
              setMessage("All cards revealed! Battle is resolved. Select your winning card.");
              resolveRound(player1Played, player2Played);
            }
            setIsBotThinking(false);
          }, 800);
        }
      } else if (p2HasRevealed && lastRevealPlayer === 2) {
        const swapIdx = botSwapCard(player2Hand, player2Played, isOpenPlayer2);
        if (swapIdx !== null && botSwapCount < 2) {
          setIsBotThinking(true);
          setTimeout(() => {
            const cardToSwap = player2Played[swapIdx];
            const newPlayed = [...player2Played];
            newPlayed[swapIdx] = null;
            setPlayer2Played(newPlayed);
            setPlayer2Hand(prevHand => [...prevHand, cardToSwap]);
            setBotSwapCount(botSwapCount + 1);
            setIsBotThinking(false);
          }, 800);
        }
      }
    }
  }, [isOpenPlayer1, isOpenPlayer2, lastRevealPlayer, isBattleResolved, gameEnded, isDrawPhase, isBotThinking, player1Played, player2Played, player2Hand]);

  // Bot: Draw Phase
  useEffect(() => {
    if (!isBotThinking && isDrawPhase && !player2DrawCard && player1DrawCard) {
      setIsBotThinking(true);
      setTimeout(() => {
        const card = botSelectCard(player2Played);
        if (card) {
          setPlayer2DrawCard(card);
          setTimeout(() => resolveDraw(card, player1DrawCard), 500);
        }
        setIsBotThinking(false);
      }, 800);
    }
  }, [isDrawPhase, player1DrawCard, player2DrawCard, isBotThinking, player2Played]);

  // Bot: Nach Battle gewinnende Karte wählen
  useEffect(() => {
    if (!isBotThinking && isBattleResolved && roundWinner === 2 && !isDrawPhase) {
      setIsBotThinking(true);
      setTimeout(() => {
        const card = botSelectCard(player2Played);
        if (card) {
          selectWinningCard(card);
        }
        setIsBotThinking(false);
      }, 800);
    }
  }, [isBattleResolved, roundWinner, isDrawPhase, isBotThinking, player2Played]);

  const drawCard = (currentDeck) => {
    if (currentDeck.length === 0) return { card: null, newDeck: [] };
    const card = currentDeck[0];
    const newDeck = currentDeck.slice(1);
    return { card, newDeck };
  };

  const drawToNine = (currentPlayerHand, newDeckState) => {
    let newHand = [...currentPlayerHand];
    let currentDeck = [...newDeckState];
    const cardsToDraw = 9 - newHand.length; 
    
    for (let i = 0; i < cardsToDraw && currentDeck.length > 0; i++) {
        const { card, newDeck } = drawCard(currentDeck);
        if (card) {
            newHand.push(card);
            currentDeck = newDeck;
        }
    }
    return { newHand, newDeckState: currentDeck };
  }

  const canDrawSixCards = (deckState) => {
    return deckState.length >= 6;
  }

  const returnCard = (index, fromPlayer) => {
    if (isBattleResolved) return;
    
    if (fromPlayer === 1 && !isOpenPlayer1[index]) {
        setMessage("Cannot swap revealed cards.");
        return;
    }
    if (fromPlayer === 2 && !isOpenPlayer2[index]) {
        setMessage("Cannot swap revealed cards.");
        return;
    }

    if (fromPlayer === 1) {
      if (!player1Played[index]) return;
      const cardToReturn = player1Played[index];
      const newPlayed = [...player1Played];
      newPlayed[index] = null;
      setPlayer1Played(newPlayed);
      setPlayer1Hand(prevHand => [...prevHand, cardToReturn]);
    } else if (fromPlayer === 2) {
      if (!player2Played[index]) return;
      const cardToReturn = player2Played[index];
      const newPlayed = [...player2Played];
      newPlayed[index] = null;
      setPlayer2Played(newPlayed);
      setPlayer2Hand(prevHand => [...prevHand, cardToReturn]);
    }
    setMessage("Card returned. Choose a new card or reveal one.");
  };

  const playCard = (index, fromPlayer) => {
    if (player1Played.every(c => c !== null) && player2Played.every(c => c !== null)) return;

    if (fromPlayer === 1) {
      if(player1Played.every(c => c !== null)) return;

      const card = player1Hand[index];
      const newHand = player1Hand.filter((_, i) => i !== index);
      setPlayer1Hand(newHand);
      
      const emptyIndex = player1Played.findIndex(c => c === null);
      if (emptyIndex !== -1) {
        const newPlayed = [...player1Played];
        newPlayed[emptyIndex] = card;
        setPlayer1Played(newPlayed);
      }
    } else {
      if(player2Played.every(c => c !== null)) return;
        
      const card = player2Hand[index];
      const newHand = player2Hand.filter((_, i) => i !== index);
      setPlayer2Hand(newHand);
      
      const emptyIndex = player2Played.findIndex(c => c === null);
      if (emptyIndex !== -1) {
        const newPlayed = [...player2Played];
        newPlayed[emptyIndex] = card;
        setPlayer2Played(newPlayed);
      }
    }
    
    if (player1Played.filter(Boolean).length + (fromPlayer === 1 ? 1 : 0) === 3 &&
        player2Played.filter(Boolean).length + (fromPlayer === 2 ? 1 : 0) === 3) {
        setMessage("All 6 cards placed. Click any face-down card to reveal it and start the swap/reveal phase.");
    }
  };

  const revealCard = (index, fromPlayer) => {
    const allCardsPlaced = player1Played.every(c => c !== null) && player2Played.every(c => c !== null);
    
    if (!allCardsPlaced || isBattleResolved) return;
    
    if (lastRevealPlayer !== null && lastRevealPlayer === fromPlayer) {
      setMessage("Other player must reveal a card first!");
      return;
    }
    
    if (fromPlayer === 1 && !isOpenPlayer1[index]) return;
    if (fromPlayer === 2 && !isOpenPlayer2[index]) return;

    const newOpen1 = [...isOpenPlayer1];
    const newOpen2 = [...isOpenPlayer2];
    
    if (fromPlayer === 1) {
      newOpen1[index] = false;
    } else {
      newOpen2[index] = false;
    }
    
    setOpenPlayer1(newOpen1);
    setOpenPlayer2(newOpen2);
    setLastRevealPlayer(fromPlayer);
    
    const allRevealed = newOpen1.every(is_open => is_open === false) && 
                   newOpen2.every(is_open => is_open === false);
    
    if (allRevealed) {
        setMessage("All cards revealed! Battle is resolved. Select your winning card.");
        resolveRound(player1Played, player2Played);
    } else {
        const nextPlayer = fromPlayer === 1 ? 2 : 1;
        setMessage(`Card revealed. Player ${nextPlayer}'s turn to reveal a card.`);
    }
  };

  const resolveRound = (p1Played, p2Played) => {
    const score1 = calculateBattleScore(p1Played);
    const score2 = calculateBattleScore(p2Played);
    
    let winner = null;
    if (score1 > score2) {
      winner = 1;
    } else if (score2 > score1) {
      winner = 2;
    } else {
      setIsDrawPhase(true);
      setMessage("Draw! Both players must select ONE card to break the tie.");
      setRoundWinner(0);
      setIsBattleResolved(true);
      return;
    }
    
    setRoundWinner(winner);
    setIsBattleResolved(true);
  };

  const resolveDraw = (p2Card, p1Card) => {
    if (!p1Card || !p2Card) return;

    const p1Value = getCardValue(p1Card);
    const p2Value = getCardValue(p2Card);

    let drawWinner = null;
    if (p1Value > p2Value) {
      drawWinner = 1;
      setMessage("Player 1 wins the draw with a higher card!");
    } else if (p2Value > p1Value) {
      drawWinner = 2;
      setMessage("Player 2 wins the draw with a higher card!");
    } else {
      setMessage("Full draw! Both players take their own card back.");
      drawWinner = 0;
    }

    setPlayer1Played(player1Played.map(c => c === p1Card ? null : c));
    setPlayer2Played(player2Played.map(c => c === p2Card ? null : c));

    if (drawWinner === 1) {
      setPlayer1Stack(prevStack => [...prevStack, p1Card, p2Card]);
    } else if (drawWinner === 2) {
      setPlayer2Stack(prevStack => [...prevStack, p1Card, p2Card]);
    } else {
      setPlayer1Stack(prevStack => [...prevStack, p1Card]);
      setPlayer2Stack(prevStack => [...prevStack, p2Card]);
    }

    setIsDrawPhase(false);
    setPlayer1DrawCard(null);
    setPlayer2DrawCard(null);
    resetRound(null);
  };

  const swapCard = (index, fromPlayer) => {
    const allCardsPlaced = player1Played.every(c => c !== null) && player2Played.every(c => c !== null);
    
    if (!allCardsPlaced || isBattleResolved) return;
    
    const p1HasRevealed = isOpenPlayer1.some(isOpen => !isOpen);
    const p2HasRevealed = isOpenPlayer2.some(isOpen => !isOpen);
    
    if (!p1HasRevealed || !p2HasRevealed) {
      setMessage("Both players must reveal at least one card first!");
      return;
    }
    
    if (fromPlayer === 1 && !isOpenPlayer1[index]) {
      setMessage("Cannot swap an already revealed card!");
      return;
    }
    if (fromPlayer === 2 && !isOpenPlayer2[index]) {
      setMessage("Cannot swap an already revealed card!");
      return;
    }

    if (fromPlayer === 1) {
      if (!player1Played[index]) return;
      const cardToSwap = player1Played[index];
      const newPlayed = [...player1Played];
      newPlayed[index] = null;
      setPlayer1Played(newPlayed);
      setPlayer1Hand(prevHand => [...prevHand, cardToSwap]);
      setMessage("Card swapped! Choose a new card.");
    } else if (fromPlayer === 2) {
      if (!player2Played[index]) return;
      const cardToSwap = player2Played[index];
      const newPlayed = [...player2Played];
      newPlayed[index] = null;
      setPlayer2Played(newPlayed);
      setPlayer2Hand(prevHand => [...prevHand, cardToSwap]);
      setMessage("Card swapped! Choose a new card.");
    }
  };

  const selectWinningCard = (card) => {
    if (!isBattleResolved || roundWinner === null) return;

    if (card.isJoker) {
        setMessage("Dragon Cards cannot be selected and are shuffled back into the deck!");
        return;
    }

    if (isDrawPhase) {
      const isP1Card = player1Played.includes(card);
      const isP2Card = player2Played.includes(card);

      if (isP1Card && !player1DrawCard) {
        setPlayer1DrawCard(card);
        setMessage("Player 1 selected their card. Player 2, select your card!");
      } else if (isP2Card && !player2DrawCard) {
        setPlayer2DrawCard(card);
        setMessage("Player 2 selected their card. Resolving draw...");
        setTimeout(() => resolveDraw(card, player1DrawCard), 500);
      } else if (isP1Card && player1DrawCard) {
        setPlayer1DrawCard(card);
      } else if (isP2Card && player2DrawCard) {
        setPlayer2DrawCard(card);
      }
      return;
    }
    
    const isP1Card = player1Played.includes(card);
    const isP2Card = player2Played.includes(card);
    
    if (isP1Card) {
        setPlayer1Played(player1Played.map(c => c === card ? null : c));
    } else if (isP2Card) {
        setPlayer2Played(player2Played.map(c => c === card ? null : c));
    }
    
    if (roundWinner === 1) {
      setPlayer1Stack(prevStack => [...prevStack, card]);
    } else if (roundWinner === 2) {
      setPlayer2Stack(prevStack => [...prevStack, card]);
    }
    
    resetRound(card);
  };
  
  const resetRound = (selectedCard) => {
    const allPlayed = [...player1Played.filter(c => c !== null), ...player2Played.filter(c => c !== null)];
    const dragonCards = allPlayed.filter(c => c.isJoker);
    const newDeckWithDragons = [...gameDeck, ...dragonCards].sort(() => Math.random() - 0.5);
    
    setPlayer1Played([null, null, null]);
    setPlayer2Played([null, null, null]);

    let { newHand: p1NewHand, newDeckState: deckAfterP1Draw } = drawToNine(player1Hand, newDeckWithDragons);
    let { newHand: p2NewHand, newDeckState: finalDeckState } = drawToNine(player2Hand, deckAfterP1Draw);
    
    if (!canDrawSixCards(finalDeckState)) {
      const winner = calculateFinalWinner(player1Stack, player2Stack);
      setFinalWinner(winner);
      setGameEnded(true);
      setMessage(`Spiel beendet! ${winner === 'Player 1' ? 'Spieler 1' : winner === 'Player 2' ? 'Spieler 2' : 'Unentschieden'} gewinnt!`);
      return;
    }
    
    setPlayer1Hand(p1NewHand);
    setPlayer2Hand(p2NewHand);
    setGameDeck(finalDeckState);

    setRoundWinner(null);
    setIsBattleResolved(false);
    setOpenPlayer1([true, true, true]);
    setOpenPlayer2([true, true, true]);
    setLastRevealPlayer(null);
    setIsDrawPhase(false);
    setPlayer1DrawCard(null);
    setPlayer2DrawCard(null);
    setMessage("Round over. Hands refilled. Place 3 cards to start the next round.");
  };

  const calculateFinalWinner = (p1Stack, p2Stack) => {
    const calculateColorScore = (stack) => {
      let redValue = 0;
      let blackValue = 0;
      stack.forEach(card => {
        const value = getCardValue(card);
        if (card.color === '#DC2626') {
          redValue += value;
        } else if (card.color === '#000000') {
          blackValue += value;
        }
      });
      return { red: redValue, black: blackValue };
    };
    
    const p1Score = calculateColorScore(p1Stack);
    const p2Score = calculateColorScore(p2Stack);
    
    const p1Max = Math.max(p1Score.red, p1Score.black);
    const p2Max = Math.max(p2Score.red, p2Score.black);
    
    if (p1Max > p2Max) return "Player 1";
    if (p2Max > p1Max) return "Player 2";
    return "Draw";
  };

  const resetGame = () => {
    const newDeck = generateDeck();
    setDeck(newDeck);
    setPlayer1Hand(newDeck.slice(0, 9)); 
    setPlayer2Hand(newDeck.slice(9, 18));
    setGameDeck(newDeck.slice(18));
    setPlayer1Played([null, null, null]);
    setPlayer2Played([null, null, null]);
    setPlayer1Stack([]);
    setPlayer2Stack([]);
    setRoundWinner(null);
    setIsBattleResolved(false);
    setOpenPlayer1([true, true, true]);
    setOpenPlayer2([true, true, true]);
    setGameEnded(false);
    setFinalWinner(null);
    setLastRevealPlayer(null);
    setIsDrawPhase(false);
    setPlayer1DrawCard(null);
    setPlayer2DrawCard(null);
    setIsBotThinking(false);
    setMessage("New Game started. Place 3 cards to begin the round.");
  };

  if (gameEnded) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#065F46', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#065F46' }}>
            🎉 Spiel Vorbei! 🎉
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '20px', color: '#1F2937' }}>
            Gewinner: <span style={{ fontWeight: 'bold', color: '#DC2626' }}>{finalWinner === 'Player 1' ? 'Spieler 1' : finalWinner === 'Player 2' ? 'Spieler 2' : 'Unentschieden'}</span>
          </p>
          <button 
            onClick={resetGame}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#DC2626', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Neues Spiel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#065F46', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '8px' }}>
          Dragon Dance 🐉 - The Card Game
        </h1>
        <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px'}}>
            <button 
              onClick={resetGame}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#DC2626', 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              New Game
            </button>
        </div>
        <div style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            {message}
        </div>
        <div style={{ color: '#FFFFFF' }}>
            Game Deck: {gameDeck.length} cards | P1 Stack Cards: {player1Stack.length} | P2 Stack Cards: {player2Stack.length}
        </div>
      </header>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '10px' }}>Player 2 - Bot (Hand: {player2Hand.length})</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          {player2Hand.map((card, index) => (
            <div key={index} style={{ cursor: 'pointer' }}>
              <CardBack />
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', gap: '40px' }}>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          {player2Played.map((card, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                  onClick={() => isBattleResolved ? selectWinningCard(card) : null}
                  style={{ opacity: card === null ? 0.5 : 1, cursor: isBattleResolved && card ? 'pointer' : 'default' }}
              >
                {card ? isOpenPlayer2[index] ? <CardBack/> : <Card card={card} selected={isBattleResolved && card !== null && roundWinner !== 0} /> : <EmptySlot onClick={() => {}} />}
              </div>
            </div>
          ))}
        </div>
        
        <h3 style={{ color: '#FFFFFF', minHeight: '30px' }}>
          {isDrawPhase && player1DrawCard && !player2DrawCard ? "Bot is selecting card..." : ""}
          {isDrawPhase && player1DrawCard && player2DrawCard ? "Resolving draw..." : ""}
          {roundWinner && roundWinner !== 0 && isBattleResolved && !isDrawPhase ? `Winner Player ${roundWinner}: Select ONE Card (Rule 4)` : ""}
        </h3>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          {player1Played.map((card, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                  onClick={() => isBattleResolved ? selectWinningCard(card) : (isOpenPlayer1[index] ? revealCard(index, 1) : returnCard(index, 1))}
                  style={{ opacity: card === null ? 0.5 : 1, cursor: card ? 'pointer' : 'default' }}
              >
                {card ?  isOpenPlayer1[index] ? <CardBack/> : <Card card={card} selected={isBattleResolved && card !== null && roundWinner !== 0} /> : <EmptySlot onClick={() => {}} />}
              </div>
              {card && isOpenPlayer1[index] && !isBattleResolved && (
                <button
                  onClick={() => swapCard(index, 1)}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Swap
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '10px' }}>Player 1 (You) (Hand: {player1Hand.length})</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', justifyContent: 'center' }}>
          {player1Hand.map((card, index) => (
            <div key={index} onClick={() => playCard(index, 1)}>
              <Card card={card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}