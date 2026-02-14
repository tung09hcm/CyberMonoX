+++
title = 'Poker_Game_Tutorial'
date = 2026-02-14T11:31:32+07:00
description = ""
image = "/images/casino.jpg"
categories = ["game"]
authors = ["tung09hcm"]
avatar = ["/images/hecker.jpg"]
+++
# Texas Hold'em Poker Game - Complete Documentation & Tutorial

## Table of Contents
1. [Game Rules & Mechanics](#game-rules--mechanics)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Tutorial](#step-by-step-tutorial)
5. [Project Structure](#project-structure)
6. [Code Implementation](#code-implementation)
7. [Deployment Guide](#deployment-guide)
8. [Testing & Debugging](#testing--debugging)

---

## Game Rules & Mechanics

### Overview
Texas Hold'em is the most popular variant of poker. Each player receives 2 private cards (hole cards), and 5 community cards are dealt face-up on the table. Players make the best 5-card hand using any combination of their 2 hole cards and the 5 community cards.

### Game Flow

#### 1. **Pre-Game Setup**
- **Players**: 2-10 players per table
- **Starting Chips**: Each player starts with 1000 chips (configurable)
- **Dealer Button**: Rotates clockwise after each hand
- **Blinds**: 
  - Small Blind: Player to the left of dealer (10 chips)
  - Big Blind: Player to the left of small blind (20 chips)

#### 2. **Game Phases**

**Phase 1: Pre-Flop**
- Each player receives 2 private cards face-down
- Betting starts with player to the left of big blind
- Players can: Fold, Call, Raise

**Phase 2: Flop**
- 3 community cards are dealt face-up
- New betting round starts with player to the left of dealer
- Players can: Check, Bet, Fold, Call, Raise

**Phase 3: Turn**
- 1 additional community card is dealt face-up (4 total)
- Another betting round occurs

**Phase 4: River**
- Final community card is dealt face-up (5 total)
- Final betting round occurs

**Phase 5: Showdown**
- Remaining players reveal their cards
- Best hand wins the pot
- If all but one player folds, that player wins without showing cards

#### 3. **Betting Actions**

| Action | Description | When Available |
|--------|-------------|----------------|
| **Fold** | Discard your hand and forfeit the pot | Any time during your turn |
| **Check** | Pass action to next player without betting | When no bet has been made |
| **Call** | Match the current bet | When a bet has been made |
| **Bet** | Make the first bet in a round | When no one has bet yet |
| **Raise** | Increase the current bet | After someone has bet |
| **All-In** | Bet all remaining chips | Any time |

#### 4. **Hand Rankings** (Highest to Lowest)

1. **Royal Flush**: A, K, Q, J, 10 of same suit
2. **Straight Flush**: 5 consecutive cards of same suit
3. **Four of a Kind**: 4 cards of same rank
4. **Full House**: 3 of a kind + 1 pair
5. **Flush**: 5 cards of same suit (not consecutive)
6. **Straight**: 5 consecutive cards of mixed suits
7. **Three of a Kind**: 3 cards of same rank
8. **Two Pair**: 2 different pairs
9. **One Pair**: 2 cards of same rank
10. **High Card**: Highest card when no other hand is made

#### 5. **Pot & Side Pots**
- **Main Pot**: Contains all bets all players can match
- **Side Pot**: Created when a player goes all-in with less chips than current bet
- Multiple side pots can exist in a single hand

#### 6. **Winner Determination**
- Compare hand rankings
- If tied, compare high card within that hand type
- If completely tied, pot is split equally

---

## Architecture Overview

### Technology Stack

```
Frontend (Client)
├── React (UI Framework)
├── Socket.io-client (Real-time communication)
├── CSS3 (Styling & animations)
└── React Hooks (State management)

Backend (Server)
├── Node.js (Runtime)
├── Express (Web framework)
├── Socket.io (WebSocket server)
└── CORS (Cross-origin support)

Communication
└── WebSocket Protocol (Bidirectional real-time events)
```

### System Architecture

```
┌─────────────┐         WebSocket          ┌─────────────┐
│   Client 1  │◄─────────────────────────►│             │
│   (React)   │                            │   Node.js   │
└─────────────┘                            │   Express   │
                                           │  Socket.io  │
┌─────────────┐         WebSocket          │   Server    │
│   Client 2  │◄─────────────────────────►│             │
│   (React)   │                            │   (Game     │
└─────────────┘                            │    Logic)   │
                                           └─────────────┘
┌─────────────┐         WebSocket                 │
│   Client N  │◄─────────────────────────────────┘
│   (React)   │
└─────────────┘
```

### Data Flow

1. **Client connects** → Server assigns socket ID
2. **Client joins room** → Server adds to room namespace
3. **Client action** → Sent to server via WebSocket
4. **Server validates** → Updates game state
5. **Server broadcasts** → All clients in room receive update
6. **Clients render** → UI updates in real-time

---

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Code Editor** (VS Code recommended)
- **Git** (for version control)

### Required Knowledge
- JavaScript ES6+ (const, let, arrow functions, async/await)
- React basics (components, hooks, props)
- Basic Node.js/Express
- Understanding of WebSockets concept

### Optional Tools
- **Postman** or **Thunder Client** (API testing)
- **Chrome DevTools** (debugging)
- **React DevTools** (Chrome extension)

---

## Step-by-Step Tutorial

### Part 1: Project Setup

#### Step 1.1: Create Project Directory

```bash
# Create main project folder
mkdir poker-game
cd poker-game

# Create client and server folders
mkdir client server
```

#### Step 1.2: Initialize Server

```bash
cd server
npm init -y
```

Install server dependencies:

```bash
npm install express socket.io cors nodemon
```

**Package Explanations:**
- `express`: Web framework for Node.js
- `socket.io`: Real-time bidirectional event-based communication
- `cors`: Enable Cross-Origin Resource Sharing
- `nodemon`: Auto-restart server on file changes (dev dependency)

Update `server/package.json`:

```json
{
  "name": "poker-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

#### Step 1.3: Initialize Client

```bash
cd ../client
npx create-react-app .
```

Install client dependencies:

```bash
npm install socket.io-client
```

**Package Explanation:**
- `socket.io-client`: Client-side library for Socket.io

---

### Part 2: Server Implementation

#### Step 2.1: Create Basic Express Server

Create `server/index.js`:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React dev server
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

Test the server:

```bash
npm run dev
```

Visit `http://localhost:3001/health` - you should see `{"status":"Server is running"}`

#### Step 2.2: Create Game State Manager

Create `server/gameState.js`:

```javascript
class GameState {
  constructor() {
    this.rooms = new Map(); // roomId -> room object
  }

  createRoom(roomId, roomName, password, creatorId, creatorName) {
    const room = {
      id: roomId,
      name: roomName,
      password: password || null,
      players: [],
      gameState: {
        phase: 'waiting', // waiting, preflop, flop, turn, river, showdown
        deck: [],
        communityCards: [],
        pot: 0,
        currentBet: 0,
        currentPlayerIndex: 0,
        dealerIndex: 0,
        smallBlindIndex: 1,
        bigBlindIndex: 2,
        smallBlind: 10,
        bigBlind: 20
      },
      createdAt: Date.now()
    };

    // Add creator as first player
    this.addPlayerToRoom(roomId, creatorId, creatorName);
    this.rooms.set(roomId, room);
    
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addPlayerToRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check if room is full (max 10 players)
    if (room.players.length >= 10) {
      return { error: 'Room is full' };
    }

    // Check if player already in room
    if (room.players.find(p => p.id === playerId)) {
      return { error: 'Player already in room' };
    }

    const player = {
      id: playerId,
      name: playerName,
      chips: 1000,
      cards: [],
      bet: 0,
      folded: false,
      isReady: false,
      seatIndex: room.players.length
    };

    room.players.push(player);
    return player;
  }

  removePlayerFromRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    
    // Delete room if empty
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoomsList() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      playerCount: room.players.length,
      hasPassword: !!room.password
    }));
  }
}

module.exports = new GameState();
```

#### Step 2.3: Create Deck & Card Logic

Create `server/deck.js`:

```javascript
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const rankValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
      deck.push({ rank, suit, color, value: rankValues[rank] });
    }
  }
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

module.exports = { createDeck, shuffleDeck, rankValues };
```

#### Step 2.4: Create Hand Evaluator

Create `server/handEvaluator.js`:

```javascript
const { rankValues } = require('./deck');

// Hand ranking values
const HAND_RANKS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
};

function evaluateHand(playerCards, communityCards) {
  // Combine player cards with community cards
  const allCards = [...playerCards, ...communityCards];
  
  // Get all possible 5-card combinations
  const combinations = getCombinations(allCards, 5);
  
  // Evaluate each combination and find the best
  let bestHand = { rank: 0, value: 0, cards: [] };
  
  for (let combo of combinations) {
    const hand = evaluateFiveCards(combo);
    if (hand.rank > bestHand.rank || 
        (hand.rank === bestHand.rank && hand.value > bestHand.value)) {
      bestHand = hand;
    }
  }
  
  return bestHand;
}

function evaluateFiveCards(cards) {
  const sortedCards = cards.sort((a, b) => b.value - a.value);
  
  const isFlush = cards.every(card => card.suit === cards[0].suit);
  const isStraight = checkStraight(sortedCards);
  const rankCounts = getRankCounts(sortedCards);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  // Royal Flush
  if (isFlush && isStraight && sortedCards[0].rank === 'A') {
    return { 
      rank: HAND_RANKS.ROYAL_FLUSH, 
      value: 10000,
      name: 'Royal Flush',
      cards: sortedCards 
    };
  }
  
  // Straight Flush
  if (isFlush && isStraight) {
    return { 
      rank: HAND_RANKS.STRAIGHT_FLUSH, 
      value: 9000 + sortedCards[0].value,
      name: 'Straight Flush',
      cards: sortedCards 
    };
  }
  
  // Four of a Kind
  if (counts[0] === 4) {
    return { 
      rank: HAND_RANKS.FOUR_OF_KIND, 
      value: 8000 + getHighestRankValue(rankCounts, 4),
      name: 'Four of a Kind',
      cards: sortedCards 
    };
  }
  
  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return { 
      rank: HAND_RANKS.FULL_HOUSE, 
      value: 7000 + getHighestRankValue(rankCounts, 3) * 10 + getHighestRankValue(rankCounts, 2),
      name: 'Full House',
      cards: sortedCards 
    };
  }
  
  // Flush
  if (isFlush) {
    return { 
      rank: HAND_RANKS.FLUSH, 
      value: 6000 + sortedCards[0].value,
      name: 'Flush',
      cards: sortedCards 
    };
  }
  
  // Straight
  if (isStraight) {
    return { 
      rank: HAND_RANKS.STRAIGHT, 
      value: 5000 + sortedCards[0].value,
      name: 'Straight',
      cards: sortedCards 
    };
  }
  
  // Three of a Kind
  if (counts[0] === 3) {
    return { 
      rank: HAND_RANKS.THREE_OF_KIND, 
      value: 4000 + getHighestRankValue(rankCounts, 3),
      name: 'Three of a Kind',
      cards: sortedCards 
    };
  }
  
  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(rankCounts).filter(r => rankCounts[r] === 2);
    const values = pairs.map(r => rankValues[r]).sort((a, b) => b - a);
    return { 
      rank: HAND_RANKS.TWO_PAIR, 
      value: 3000 + values[0] * 10 + values[1],
      name: 'Two Pair',
      cards: sortedCards 
    };
  }
  
  // One Pair
  if (counts[0] === 2) {
    return { 
      rank: HAND_RANKS.PAIR, 
      value: 2000 + getHighestRankValue(rankCounts, 2),
      name: 'Pair',
      cards: sortedCards 
    };
  }
  
  // High Card
  return { 
    rank: HAND_RANKS.HIGH_CARD, 
    value: 1000 + sortedCards[0].value,
    name: 'High Card',
    cards: sortedCards 
  };
}

function checkStraight(sortedCards) {
  // Check for Ace-low straight (A-2-3-4-5)
  if (sortedCards[0].rank === 'A' && sortedCards[1].rank === '5') {
    const aceLowStraight = ['A', '5', '4', '3', '2'];
    return sortedCards.every((card, i) => card.rank === aceLowStraight[i]);
  }
  
  // Check for normal straight
  for (let i = 0; i < sortedCards.length - 1; i++) {
    if (sortedCards[i].value - sortedCards[i + 1].value !== 1) {
      return false;
    }
  }
  return true;
}

function getRankCounts(cards) {
  const counts = {};
  for (let card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts;
}

function getHighestRankValue(rankCounts, count) {
  for (let rank in rankCounts) {
    if (rankCounts[rank] === count) {
      return rankValues[rank];
    }
  }
  return 0;
}

function getCombinations(arr, k) {
  if (k === 1) return arr.map(item => [item]);
  if (k === arr.length) return [arr];
  
  const combos = [];
  
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombos = getCombinations(arr.slice(i + 1), k - 1);
    for (let combo of tailCombos) {
      combos.push([head, ...combo]);
    }
  }
  
  return combos;
}

module.exports = { evaluateHand, HAND_RANKS };
```

#### Step 2.5: Implement Socket.io Event Handlers

Update `server/index.js` with Socket.io events:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameState = require('./gameState');
const { createDeck } = require('./deck');
const { evaluateHand } = require('./handEvaluator');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Create or join room
  socket.on('create-room', ({ roomName, password, playerName }) => {
    const roomId = `room-${Date.now()}`;
    const room = gameState.createRoom(roomId, roomName, password, socket.id, playerName);
    
    socket.join(roomId);
    socket.emit('room-created', { roomId, room });
    
    console.log(`🎮 Room created: ${roomName} (${roomId})`);
  });

  socket.on('join-room', ({ roomId, password, playerName }) => {
    const room = gameState.getRoom(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.password && room.password !== password) {
      socket.emit('error', { message: 'Incorrect password' });
      return;
    }

    const result = gameState.addPlayerToRoom(roomId, socket.id, playerName);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }

    socket.join(roomId);
    io.to(roomId).emit('player-joined', { player: result, room });
    socket.emit('room-joined', { roomId, room });
    
    console.log(`👤 ${playerName} joined room: ${room.name}`);
  });

  // Get available rooms
  socket.on('get-rooms', () => {
    const rooms = gameState.getRoomsList();
    socket.emit('rooms-list', rooms);
  });

  // Start game
  socket.on('start-game', ({ roomId }) => {
    const room = gameState.getRoom(roomId);
    if (!room || room.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }

    startNewHand(roomId);
  });

  // Player actions
  socket.on('player-action', ({ roomId, action, amount }) => {
    handlePlayerAction(socket.id, roomId, action, amount);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    
    // Remove player from all rooms
    for (let [roomId, room] of gameState.rooms) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        gameState.removePlayerFromRoom(roomId, socket.id);
        io.to(roomId).emit('player-left', { playerId: socket.id, room });
      }
    }
  });
});

// Game logic functions
function startNewHand(roomId) {
  const room = gameState.getRoom(roomId);
  if (!room) return;

  // Reset game state
  room.gameState.deck = createDeck();
  room.gameState.communityCards = [];
  room.gameState.pot = 0;
  room.gameState.currentBet = room.gameState.bigBlind;
  room.gameState.phase = 'preflop';

  // Reset players
  room.players.forEach(player => {
    player.cards = [];
    player.bet = 0;
    player.folded = false;
  });

  // Post blinds
  const smallBlindPlayer = room.players[room.gameState.smallBlindIndex];
  const bigBlindPlayer = room.players[room.gameState.bigBlindIndex];
  
  smallBlindPlayer.chips -= room.gameState.smallBlind;
  smallBlindPlayer.bet = room.gameState.smallBlind;
  room.gameState.pot += room.gameState.smallBlind;

  bigBlindPlayer.chips -= room.gameState.bigBlind;
  bigBlindPlayer.bet = room.gameState.bigBlind;
  room.gameState.pot += room.gameState.bigBlind;

  // Deal cards to each player
  for (let i = 0; i < 2; i++) {
    room.players.forEach(player => {
      player.cards.push(room.gameState.deck.pop());
    });
  }

  // Set first player to act (after big blind)
  room.gameState.currentPlayerIndex = (room.gameState.bigBlindIndex + 1) % room.players.length;

  io.to(roomId).emit('hand-started', { room });
  io.to(roomId).emit('game-state-update', { room });
}

function handlePlayerAction(playerId, roomId, action, amount = 0) {
  const room = gameState.getRoom(roomId);
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  const currentPlayer = room.players[room.gameState.currentPlayerIndex];

  if (!player || player.id !== currentPlayer.id) {
    return; // Not this player's turn
  }

  switch (action) {
    case 'fold':
      player.folded = true;
      break;

    case 'call':
      const callAmount = room.gameState.currentBet - player.bet;
      player.chips -= callAmount;
      player.bet = room.gameState.currentBet;
      room.gameState.pot += callAmount;
      break;

    case 'raise':
      const raiseTotal = room.gameState.currentBet + amount;
      const toBet = raiseTotal - player.bet;
      player.chips -= toBet;
      player.bet = raiseTotal;
      room.gameState.currentBet = raiseTotal;
      room.gameState.pot += toBet;
      break;

    case 'check':
      // No action needed
      break;
  }

  io.to(roomId).emit('player-action-made', { 
    playerId, 
    action, 
    amount,
    room 
  });

  // Move to next player or next phase
  moveToNextPlayer(roomId);
}

function moveToNextPlayer(roomId) {
  const room = gameState.getRoom(roomId);
  if (!room) return;

  const activePlayers = room.players.filter(p => !p.folded);

  // Check if only one player remains
  if (activePlayers.length === 1) {
    endHand(roomId, activePlayers[0]);
    return;
  }

  // Move to next active player
  let nextIndex = (room.gameState.currentPlayerIndex + 1) % room.players.length;
  while (room.players[nextIndex].folded) {
    nextIndex = (nextIndex + 1) % room.players.length;
  }

  // Check if betting round is complete
  const allBetsEqual = activePlayers.every(p => p.bet === room.gameState.currentBet);
  const backToDealer = nextIndex === room.gameState.dealerIndex;

  if (allBetsEqual && (backToDealer || nextIndex === 0)) {
    moveToNextPhase(roomId);
  } else {
    room.gameState.currentPlayerIndex = nextIndex;
    io.to(roomId).emit('game-state-update', { room });
  }
}

function moveToNextPhase(roomId) {
  const room = gameState.getRoom(roomId);
  if (!room) return;

  // Reset bets for new round
  room.players.forEach(p => p.bet = 0);
  room.gameState.currentBet = 0;

  switch (room.gameState.phase) {
    case 'preflop':
      room.gameState.phase = 'flop';
      // Deal 3 community cards
      for (let i = 0; i < 3; i++) {
        room.gameState.communityCards.push(room.gameState.deck.pop());
      }
      break;

    case 'flop':
      room.gameState.phase = 'turn';
      // Deal 1 community card
      room.gameState.communityCards.push(room.gameState.deck.pop());
      break;

    case 'turn':
      room.gameState.phase = 'river';
      // Deal 1 community card
      room.gameState.communityCards.push(room.gameState.deck.pop());
      break;

    case 'river':
      room.gameState.phase = 'showdown';
      determineWinner(roomId);
      return;
  }

  room.gameState.currentPlayerIndex = (room.gameState.dealerIndex + 1) % room.players.length;
  io.to(roomId).emit('phase-changed', { phase: room.gameState.phase, room });
  io.to(roomId).emit('game-state-update', { room });
}

function determineWinner(roomId) {
  const room = gameState.getRoom(roomId);
  if (!room) return;

  const activePlayers = room.players.filter(p => !p.folded);
  
  // Evaluate each player's hand
  const playerHands = activePlayers.map(player => ({
    player,
    hand: evaluateHand(player.cards, room.gameState.communityCards)
  }));

  // Find the best hand
  playerHands.sort((a, b) => {
    if (b.hand.rank !== a.hand.rank) {
      return b.hand.rank - a.hand.rank;
    }
    return b.hand.value - a.hand.value;
  });

  const winner = playerHands[0];
  endHand(roomId, winner.player, winner.hand);
}

function endHand(roomId, winner, winningHand = null) {
  const room = gameState.getRoom(roomId);
  if (!room) return;

  winner.chips += room.gameState.pot;

  io.to(roomId).emit('hand-ended', { 
    winner: {
      id: winner.id,
      name: winner.name,
      hand: winningHand,
      pot: room.gameState.pot
    },
    room 
  });

  // Move dealer button
  room.gameState.dealerIndex = (room.gameState.dealerIndex + 1) % room.players.length;
  room.gameState.smallBlindIndex = (room.gameState.dealerIndex + 1) % room.players.length;
  room.gameState.bigBlindIndex = (room.gameState.dealerIndex + 2) % room.players.length;
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Poker server running on port ${PORT}`);
});
```

---

### Part 3: Client Implementation (React)

#### Step 3.1: Create Socket Connection Hook

Create `client/src/hooks/useSocket.js`:

```javascript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};
```

#### Step 3.2: Create Lobby Component

Create `client/src/components/Lobby.js`:

```javascript
import React, { useState, useEffect } from 'react';
import './Lobby.css';

const Lobby = ({ socket, onJoinRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', ({ roomId, room }) => {
      onJoinRoom(roomId, room);
    });

    socket.on('room-joined', ({ roomId, room }) => {
      onJoinRoom(roomId, room);
    });

    socket.on('rooms-list', (roomsList) => {
      setRooms(roomsList);
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });

    // Get available rooms
    socket.emit('get-rooms');

    const interval = setInterval(() => {
      socket.emit('get-rooms');
    }, 3000);

    return () => {
      clearInterval(interval);
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('rooms-list');
      socket.off('error');
    };
  }, [socket, onJoinRoom]);

  const handleCreateRoom = () => {
    if (!playerName.trim() || !roomName.trim()) {
      alert('Please enter your name and room name');
      return;
    }

    socket.emit('create-room', {
      roomName: roomName.trim(),
      password: password.trim(),
      playerName: playerName.trim()
    });
  };

  const handleJoinRoom = (roomId) => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    const room = rooms.find(r => r.id === roomId);
    let roomPassword = '';

    if (room?.hasPassword) {
      roomPassword = prompt('Enter room password:');
      if (!roomPassword) return;
    }

    socket.emit('join-room', {
      roomId,
      password: roomPassword,
      playerName: playerName.trim()
    });
  };

  return (
    <div className="lobby">
      <h1>♠ POKER ♣</h1>
      <p>Texas Hold'em • Real-time Multiplayer</p>

      <div className="input-group">
        <label>Your Name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
        />
      </div>

      <div className="input-group">
        <label>Room Name</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          maxLength={30}
        />
      </div>

      <div className="input-group">
        <label>Room Password (Optional)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave empty for public room"
        />
      </div>

      <button className="btn btn-primary" onClick={handleCreateRoom}>
        Create Room
      </button>

      <div className="rooms-section">
        <h3>Available Rooms</h3>
        {rooms.length === 0 ? (
          <p className="no-rooms">No active rooms. Create one!</p>
        ) : (
          <div className="rooms-list">
            {rooms.map(room => (
              <div key={room.id} className="room-card">
                <div className="room-info">
                  <h4>{room.name}</h4>
                  <p>{room.playerCount}/10 players</p>
                  {room.hasPassword && <span className="lock-icon">🔒</span>}
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
```

#### Step 3.3: Create Game Table Component

Create `client/src/components/GameTable.js`:

```javascript
import React, { useState, useEffect } from 'react';
import './GameTable.css';

const GameTable = ({ socket, roomId, room: initialRoom }) => {
  const [room, setRoom] = useState(initialRoom);
  const [myPlayer, setMyPlayer] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('game-state-update', ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on('hand-started', ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on('player-action-made', ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on('phase-changed', ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on('hand-ended', ({ winner, room: updatedRoom }) => {
      setRoom(updatedRoom);
      alert(`${winner.name} wins with ${winner.hand?.name || 'best hand'}! Pot: $${winner.pot}`);
    });

    socket.on('player-joined', ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on('player-left', ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    return () => {
      socket.off('game-state-update');
      socket.off('hand-started');
      socket.off('player-action-made');
      socket.off('phase-changed');
      socket.off('hand-ended');
      socket.off('player-joined');
      socket.off('player-left');
    };
  }, [socket]);

  useEffect(() => {
    if (socket && room) {
      const player = room.players.find(p => p.id === socket.id);
      setMyPlayer(player);
    }
  }, [socket, room]);

  const handleAction = (action, amount = 0) => {
    socket.emit('player-action', { roomId, action, amount });
  };

  const handleStartGame = () => {
    socket.emit('start-game', { roomId });
  };

  const isMyTurn = () => {
    return myPlayer && room.players[room.gameState.currentPlayerIndex]?.id === socket.id;
  };

  const getCallAmount = () => {
    if (!myPlayer) return 0;
    return room.gameState.currentBet - myPlayer.bet;
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div className="game-container">
      <div className="game-info">
        <h2>{room.name}</h2>
        <p>Phase: {room.gameState.phase}</p>
        <p>Players: {room.players.length}/10</p>
      </div>

      <div className="poker-table">
        <div className="pot-display">
          <h3>Pot: ${room.gameState.pot}</h3>
        </div>

        <div className="community-cards">
          {room.gameState.communityCards.map((card, i) => (
            <div key={i} className={`card ${card.color}`}>
              {card.rank}{card.suit}
            </div>
          ))}
        </div>

        <div className="players-container">
          {room.players.map((player, index) => (
            <div
              key={player.id}
              className={`player-seat ${
                room.gameState.currentPlayerIndex === index ? 'active' : ''
              } ${player.folded ? 'folded' : ''}`}
            >
              <div className="player-info">
                <h4>{player.name} {player.id === socket.id ? '(You)' : ''}</h4>
                <p>Chips: ${player.chips}</p>
                {player.bet > 0 && <p>Bet: ${player.bet}</p>}
              </div>

              <div className="player-cards">
                {player.cards.map((card, i) => (
                  <div
                    key={i}
                    className={`card ${
                      player.id === socket.id || room.gameState.phase === 'showdown'
                        ? card.color
                        : 'face-down'
                    }`}
                  >
                    {player.id === socket.id || room.gameState.phase === 'showdown'
                      ? `${card.rank}${card.suit}`
                      : '🂠'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {room.gameState.phase === 'waiting' ? (
        <div className="action-panel">
          <button className="btn btn-primary" onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      ) : (
        isMyTurn() && !myPlayer?.folded && (
          <div className="action-panel">
            <button className="btn btn-fold" onClick={() => handleAction('fold')}>
              Fold
            </button>
            <button className="btn btn-call" onClick={() => handleAction('call')}>
              {getCallAmount() > 0 ? `Call $${getCallAmount()}` : 'Check'}
            </button>
            <button className="btn btn-raise" onClick={() => handleAction('raise', 50)}>
              Raise $50
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default GameTable;
```

#### Step 3.4: Create Main App Component

Update `client/src/App.js`:

```javascript
import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import './App.css';

function App() {
  const socket = useSocket();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const handleJoinRoom = (id, room) => {
    setRoomId(id);
    setCurrentRoom(room);
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setCurrentRoom(null);
  };

  return (
    <div className="App">
      {!currentRoom ? (
        <Lobby socket={socket} onJoinRoom={handleJoinRoom} />
      ) : (
        <GameTable 
          socket={socket} 
          roomId={roomId} 
          room={currentRoom}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;
```

---

### Part 4: Styling

I'll provide basic CSS files. You can customize these based on the design from the original HTML file.

Create `client/src/components/Lobby.css`:

```css
.lobby {
  max-width: 600px;
  margin: 60px auto;
  padding: 40px;
  background: rgba(255,255,255,0.05);
  border-radius: 24px;
}

.lobby h1 {
  font-size: 3rem;
  text-align: center;
  color: #d4af37;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #d4af37;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d4af37;
  background: rgba(255,255,255,0.1);
  color: white;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  margin-top: 10px;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  color: #1a1a1a;
}

.rooms-section {
  margin-top: 40px;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
}
```

Create `client/src/components/GameTable.css`:

```css
.game-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%);
}

.poker-table {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85vw;
  max-width: 1200px;
  height: 70vh;
  background: radial-gradient(ellipse at center, #0d5e34 0%, #083d23 100%);
  border-radius: 50%;
  border: 20px solid #4a2511;
}

.pot-display {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  color: #d4af37;
  font-size: 2rem;
}

.community-cards {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
}

.card {
  width: 65px;
  height: 90px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.card.red { color: #dc2626; }
.card.black { color: #1a1a1a; }
.card.face-down {
  background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
  color: white;
}

.players-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.player-seat {
  position: absolute;
  padding: 15px;
  background: rgba(0,0,0,0.7);
  border-radius: 12px;
  border: 2px solid rgba(212,175,55,0.3);
}

.player-seat.active {
  border-color: #d4af37;
  box-shadow: 0 0 20px rgba(212,175,55,0.5);
}

.player-seat.folded {
  opacity: 0.4;
}

.action-panel {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
}

.btn-fold { background: #991b1b; color: white; }
.btn-call { background: #047857; color: white; }
.btn-raise { background: #d4af37; color: #1a1a1a; }
```

---

## Project Structure

```
poker-game/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Lobby.js
│   │   │   ├── Lobby.css
│   │   │   ├── GameTable.js
│   │   │   └── GameTable.css
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── server/
    ├── index.js
    ├── gameState.js
    ├── deck.js
    ├── handEvaluator.js
    └── package.json
```

---

## Deployment Guide

### Option 1: Deploy to Render (Free)

**Server Deployment:**

1. Create a GitHub repository and push your code
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: poker-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`
6. Click "Create Web Service"
7. Note your server URL (e.g., `https://poker-server.onrender.com`)

**Client Deployment:**

1. Update `client/src/hooks/useSocket.js` with your server URL
2. Build the React app: `npm run build`
3. Deploy to Render or Netlify/Vercel

### Option 2: Deploy to Railway

Similar process to Render, but with Railway's interface.

### Option 3: Local Development

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm start
```

Access the game at `http://localhost:3000`

---

## Testing & Debugging

### Testing Checklist

- [ ] Can create a room
- [ ] Can join a room
- [ ] Room password works
- [ ] Multiple players can join
- [ ] Game starts with 2+ players
- [ ] Cards are dealt correctly
- [ ] Blinds are posted
- [ ] Betting actions work (fold, call, raise)
- [ ] Community cards are revealed
- [ ] Winner is determined correctly
- [ ] Pot is awarded to winner
- [ ] New hand can start
- [ ] Player disconnect is handled

### Common Issues & Solutions

**Issue**: Socket connection fails
- **Solution**: Check CORS settings, ensure server is running, verify URL

**Issue**: Players can't see each other's actions
- **Solution**: Verify Socket.io room join/emit logic

**Issue**: Hand evaluator not working
- **Solution**: Check that all 7 cards (2 player + 5 community) are available

**Issue**: Game state not syncing
- **Solution**: Ensure all state updates emit to entire room

### Debugging Tools

```javascript
// Add to server/index.js for debugging
io.on('connection', (socket) => {
  console.log('Connection:', socket.id);
  
  socket.onAny((event, ...args) => {
    console.log(`Event: ${event}`, args);
  });
});
```

---

## Next Steps & Enhancements

### Feature Additions
1. **Chat system** - Add Socket.io chat events
2. **Tournaments** - Multi-table tournament structure
3. **Statistics** - Track wins, hands played, biggest pots
4. **Sounds** - Card dealing, chip sounds, notifications
5. **Animations** - Card flipping, chip movement
6. **AI Players** - Bot players for single-player mode
7. **Side Pots** - Handle all-in scenarios properly
8. **Spectator Mode** - Watch games without playing
9. **Hand History** - Review past hands
10. **User Accounts** - Persistent player profiles

### Performance Optimizations
- Implement Redis for room state (scales better)
- Add rate limiting
- Optimize hand evaluation algorithm
- Implement connection pooling

---

## Conclusion

You now have a complete real-time multiplayer poker game! This tutorial covered:

✅ Full Texas Hold'em game rules
✅ Node.js/Express backend with Socket.io
✅ React frontend with real-time updates
✅ Hand evaluation and winner determination
✅ Room management and player handling
✅ Deployment strategies

**Key Takeaways:**
- Socket.io enables real-time bidirectional communication
- Game state must be centralized on the server
- Always validate player actions server-side
- Emit events to specific rooms for multiplayer games
- Hand evaluation requires careful combination logic

Good luck building your poker empire! 🎰♠️♥️♦️♣️