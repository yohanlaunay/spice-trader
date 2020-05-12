//============
// Constants
//============
export const CardType = {
  Upgrade: 'Upgrade',
  Trading: 'Trading',
  Production: 'Production'
};

export const ResourceOrder = ['Y', 'R', 'G', 'B'];
export const ResourceVictoryPoints = {
  'Y': 0,
  'R': 1,
  'G': 1,
  'B': 1
};
export const CoinsVictoryPoints = {
  gold: 3,
  silver: 1
};

export const MinPlayerCount = 2;
export const MaxPlayerCount = 5;
export const PlayerMaxResources = 10;
export const PlayerMaxVictoryCards = 5;
export const ResourceCardsLineUpSize = 6;
export const VictoryCardsLineUpSize = 5;
export const StartingVictoryCoins = (numPlayers) => numPlayers * 2;
export const PlayerStartingResources = (playerPosition) => [
  'YYY', 'YYYY', 'YYYY', 'YYYR', 'YYYR',
][playerPosition];

//============
// Cards
//============
export const VictoryCardsData = {
  'YYYGG': 9,
  'YYGGBB': 17,
  'YYRRGG': 13,
  'RRGGBB': 19,
  'YYRR': 6,
  'GGBB': 14,
  'GGGBB': 17,
  'BBBBB': 20,
  'YRGBBB': 20,
  'YYBB': 10,
  'RRRBB': 14,
  'RRBB': 12,
  'YYGGG': 11,
  'RRRGG': 12,
  'RRGB': 12,
  'YYRRR': 8,
  'RRGGG': 13,
  'YYYBB': 11,
  'YYBBB': 14,
  'GGGG': 12,
  'YRGGGB': 18,
  'YGGB': 12,
  'YYYRGB': 14,
  'YRGB': 12,
  'YYRRBB': 15,
  'YRRRGB': 16,
  'RRBBB': 16,
  'YYGG': 8,
  'GGBBB': 18,
  'RRRR': 8,
  'RRRRR': 10,
  'YYYRR': 7,
  'YYRB': 9,
  'GGGGG': 15,
  'RRGG': 10,
  'BBBB': 16,
};

export const ResourcesCardsData = {};
ResourcesCardsData[CardType.Trading] = [
  'RY>B', 'G>RRY', 'B>RRR', 'GG>BB', 'YYYYY>GGG', 'YYYY>GB',
  'RRR>GGYY', 'GG>BRR', 'RR>BYY', 'BB>GGRRR', 'RRR>BB', 'G>RR',
  'GG>RRRYY', 'YYYYY>BB', 'B>GYYY', 'R>YYY', 'GYY>BB', 'GYY>BB',
  'GG>BRYY', 'RR>GYYY', 'YYY>RRR', 'B>RRYY', 'GGG>BBB', 'B>GRY',
  'YYYY>GG', 'YYY>RG', 'RRR>GGG', 'RR>GG', 'BB>GGGRY', 'YY>G',
  'RRR>BGY', 'YY>RR', 'G>RYYYY', 'YYY>B', 'B>GG',
].map(s => s.split('>'));

ResourcesCardsData[CardType.Production] = [
  'YYY', 'YYYY', 'RR', 'RYY', 'RY', 'GY', 'G', 'B',
];

ResourcesCardsData[CardType.Upgrade] = [
  3,
];
