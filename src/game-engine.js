import {
  ResourceOrder,
  ResourceVictoryPoints,
  CardType,
  CoinsVictoryPoints,
  ResourcesCardsData,
  VictoryCardsData,
  ResourceCardsLineUpSize,
  VictoryCardsLineUpSize,
  StartingVictoryCoins,
  PlayerStartingResources,
} from './game-data.js';

//=====================
// Utils
//=====================
const guid = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const copy = (inObject) => {
  let outObject, value, key
  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }
  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]
    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = copy(value)
  }

  return outObject
};

const shuffleDeck = (deck) => {
  let temp = copy(deck);
  let shuffledDeck = [];
  for (let i = 0; i < deck.length; i++) {
    let j = Math.floor(Math.random() * temp.length)
    shuffledDeck.push(temp[j]);
    temp.splice(j, 1);
  }
  return shuffledDeck;
}

const drawCards = (deck, numberOfCardsToDraw) => {
  deck = copy(deck);
  let drawnCards = [];
  while (deck.length > 0 && numberOfCardsToDraw > 0) {
    drawnCards.push(deck.shift());
    numberOfCardsToDraw--;
  }
  return {
    cards: drawnCards,
    deck: deck,
    undrawn: numberOfCardsToDraw,
  };
};

const transferAllCards = (deckFrom, deckTo) => {
  deckTo = copy(deckTo);
  for (let i = 0; i < deckFrom.length; i++) {
    deckTo.push(deckFrom[i]);
  }
  return {
    deckFrom: [],
    deckTo: deckTo,
  }
};

const createResource = (type) => {
  return {
    type: type,
    uid: guid(),
  };
}

const createResourceRecipe = () => {
  let recipe = {};
  // Create the recipe
  for (const type of ResourceOrder) {
    recipe[type] = 0;
  }
  return recipe;
}

const addResourceToRecipe = (recipe, type) => {
  recipe = copy(recipe);
  recipe[type]++;
  return recipe;
}

const stringToResources = (str) => {
  return str.split('').map(res => createResource(res));
}

// {'Y':0,'R':1,...}
const stringToResourcesRecipe = (str) => {
  let recipe = createResourceRecipe();
  // Populate the recipe
  for (const type of str.split('')) {
    recipe[type]++;
  }
  return recipe;
}

// const resourcesToString = (res) => {
//   return res.map(r => r.type).join('');
// }

const resourcesRecipeToResources = (resRecipe) => {
  let resources = [];
  for (const type of ResourceOrder) {
    const quantity = resRecipe[type] || 0;
    for (let i = 0; i < quantity; i++) {
      resources.push(createResource(type));
    }
  }
  return resources;
}

// gold coin to first slot
const cardRewardsGoldCoin = (board, cardIndex) => {
  return board.coins.gold > 0 && cardIndex === 0;
}

// gold coin to first slot, silver to second.
// if ran out of gold coins, take a silver.
const cardRewardsSilverCoin = (board, cardIndex) => {
  return (board.coins.silver > 0) && (
    (cardIndex === 0 && board.coins.gold === 0) ||
    (cardIndex === 1 && board.coins.gold > 0));
}

//=====================
// Factories
//=====================
const createProductionCard = (productionStr) => {
  let card = newResourceCard(CardType.Production);
  card.production = stringToResourcesRecipe(productionStr);
  return card;
};

const createTradingCard = (costStr, productionStr) => {
  let card = newResourceCard(CardType.Trading);
  card.cost = stringToResourcesRecipe(costStr);
  card.production = stringToResourcesRecipe(productionStr);
  return card;
};

const createUpgradeCard = (quantity = 1) => {
  let card = newResourceCard(CardType.Upgrade);
  card.upgradeCount = quantity || 1;
  return card;
};

const newResourceCard = (type) => {
  return {
    uid: guid(),
    type: type,
  };
};

const createVictoryCard = (points, costStr) => {
  return {
    uid: guid(),
    points: points,
    cost: stringToResourcesRecipe(costStr),
  };
};

//=====================
// Game:Init
//=====================
const PlayerStartingHand = () => [
  createUpgradeCard(2),
  createProductionCard('YY'),
];
const AllResourceCards = [].concat(
  ResourcesCardsData[CardType.Production].map(p => createProductionCard(p))
).concat(
  ResourcesCardsData[CardType.Upgrade].map(u => createUpgradeCard(u))
).concat(
  ResourcesCardsData[CardType.Trading].map(t => createTradingCard(t[0], t[1]))
);

const AllVictoryCards = Object.entries(VictoryCardsData).map(
  (data) => createVictoryCard(data[1], data[0])
);

const createPlayer = (playerInfo, turnOrder) => {
  return {
    uid: playerInfo.uid,
    name: playerInfo.name,
    img: playerInfo.img,
    email: playerInfo.email,
    hand: PlayerStartingHand(),
    discardPile: [],
    victoryCards: [],
    resources: stringToResources(PlayerStartingResources(turnOrder)),
    coins: {
      gold: 0,
      silver: 0
    },
  };
};

const createGameBoard = (numPlayers) => {
  let gameBoard = {
    resourceCardsDeck: [],
    resourceCardsLineUp: [],
    victoryCardsDeck: [],
    victoryCardsLineUp: [],
    coins: {
      gold: StartingVictoryCoins(numPlayers),
      silver: StartingVictoryCoins(numPlayers),
    },
  };

  let victoryCards = drawCards(shuffleDeck(AllVictoryCards), VictoryCardsLineUpSize);
  gameBoard.victoryCardsDeck = victoryCards.deck;
  gameBoard.victoryCardsLineUp = victoryCards.cards;

  let resourceCards = drawCards(shuffleDeck(AllResourceCards), ResourceCardsLineUpSize);
  gameBoard.resourceCardsDeck = resourceCards.deck;
  gameBoard.resourceCardsLineUp = [];
  for (let i = 0; i < resourceCards.cards.length; i++) {
    gameBoard.resourceCardsLineUp.push({
      card: resourceCards.cards[i],
      resources: createResourceRecipe(),
    });
  }
  return gameBoard;
};

const createGame = (playerInfoList) => {
  let players = [];
  for (let turnOrder = 0; turnOrder < playerInfoList.length; turnOrder++) {
    players.push(createPlayer(playerInfoList[turnOrder], turnOrder));
  }
  return {
    activePlayerIndex: 0,
    players: players,
    board: createGameBoard(players.length),
  };
};

//=====================
// Game:Play
//=====================
const discardResource = (resources, uid) => {
  let resIndex = resources.findIndex((r) => r.uid === uid);
  if (resIndex === -1) {
    console.log('Resource not found');
    return false;
  }
  let outResources = copy(resources);
  outResources.splice(resIndex, 1);
  return outResources;
};

// Returns false if upgrade is not possible
const upgrade = (resources, resourceId, upgradeCount = 1) => {
  let resIndex = resources.findIndex((r) => r.uid === resourceId);
  if (resIndex === -1) {
    console.log('Resource not found');
    return false;
  }
  let res = resources[resIndex];
  // check if the new position is beyond the resources list
  let resOrder = ResourceOrder.findIndex((r) => r === res.type);
  if (resOrder === -1) {
    console.log('Invalid resource');
    return false;
  }
  let resNewOrder = resOrder + upgradeCount;
  if (resNewOrder >= ResourceOrder.length) {
    console.log(res.type + ' cannot be upgraded further');
    return false;
  }

  // all legit, perform
  let output = copy(resources);
  output[resIndex].type = ResourceOrder[resNewOrder];
  console.log('Upgraded ' + res.type + ' to ' + output[resIndex].type);
  return output;
};

const produce = (resources, productionRecipe, numOfTimes = 1) => {
  let output = copy(resources);
  for (let i = 0; i < numOfTimes; i++) {
    const producedResources = resourcesRecipeToResources(productionRecipe);
    output = output.concat(producedResources);
  }
  return output;
};

// Returns false if not enough resources to consume
const consume = (resources, costRecipe, numOfTimes = 1) => {
  let output = copy(resources);
  for (const type of ResourceOrder) {
    const quantity = numOfTimes * costRecipe[type] || 0;
    for (let i = 0; i < quantity; i++) {
      let resIndex = output.findIndex(r => r.type === type);
      if (resIndex === -1) {
        console.log('Not enough ' + type + ' to consume');
        return false;
      }
      output.splice(resIndex, 1);
    }
  }
  return output;
};

const buyVictoryCard = (resources, card) => {
  console.log('Buying a ' + card.points + ' VP card');
  return consume(resources, card.cost);
};

const playProductionCard = (resources, card) => {
  console.log('Playing ' + CardType.Production + ' card');
  if (card.type !== CardType.Production) {
    console.log('Not a ' + CardType.Production + ' card: ' + (card.type));
    return false;
  }
  return produce(resources, card.production);
};

const playTradingCard = (resources, card, numOfTimes = 1) => {
  console.log('Playing ' + CardType.Trading + ' card');
  if (card.type !== CardType.Trading) {
    console.log('Not a ' + CardType.Trading + ' card: ' + (card.type));
    return false;
  }
  let output = consume(resources, card.cost, numOfTimes);
  if (output === false) {
    return false;
  }
  return produce(output, card.production, numOfTimes);
};

const playUpgradeCard = (resources, card, resourceId) => {
  console.log('Playing ' + CardType.Upgrade + ' card');
  if (card.type !== CardType.Upgrade) {
    console.log('Not a ' + CardType.Upgrade + ' card: ' + (card.type));
    return false;
  }
  // Upgrade resources
  return upgrade(resources, resourceId, /*upgradeCount=*/ 1);
};

const getActivePlayer = (game) => {
  return game.players[game.activePlayerIndex];
};

const playerFindCard = (player, cardUid) => {
  let index = player.hand.findIndex((c) => c.uid === cardUid);
  if (index === -1) {
    console.log("Card not found", cardUid);
    return false;
  }
  return player.hand[index];
};

const playerDiscardCard = (player, cardUid) => {
  let index = player.hand.findIndex((c) => c.uid === cardUid);
  if (index === -1) {
    console.log("Card not found", cardUid);
    return false;
  }
  let outPlayer = copy(player);
  let discardedCard = outPlayer.hand[index];
  outPlayer.hand.splice(index, 1);
  outPlayer.discardPile.push(discardedCard);
  return outPlayer;
};

//=====================
// Game:Sequencing
//=====================
const playerPlayProductionCard = (player, cardUid) => {
  player = copy(player);
  let card = playerFindCard(player, cardUid);
  if (card === false) {
    return false;
  }
  // play the card
  player.resources = playProductionCard(player.resources, card);
  if (player.resources === false) {
    return false;
  }
  // move the card to the discard pile
  return playerDiscardCard(player, cardUid);
};

const playerPlayTradingCard = (player, cardUid, numTrades) => {
  player = copy(player);
  let card = playerFindCard(player, cardUid);
  if (card === false) {
    return false;
  }
  // play the card
  player.resources = playTradingCard(player.resources, card, numTrades);
  if (player.resources === false) {
    return false;
  }
  // move the card to the discard pile
  return playerDiscardCard(player, cardUid);
};

const playerPlayUpgradeCard = (player, cardUid, resourceId) => {
  player = copy(player);
  let card = playerFindCard(player, cardUid);
  if (card === false) {
    return false;
  }
  // play the card
  player.resources = playUpgradeCard(player.resources, card, resourceId);
  if (player.resources === false) {
    return false;
  }
  // don't discard upgrades can be done multiple times asynchronously
  return player;
};

// resourcesPayment is an array of resource positions
const playerBuyResourceCard = (player, board, cardUid, paymentResIds) => {

  player = copy(player);
  board = copy(board);
  paymentResIds = copy(paymentResIds);

  // first check if the card exists in the line-up
  let cardIndex = board.resourceCardsLineUp.findIndex((c) => c.card.uid === cardUid);
  if (cardIndex === -1) {
    console.log("Card not found");
    return false;
  }
  // check if the user has provided enough payment for it by providing resources
  if (paymentResIds.length < cardIndex) {
    console.log("Not enough payment provided");
    return false;
  }

  // use the payment to pay for the cards before the one the user wants in the list
  for (let cardPosition = 0; cardPosition < board.resourceCardsLineUp.length; cardPosition++) {
    let cardSlot = board.resourceCardsLineUp[cardPosition];
    if (cardSlot.card.uid !== cardUid) {
      // need to pay, take the resource from the user and add it to the card
      let paymentResId = paymentResIds[cardPosition];
      let paymentResIndex = player.resources.findIndex((r) => r.uid === paymentResId);
      if (paymentResIndex === -1) {
        console.log('Resource not found for payment');
      }
      let paymentResType = player.resources[paymentResIndex].type;
      player.resources = discardResource(player.resources, paymentResId);
      if (player.resources === false) {
        return false;
      }
      cardSlot.resources = addResourceToRecipe(cardSlot.resources, paymentResType);
      console.log("Player paid a " + paymentResType + " on card " + (cardPosition + 1));
    } else {
      // remove the card from the slot
      // put into the hand
      // give associated resources to the player (if any)
      // draw another card if possible to refill the lineup
      board.resourceCardsLineUp.splice(cardPosition, 1);
      player.hand.push(cardSlot.card);
      player.resources = produce(player.resources, cardSlot.resources);
      let drawResult = drawCards(board.resourceCardsDeck, /*numberOfCardsToDraw=*/ 1);
      if (drawResult.cards.length === 0) {
        break; // no more cards to draw
      }
      board.resourceCardsDeck = drawResult.deck;
      board.resourceCardsLineUp.push({
        card: drawResult.cards[0],
        resources: createResourceRecipe(),
      });
      break;
    }
  }

  return {
    player: player,
    board: board,
  };
};

const playerBuyVictoryCard = (player, board, cardUid) => {
  player = copy(player);
  board = copy(board);
  // first check if the card exists in the line-up
  let cardIndex = board.victoryCardsLineUp.findIndex((c) => c.uid === cardUid);
  if (cardIndex === -1) {
    console.log("Card not found");
    return false;
  }
  let card = board.victoryCardsLineUp.splice(cardIndex, 1)[0];
  player.resources = buyVictoryCard(player.resources, card);
  if (player.resources === false) {
    return false;
  }
  player.victoryCards.push(card);
  // add coins if any.
  // gold coin to first slot, silver to second.
  // if ran out of gold coins, take a silver.
  if (cardRewardsGoldCoin(board, cardIndex)) {
    board.coins.gold--;
    player.coins.gold++;
    console.log("Player collects a gold coin");
  } else if (cardRewardsSilverCoin(board, cardIndex)) {
    board.coins.silver--;
    player.coins.silver++;
    console.log("Player collects a silver coin");
  }
  // refill the line-up
  let drawResult = drawCards(board.victoryCardsDeck, /*numberOfCardsToDraw=*/ 1);
  board.victoryCardsDeck = drawResult.deck;
  board.victoryCardsLineUp = board.victoryCardsLineUp.concat(drawResult.cards);
  return {
    board: board,
    player: player,
  }
};

// Rest recovers all cards from discard pile into the hand
const playerRests = (player) => {
  player = copy(player);
  let result = transferAllCards(player.discardPile, player.hand);
  player.discardPile = result.deckFrom;
  player.hand = result.deckTo;
  return player;
}

// Discard specified resources from player inventory
const playerDiscardResource = (player, resourceId) => {
  player = copy(player);
  let resources = discardResource(player.resources, resourceId);
  if (resources === false) {
    return false;
  }
  player.resources = resources;
  return player;
}

// Upgrade a specific resource once if possible
const playerUpgradeResource = (player, resourceId) => {
  player = copy(player);
  let resources = upgrade(player.resources, resourceId);
  if (resources === false) {
    return false;
  }
  player.resources = resources;
  return player;
}

// VP cards + points per resources + coins
const getPlayerScore = (player) => {
  let score = {
    total: 0,
    resources: 0,
    victoryCards: 0,
    coins: 0,
  }
  // Points for resources
  for (let resource of player.resources) {
    score.resources += ResourceVictoryPoints[resource.type] || 0;
  }
  score.total += score.resources;

  // Points for victory cards
  for (let card of player.victoryCards) {
    score.victoryCards += card.points || 0;
  }
  score.total += score.victoryCards;

  // Points for coins
  score.coins += CoinsVictoryPoints.silver * player.coins.silver || 0;
  score.coins += CoinsVictoryPoints.gold * player.coins.gold || 0;
  score.total += score.coins;

  return score;

}

const GameEngine = {
  copy: copy,
  guid: guid,
  createGame: createGame,
  getPlayerScore: getPlayerScore,
  getActivePlayer: getActivePlayer,
  playerRests: playerRests,
  playerBuyVictoryCard: playerBuyVictoryCard,
  playerFindCard: playerFindCard,
  playerPlayProductionCard: playerPlayProductionCard,
  playerPlayTradingCard: playerPlayTradingCard,
  playerPlayUpgradeCard: playerPlayUpgradeCard,
  playerDiscardCard: playerDiscardCard,
  playerDiscardResource: playerDiscardResource,
  playerUpgradeResource: playerUpgradeResource,
  playerBuyResourceCard: playerBuyResourceCard,
  cardRewardsGoldCoin: cardRewardsGoldCoin,
  cardRewardsSilverCoin: cardRewardsSilverCoin,
};

export default GameEngine;
