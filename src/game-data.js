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
  'YYRR': 6,
  'YYYRR': 7,
  'RRRR': 8,
  'YYGG': 8,
  'YYRRR': 8,
  'YYYGG': 9,
  'RRGG': 10,
  'RRRRR': 10,
  'YYBB': 10,
  'YYGGG': 11,
  'YYYBB': 11,
  'GGGG': 12,
  'RRBB': 12,
  'RRRGG': 12,
  'RRGGG': 13,
  'GGBB': 14,
  'RRRBB': 14,
  'YYBBB': 14,
  'GGGGG': 15,
  'BBBB': 16,
  'RRBBB': 16,
  'GGGBB': 17,
  'GGBBB': 18,
  'BBBBB': 20,
  'YYRB': 9,
  'RRGB': 12,
  'YGGB': 12,
  'YYRRGG': 13,
  'YYRRBB': 15,
  'YYGGBB': 17,
  'RRGGBB': 19,
  'YRGB': 12,
  'YYYRGB': 14,
  'YRRRGB': 16,
  'YRGGGB': 18,
  'YRGBBB': 20,
};

export const ResourcesCardsData = {};
ResourcesCardsData[CardType.Trading] = [
  'YYY>B',
  'R>YYY',
  'GG>RRRYY',
  'GG>BRYY',
  'B>GYYY',
  'RR>GYYY',
  'RRR>GGYY',
  'B>RRYY',
  'YYYY>GG',
  'YY>G',
  'RY>B',
  'G>RR',
  'RR>BYY',
  'YYY>RG',
  'GG>BRR',
  'RRR>BGY',
  'B>RRR',
  'RRR>BB',
  'B>GRY',
  'G>RRY',
  'G>RYYYY',
  'YYYYY>BB',
  'YYYY>GB',
  'BB>GGRRR',
  'BB>GGGRY',
  'YYYYY>GGG',
  'GYY>BB',
  'GGG>BBB',
  'RRR>GGG',
  'YYY>RRR',
  'YY>RR',
  'GG>BB',
  'RR>GG',
  'B>GG',
].map(s => s.split('>'));

ResourcesCardsData[CardType.Production] = [
  'YY', 'YR', 'G', 'YYY', 'RYY', 'YYYY', 'B', 'RR', 'YG',
];

ResourcesCardsData[CardType.Upgrade] = [
  2, 3,
];
