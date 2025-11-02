import React, { useState, useEffect } from 'react';

// Import Components
// (Bitte prüfen Sie, ob die Datei 'Card.jsx' oder 'card.jsx' heißt)
import { Card, EmptySlot, CardBack } from './components/card'; 

// Import Utilities
import { getCardValue, calculateBattleScore, generateDeck } from './utils/cardLogic';
import { botPlayCard, botRevealCard, botSwapCard, botSelectCard } from './utils/botLogic'; 

// Helper for drawing cards
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

// NEU: Regel-Modal als separate Komponente
const RulesModal = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed', // Fixed to cover the whole viewport
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000, // Topmost
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh', // Make it scrollable if content is too long
        overflowY: 'auto',
        position: 'relative', // For the close button
        color: '#1F2937', // Dark text for readability
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: '#E5E7EB', // light gray
            color: '#1F2937',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          X
        </button>
        
        <h2 style={{ marginTop: 0, color: '#065F46' }}>Spielregeln (Dragon Dance)</h2>
        
        <p><strong>Ziel:</strong> Sammle Karten in deinem Stapel (Stack). Der Spieler mit dem höchsten Punktewert (entweder rote oder schwarze Karten) am Ende gewinnt.</p>
        
        <h3>Phase 1: Karten legen</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Beide Spieler haben 9 Karten auf der Hand.</li>
          <li>Wähle 3 Karten aus deiner Hand und lege sie verdeckt auf deine 3 Plätze.</li>
          <li>Der Bot (Spieler 2) tut dasselbe automatisch.</li>
        </ul>

        <h3>Phase 2: Aufdecken & Tauschen (Swap/Reveal)</h3>
        <p>Sobald alle 6 Karten auf dem Feld liegen:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Spieler 1 (Du) muss beginnen</strong>, indem er eine seiner verdeckten Karten aufdeckt (anklicken).</li>
          <li>Danach decken die Spieler abwechselnd eine Karte auf ODER tauschen eine ihrer verdeckten Karten aus (Swap-Button).</li>
          <li>Man darf nicht zweimal hintereinander aufdecken (der andere Spieler ist am Zug).</li>
          <li>Man kann keine bereits aufgedeckte Karte tauschen.</li>
        </ul>

        <h3>Phase 4: Gewinner wählt Karte</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Der Spieler mit der höheren Punktzahl gewinnt die Runde.</li>
          <li><strong>Wenn du (P1) gewinnst:</strong> Du darfst EINE beliebige Karte vom Tisch (deine ODER die des Bots) auswählen und in deinen Stapel legen.</li>
          <li><strong>Wenn der Bot (P2) gewinnt:</strong> Der Bot wählt eine seiner eigenen Karten aus und legt sie in seinen Stapel.</li>
          <li><strong>Drachen (Joker)</strong> können nicht ausgewählt werden. Sie werden zurück ins Deck gemischt.</li>
          <li>Alle nicht gewählten Karten (außer Drachen) werden abgeworfen.</li>
        </ul>

        <h3>Unentschieden (Draw)</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Haben beide Spieler die gleiche Punktzahl, ist es ein Unentschieden.</li>
          <li>Beide Spieler müssen eine ihrer (nicht-Drachen) Karten für einen "Stich" auswählen.</li>
          <li>Die höchste Karte gewinnt den Stich. Der Gewinner erhält BEIDE Stich-Karten für seinen Stapel.</li>
          <li>Bei einem erneuten Unentschieden (gleiche Kartenwerte) nimmt jeder Spieler seine eigene Karte zurück in den Stapel.</li>
        </ul>

        <h3>Spielende</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Das Spiel endet, wenn nicht mehr genug Karten im Deck sind, um die Hände auf 9 aufzufüllen.</li>
          <li>Alle Karten in den Stapeln (Stacks) werden gezählt.</li>
          <li>Es wird der Gesamtwert aller ROTEN Karten und der Gesamtwert aller SCHWARZEN Karten (ohne Drachen) berechnet.</li>
          <li>Dein finaler Punktestand ist der HÖHERE der beiden Werte (z.B. 15 Rot, 5 Schwarz -> Score = 15).</li>
          <li>Der Spieler mit dem höheren finalen Punktestand gewinnt das Spiel.</li>
        </ul>

      </div>
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

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const [botLastSelectedCard, setBotLastSelectedCard] = useState(null); 
  
  // NEU: State für das Regel-Modal
  const [showRules, setShowRules] = useState(false);

  // --- Spiel-Aktionen ---

  const resolveRound = (p1Played, p2Played) => {
    const score1 = calculateBattleScore(p1Played);
    const score2 = calculateBattleScore(p2Played);

    setPlayer1Score(score1);
    setPlayer2Score(score2);
    
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
  
  const resetRound = (selectedCard) => {
    const allPlayed = [...player1Played.filter(c => c !== null), ...player2Played.filter(c => c !== null)];
    const dragonCards = allPlayed.filter(c => c.isJoker);
    const newDeckWithDragons = [...gameDeck, ...dragonCards].sort(() => Math.random() - 0.5);
    
    setPlayer1Played([null, null, null]);
    setPlayer2Played([null, null, null]);
    setBotSwapCount(0); 

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

    setPlayer1Score(0);
    setPlayer2Score(0);
    
    setMessage("Round over. Hands refilled. Place 3 cards to start the next round.");
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
        setMessage("All 6 cards placed. Player 1, click a card to reveal it and start.");
    }
  };

  const revealCard = (index, fromPlayer) => {
    const allCardsPlaced = player1Played.every(c => c !== null) && player2Played.every(c => c !== null);
    
    if (!allCardsPlaced || isBattleResolved) return;
    
    if (fromPlayer === 1) {
        if (lastRevealPlayer === 1) {
          setMessage("Other player must reveal a card first!");
          return;
        }
    }
    
    if (fromPlayer === 2) {
        if (lastRevealPlayer === null) {
          setMessage("Player 1 must reveal the first card!");
          return; 
        }
        if (lastRevealPlayer === 2) {
          setMessage("Other player must reveal a card first!");
          return;
        }
    }

    if (fromPlayer === 1 && !isOpenPlayer1[index]) return; // already revealed
    if (fromPlayer === 2 && !isOpenPlayer2[index]) return; // already revealed

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

  const swapCard = (index, fromPlayer) => {
    const allCardsPlaced = player1Played.every(c => c !== null) && player2Played.every(c => c !== null);
    
    if (!allCardsPlaced || isBattleResolved) return;
    
    if (lastRevealPlayer === null) {
        setMessage("Player 1 must reveal the first card before swapping!");
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
    if (!isBattleResolved || roundWinner === null || roundWinner === 0) return;

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
      } else if (isP1Card && player1DrawCard) {
        setPlayer1DrawCard(card);
      } else if (isP2Card && player2DrawCard) {
        setPlayer2DrawCard(card); 
      }
      return;
    }
    
    const isP1Card = player1Played.includes(card);
    const isP2Card = player2Played.includes(card);
    
    if (roundWinner === 1) {
        setPlayer1Stack(prevStack => [...prevStack, card]);

        if (isP1Card) {
            setPlayer1Played(player1Played.map(c => c === card ? null : c));
        } else if (isP2Card) {
            setPlayer2Played(player2Played.map(c => c === card ? null : c));
        }
        
        resetRound(card);
    } 
    else if (roundWinner === 2) {
        if (!isP2Card) {
            setMessage("It's the Bot's turn to select a card.");
            return; 
        }
        
        setPlayer2Stack(prevStack => [...prevStack, card]);
        setPlayer2Played(player2Played.map(c => c === card ? null : c));
        setBotLastSelectedCard(card);
        
        resetRound(card);
    }
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
    setBotSwapCount(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setBotLastSelectedCard(null); 
    setMessage("New Game started. Place 3 cards to begin the round.");
  };

  // --- Bot-Automatisierungen (useEffect Hooks) ---

  // Bot: Karte legen
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

  // Bot: Aufdecken und Tauschen (Logik-Phase)
  useEffect(() => {
    if (!isBotThinking && !gameEnded && !isDrawPhase && isBattleResolved === false && player1Played.every(c => c !== null) && player2Played.every(c => c !== null)) {
      
      const p1HasRevealed = isOpenPlayer1.some(isOpen => !isOpen);
      const allRevealed = isOpenPlayer1.every(is_open => is_open === false) && isOpenPlayer2.every(is_open => is_open === false);

      if (allRevealed) {
        return;
      }

      if (lastRevealPlayer !== 2 && lastRevealPlayer !== null) {
        const revealIdx = botRevealCard(isOpenPlayer2);
        if (revealIdx !== null) {
          setIsBotThinking(true);
          setTimeout(() => {
            revealCard(revealIdx, 2); 
            setIsBotThinking(false);
          }, 800);
        }
      } 
      else if (lastRevealPlayer === 1 && p1HasRevealed) {
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
            setMessage("Bot swapped a card. Player 1's turn to reveal a card or swap.");
            setIsBotThinking(false);
          }, 800);
        }
      }
    }
  }, [isOpenPlayer1, isOpenPlayer2, lastRevealPlayer, isBattleResolved, gameEnded, isDrawPhase, isBotThinking, player1Played, player2Played, player2Hand, botSwapCount]);

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
  }, [isDrawPhase, player1DrawCard, player2DrawCard, isBotThinking, player2Played, resolveDraw]);

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
      }, 2800); // 2.8s Verzögerung
    }
  }, [isBattleResolved, roundWinner, isDrawPhase, isBotThinking, player2Played]);


  // --- Render (UI) ---

  // NEU: Regel-Modal wird gerendert, wenn showRules true ist
  const renderRulesModal = () => {
    if (!showRules) return null;
    return <RulesModal onClose={() => setShowRules(false)} />;
  };

  // NEU: Regel-Button
  const renderRulesButton = () => (
    <div 
      onClick={() => setShowRules(true)}
      style={{
        position: 'absolute', // Positioniert relativ zum Root-Container
        top: '20px',
        right: '20px', 
        backgroundColor: 'white',
        color: '#065F46',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 1000, 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      ?
    </div>
  );

  if (gameEnded) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#065F46', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        {renderRulesModal()}
        {renderRulesButton()}
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', textAlign: 'center', minWidth: '700px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#065F46' }}>
            🎉 Spiel Vorbei! 🎉
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '20px', color: '#1F2937' }}>
            Gewinner: <span style={{ fontWeight: 'bold', color: '#DC2626' }}>{finalWinner === 'Player 1' ? 'Spieler 1' : finalWinner === 'Player 2' ? 'Spieler 2' : 'Unentschieden'}</span>
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', marginTop: '20px', width: '100%' }}>
            
            <div style={{ border: '2px solid #3B82F6', borderRadius: '8px', padding: '10px', width: '300px' }}>
              <h3 style={{ color: '#1F2937', marginTop: 0 }}>Player 1 Stack ({player1Stack.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center', maxHeight: '300px', overflowY: 'auto', padding: '5px' }}>
                {player1Stack.length > 0 ? player1Stack.map((card, index) => (
                  <Card key={index} card={card} />
                )) : <p style={{color: '#6B7280'}}>Keine Karten</p>}
              </div>
            </div>

            <div style={{ border: '2px solid #DC2626', borderRadius: '8px', padding: '10px', width: '300px' }}>
              <h3 style={{ color: '#1F2937', marginTop: 0 }}>Player 2 Stack ({player2Stack.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center', maxHeight: '300px', overflowY: 'auto', padding: '5px' }}>
                {player2Stack.length > 0 ? player2Stack.map((card, index) => (
                  <Card key={index} card={card} />
                )) : <p style={{color: '#6B7280'}}>Keine Karten</p>}
              </div>
            </div>

          </div>

          {botLastSelectedCard && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '16px', color: '#1F2937', marginBottom: '10px' }}>
                (Bot's last selected card:)
              </p>
              <Card card={botLastSelectedCard} />
            </div>
          )}
          
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
              fontSize: '16px',
              marginTop: '30px'
            }}
          >
            Neues Spiel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#065F46', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', position: 'relative' }}>
      
      {renderRulesModal()}
      {renderRulesButton()}

      {/* Player 1 Stack (Left Column) */}
      <div style={{
          width: '140px',
          padding: '10px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          alignSelf: 'flex-start',
      }}>
          <h3 style={{ color: 'white', fontSize: '16px', textAlign: 'center', marginBottom: '10px' }}>P1 Stack ({player1Stack.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', maxHeight: '80vh', overflowY: 'auto' }}>
              {player1Stack.map((card, index) => (
                  <Card key={index} card={card} />
              ))}
          </div>
      </div>

      {/* Main Game Area (Center Column) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px' }}>
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
          <div style={{ color: '#FFFFFF', fontWeight: 'bold', minHeight: '24px' }}>
              {message}
          </div>
          <div style={{ color: '#FFFFFF' }}>
              Game Deck: {gameDeck.length} cards
          </div>
        </header>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '10px' }}>Player 2 - Bot (Hand: {player2Hand.length})</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', minHeight: '80px' }}>
            {player2Hand.map((card, index) => (
              <div key={index} style={{ cursor: 'pointer' }}>
                <CardBack />
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', gap: '40px' }}>
          
          {/* Player 2 Played Cards (Bot) */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {player2Played.map((card, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                    onClick={() => isBattleResolved ? selectWinningCard(card) : null}
                    style={{ opacity: card === null ? 0.5 : 1, cursor: isBattleResolved && card ? 'pointer' : 'default' }}
                >
                  {card 
                      ? isOpenPlayer2[index] 
                          ? <CardBack/> 
                          : <Card card={card} selected={isBattleResolved && card !== null && (roundWinner === 1 || roundWinner === 2)} /> 
                      : <EmptySlot onClick={() => {}} />}
                </div>
              </div>
            ))}
            
            {isBattleResolved && !isDrawPhase && (
              <div style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 'bold', marginLeft: '20px' }}>
                Score: {player2Score}
              </div>
            )}
          </div>
          
          {/* Battle/Draw Message */}
          <h3 style={{ color: '#FFFFFF', minHeight: '30px' }}>
            {isDrawPhase && player1DrawCard && !player2DrawCard ? "Bot is selecting card..." : ""}
            {isDrawPhase && player1DrawCard && player2DrawCard ? "Resolving draw..." : ""}
            {roundWinner && roundWinner !== 0 && isBattleResolved && !isDrawPhase ? `Winner Player ${roundWinner}: Select ONE Card` : ""}
          </h3>
          
          {/* Player 1 Played Cards (You) */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {player1Played.map((card, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                    onClick={() => {
                        if (isBattleResolved) {
                            selectWinningCard(card);
                        } 
                        else if (card && isOpenPlayer1[index]) {
                            revealCard(index, 1);
                        }
                        else if (card && !isOpenPlayer1[index]) { 
                              // Klick auf aufgedeckte Karte (vor Battle) tut nichts
                        }
                    }}
                    style={{ opacity: card === null ? 0.5 : 1, cursor: card ? 'pointer' : 'default' }}
                >
                  {card 
                    ?  isOpenPlayer1[index] 
                      ? <CardBack onClick={() => revealCard(index, 1)} /> 
                      : <Card card={card} selected={isBattleResolved && card !== null && (roundWinner === 1 || roundWinner === 2)} /> 
                    : <EmptySlot onClick={() => {}} />}
                </div>
                {/* Swap Button (nur für verdeckte Karten & nachdem P1 gestartet hat) */}
                {card && isOpenPlayer1[index] && !isBattleResolved && lastRevealPlayer !== null && (
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

            {isBattleResolved && !isDrawPhase && (
              <div style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 'bold', marginLeft: '20px' }}>
                Score: {player1Score}
              </div>
            )}
          </div>
        </div>

        {/* Player 1 Hand */}
        <div>
          <h2 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '10px' }}>Player 1 (You) (Hand: {player1Hand.length})</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', justifyContent: 'center', minHeight: '80px' }}>
            {player1Hand.map((card, index) => (
              <div key={index} onClick={() => playCard(index, 1)}>
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player 2 Stack (Right Column) */}
      <div style={{
          width: '140px',
          padding: '10px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          alignSelf: 'flex-start',
      }}>
          <h3 style={{ color: 'white', fontSize: '16px', textAlign: 'center', marginBottom: '10px' }}>P2 Stack ({player2Stack.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', maxHeight: '80vh', overflowY: 'auto' }}>
              {player2Stack.map((card, index) => (
                  <Card key={index} card={card} />
              ))}
          </div>
      </div>

    </div>
  );
}