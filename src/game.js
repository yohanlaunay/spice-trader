import React from 'react';
import './index.css';
import GameEngine from './game-engine.js';
import {
  PlayerMaxResources,
  PlayerMaxVictoryCards,
  CardType,
  ResourceOrder,
} from './game-data.js';

const GameActions = {
  DiscardResources: 'DiscardResources',
  SelectResourceUpgrade: 'SelectResourceUpgrade',
  PayResourceCard: 'PayResourceCard',
};

function isEntitySelected(props, uid){
  return !!(props.gameState.selectedUids||{})[uid];
}

function Resource(props){
  const classNames = ["resource", "resource-"+props.value];
  if( props.selected ){
    classNames.push("selected");
  }
  if( props.clickable ){
    classNames.push("clickable");
  }
  if( props.clickable ){
    return <div className={classNames.join(' ')} onClick={props.onClick} />
  }
  return (
    <div className={classNames.join(' ')} />
  );
}

function Resources(props){
  const resources = [];
  for(let resource of props.value){
      resources.push(
        <Resource
          value={resource.type}
          key={resource.uid}
          clickable={!!props.onResourceClicked}
          selected={isEntitySelected(props,resource.uid)}
          onClick={() => props.onResourceClicked(resource.uid)}
        />
      );
  }
  return (
    <div className='resource-list'>{resources}</div>
  );
}

function ResourcesRecipe(props){
  let resources = [];
  for( let resourceType of ResourceOrder ){
    const quantity = props.value[resourceType] || 0;
    for( let q = 0; q < quantity; q++ ){
      resources.push(
        <Resource
          value={resourceType}
          key={resourceType+'_'+q}
        />
      );
    }
  }
  return (
    <div className='resource-recipe'>{resources}</div>
  );
}

function VictoryCard(props) {
  const card = props.card;
  const classNames = ["card card-type-victory"];
  if( isEntitySelected(props, card.uid) ){
    classNames.push("selected");
  }

  let coinClassName = null;
  if( props.hasGoldCoin ){
    coinClassName = "gold";
  }else if( props.hasSilverCoin ){
    coinClassName = "silver";
  }
  return (
      <div
        className={classNames.join(' ')}
        onClick={props.onClick}
      >
      {coinClassName!==null?<div className={'coin '+coinClassName} />:<div />}
        <div className='points'>{card.points}</div>
        <ResourcesRecipe value={card.cost} />
      </div>
    );
}

class VictoryCards extends React.Component {

  render(){
    const board = this.props.board;
    const cardList = [];
    for( const [index, card] of board.victoryCardsLineUp.entries()){
      const hasGoldCoin = index === 0 && board.coins.gold > 0;
      const hasSilverCoin = index === 1 && board.coins.silver > 0;
      cardList.push(
          <VictoryCard
            gameState={this.props.gameState}
            key={card.uid}
            card={card}
            hasGoldCoin={hasGoldCoin}
            hasSilverCoin={hasSilverCoin}
            onClick={() => this.props.onCardClicked(card.uid)}
          />
      );
    };

    return (
      <div className="victory-board">
        <h1>Victory Cards</h1>
        <div className="card-list">
          {cardList}
        </div>
      </div>
    );
  }
}


function ResourceCard(props) {
  const card = props.card;
  const classNames = ['card', 'resource-card', 'card-type-'+card.type.toLowerCase()];
  if( isEntitySelected(props, card.uid) ){
    classNames.push('selected');
  }

  function renderUpgradeCard(){
    let upgradeCubes = [];
    for( let i = 0; i < card.upgradeCount; i++ ){
      upgradeCubes.push(
        <div key={i} className='resource resource-any' />
      );
    }
    return (
        <div
          className={classNames.join(' ')}
          onClick={props.onClick}
        >
          <div className='upgrade-container'>
            <div className='upgrade-arrow-top'></div>
            <div className='upgrade-arrow'>
              <div className='upgrade-cubes'>
                {upgradeCubes}
              </div>
            </div>
            <div className='upgrade-arrow-tip'></div>
          </div>
        </div>
      );
  }
  function renderTradingCard(){
    return (
        <div
          className={classNames.join(' ')}
          onClick={props.onClick}
        >
          <div className='trading-container'>
            <div className='trading-arrow'>
              <div className='cost'>
                <ResourcesRecipe value={card.cost} />
              </div>
              <div className='trading-inside-arrow' />
              <div className='production'>
                <ResourcesRecipe value={card.production} />
              </div>
            </div>
            <div className='trading-arrow-tip'></div>
          </div>
        </div>
      );
  }
  function renderProductionCard(){
    return (
        <div
          className={classNames.join(' ')}
          onClick={props.onClick}
        >
          <div className='production-container'>
            <div className='production-arrow'>
              <ResourcesRecipe value={card.production} />
            </div>
            <div className='production-arrow-tip'></div>
          </div>
        </div>
      );
  }

  switch( card.type ){
    case CardType.Upgrade:
      return renderUpgradeCard();
    case CardType.Trading:
      return renderTradingCard();
    case CardType.Production:
      return renderProductionCard();
    default:
      return (
        <div />
      )
  }
}

function ResourceCardSlots(props){
  const board = props.board;
  const cardList = board.resourceCardsLineUp.map((cardSlot) =>
    <div
      className='card-slot'
      key={cardSlot.card.uid}
    >
        <ResourceCard
          gameState={props.gameState}
          key={cardSlot.card.uid}
          card={cardSlot.card}
          onClick={() => props.onCardClicked(cardSlot.card.uid)}
        />
        <div className='bonus-resources'>
          <ResourcesRecipe
            value={cardSlot.resources}
          />
        </div>
    </div>
  );

  return (
    <div className="resources-board">
      <h1>Resource Cards</h1>
      <div className="card-list">
        {cardList}
      </div>
    </div>
  );
}

function PlayerHand(props){
  const player = props.player;
  return (
    <div className='player-hand'>
      {player.hand.map((card) =>
        <ResourceCard
          gameState={props.gameState}
          key={card.uid}
          card={card}
          onClick={() => props.onCardClicked(card.uid)}
        />
      )}
    </div>
  );
}

function PlayerResources(props){
  const player = props.player;
  return (
      <div className='player-resources'>
      <Resources
        gameState={props.gameState}
        value={player.resources}
        onResourceClicked={props.onResourceClicked}
      />
    </div>
  );
}

function Player(props) {
  let classNames = ['player'];
  if( props.selected ){
    classNames.push('selected');
  }else{
    classNames.push('not-selected');
  }
  const player = props.value;

  return (
    <div className={classNames.join(' ')}>
      <div className='header'>
        <div className='name'>
          {player.name}
        </div>
        <div className='player-vp'>
          <div className='vp-cards'>
            <div className='score'>
              {player.victoryCards.length}
            </div>
          </div>
          <div className='coin gold'>
            <div className='score'>
              {player.coins.gold}
            </div>
          </div>
          <div className='coin silver'>
            <div className='score'>
              {player.coins.silver}
            </div>
          </div>
        </div>
      </div>
      <PlayerResources
        gameState={props.gameState}
        player={player}
        onResourceClicked={props.onResourceClicked}
      />
    </div>
  );
}

function Players(props){
  const playerList = props.players.map((p, index) =>
    <Player
      gameState={props.gameState}
      value={p}
      key={p.name}
      selected={props.gameState.game.activePlayerIndex === index}
      onResourceClicked={props.onResourceClicked}
    />
  );
  return (
      <div className='player-list'>
        {playerList}
      </div>
  );
}

function ActionBar(props){

  const [lastKnownAction, setLastKnownAction] = React.useState(null);
  const currentAction = props.currentAction;
  const shouldScrollToTop = currentAction !== lastKnownAction;
  React.useEffect(() => {
    if( shouldScrollToTop ){
     window.scrollTo(0, 0)
     setLastKnownAction(currentAction);
    }
  }, [shouldScrollToTop,currentAction,setLastKnownAction]);


  // TODO render non-active player
  function renderInitState(){
    const canRest = GameEngine.getActivePlayer(props.gameState.game).discardPile.length > 0;
    return (
      <div className="action-content">
        <div className='message'>
          <b>Claim</b> a Victory Card OR <b>Buy</b> a Resource Card OR <b>Use</b> a Resource Card
        </div>
        {canRest?
          <div className='action-button' onClick={props.onPlayerRests}>Rest</div>
          :<div />}
      </div>
    );
  }
  function renderDiscardResourcesState(){
    const activePlayer = GameEngine.getActivePlayer(props.gameState.game);
    const resourcesToDiscard = activePlayer.resources.length - PlayerMaxResources;
    return (
      <div className="action-content">
          <div className='message'>
            You need to <b>Discard {resourcesToDiscard}</b> resources
          </div>
      </div>
    );
  }
  function renderSelectResourceUpgradeState(){
    return (
      <div className="action-content">
          <div className='message'>
            You can do up to <b>{props.gameState.currentActionData.numUpgradesRemaining} resource</b> upgrades
          </div>
          <div className='action-button' onClick={props.onPlayerPass}>Pass</div>
      </div>
    );
  }
  function renderPayResourceCardState(){
    let activePlayer = GameEngine.getActivePlayer(props.gameState.game);
    let numResourcesSelected = 0;
    for( let resource of activePlayer.resources ){
        if( isEntitySelected(props, resource.uid) ){
          numResourcesSelected++;
        }
    }
    const numResourcesToSelect = Math.abs(props.gameState.currentActionData.numResourcesForPayment - numResourcesSelected);
    return (
      <div className="action-content">
          <div className='message'>
            You need to select <b>{numResourcesToSelect} resource(s)</b> to pay for the cards before the selected one
          </div>
          <div className='action-button' onClick={props.onCancelPlayerAction}>Cancel</div>
      </div>
    );
  }

  function renderActionContent(){
    if( currentAction === null ){
      return renderInitState();
    }

    switch( currentAction ){
      case GameActions.DiscardResources:
        return renderDiscardResourcesState();
      case GameActions.SelectResourceUpgrade:
        return renderSelectResourceUpgradeState();
      case GameActions.PayResourceCard:
        return renderPayResourceCardState();
      default:
        return <div />; // should not happen
    }
  }

  const lastTurnClassNames = ['last-turn-message'];
  if( props.gameState.lastTurnStartingPlayer !== null ){
    lastTurnClassNames.push('active');
  }else{
    lastTurnClassNames.push('inactive');
  }

  return (
    <div id='action-bar'>
      <div className={lastTurnClassNames.join(' ')}>Last Turn</div>
      {renderActionContent()}
    </div>
  );
}

function PlayerScore(props){
  const player = props.player;
  const score = props.score;
  const classNames = ['player-score'];
  if( props.isWinner ){
    classNames.push(['winner']);
  }

  return (
    <div className={classNames.join(' ')}>
      <div className='name'>{player.name}</div>
      <div className='score'>
        <div className='score-total'>Total: <span>{score.total}</span></div>
        <div className='score-from-cards'>Victory cards: <span>{score.victoryCards}</span></div>
        <div className='score-from-coins'>Coins: <span>{score.coins}</span></div>
        <div className='score-from-resources'>Resources: <span>{score.resources}</span></div>
      </div>
    </div>
  );
}

function EndGameScoring(props) {
  const players = props.players;
  let scores = [];
  let winner = null;
  for( const player of players ){
    const playerScore =  GameEngine.getPlayerScore(player);
    // tie-breaker is winner is last to play
    if( winner === null || playerScore.total >= winner.score ){
      winner = {
        uid: player.uid,
        score: playerScore.total,
      };
    }
    scores.push({
      player: player,
      score:playerScore,
    });
  }

  let scoresUi = [];
  for( const score of scores ){
    scoresUi.push(
      <PlayerScore
        key={score.player.uid}
        player={score.player}
        score={score.score}
        isWinner={winner.uid===score.player.uid}
      />
    );
  }

  return (
    <div className='end-game'>
      <div className='end-game-content'>
        <div id='game-logo' />
        <div className='title'>End Game Scoring</div>
        {scoresUi}
      </div>
    </div>
  );
}

function GameLog(props){
  const history = props.history;
  const entries = [
    [
      <div className='turn-entry' key={'turn_start'}>
        <span className='turn'>Game Start</span>
      </div>
    ]
  ];
  let lastTurn = -1;
  for( const entry of history ){
    const key = entry.turn+'_'+entry.playerId;
    if( entry.turn !== lastTurn ){
      lastTurn = entry.turn;
      entries.unshift([
        <div className='turn-entry' key={'turn_'+lastTurn}>
          Turn <span className='turn'>{lastTurn+1}</span>
        </div>
      ]);
    }
    const classNames = ['entry'];
    if( entry.isVpCard ){
      classNames.push('vp');
    }
    entries[0].push(
      <div className={classNames.join(' ')} key={key}>
        <span className='player-name'>{entry.playerName}</span>
        <span className='action'>{entry.action}</span>
      </div>
    );
  }
  return (
    <div className='game-log'>
      <div className='title'>Moves history</div>
      <div className='entries'>
        {entries.map(e => e.map(e2 => e2))}
      </div>
    </div>
  );
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.onVictoryCardClicked = this.onVictoryCardClicked.bind(this);
    this.onResourceCardClicked = this.onResourceCardClicked.bind(this);
    this.onActivePlayerCardClicked = this.onActivePlayerCardClicked.bind(this);
    this.onActivePlayerResourceClicked = this.onActivePlayerResourceClicked.bind(this);
    this.onCancelPlayerAction = this.onCancelPlayerAction.bind(this);
    this.onPlayerPass = this.onPlayerPass.bind(this);
    this.onPlayerRests = this.onPlayerRests.bind(this);
    this.dismissError = this.dismissError.bind(this);

    this.state = {
      game: GameEngine.createGame(['yohan','claire','weesiong']),
      turn: 0,
      error: null,
      history: [],
      selectedUids: {},
      currentAction: null,
      currentActionData: null,
      lastTurnStartingPlayer: null,
    };
  }

  updateState(newState){
    // TODO firebase update
    this.setState(newState);
  }

  copyState(state){
    const newState = GameEngine.copy(state||this.state);
    newState.error = null;
    return newState;
  }

  dismissError(error){
    if( this.state.error === null ){
      return;
    }
    if( error && error.uid !== this.state.error.uid ){
      return;
    }
    const newState = this.copyState();
    newState.error = null;
    this.updateState(newState);
  }

  showError(errorMessage){
    const newState = this.copyState();
    newState.error = {
      uid: GameEngine.guid(),
      message: errorMessage,
    };
    this.updateState(newState);
  }

  createLog(state, player, action, isVpCard=false){
      return {
        turn: state.turn,
        playerId: player.uid,
        playerName: player.name,
        action: action,
        isVpCard: !!isVpCard,
      };
  }

  onVictoryCardClicked(cardId){
    const newState = this.copyState();
    if( newState.currentAction !== null ){
      return;
    }
    console.log("Victory Card Clicked", cardId);
    // claim the card if possible
    let activePlayer = GameEngine.getActivePlayer(newState.game);
    let result = GameEngine.playerBuyVictoryCard(activePlayer, newState.game.board, cardId);
    if( result === false ){
      this.showError('Not enough resources to claim this card');
      return;
    }
    newState.game.players[newState.game.activePlayerIndex] = result.player;
    newState.game.board = result.board;
    newState.history.push(this.createLog(newState, activePlayer, 'claimed VPs', true));
    this.endTurn(newState);
  }
  onResourceCardClicked(cardId){
    // Set default action when clicked to playing a resource card
    const newState = this.copyState();
    if( newState.currentAction !== null ){
      return;
    }
    console.log("Resource Card Clicked", cardId);
    let activePlayer = GameEngine.getActivePlayer(newState.game);
    // check if it's the first card, first is free, have to pay for others.
    let selectedCardIndex = newState.game.board.resourceCardsLineUp.findIndex(c => c.card.uid === cardId);
    if( selectedCardIndex === -1 ){
      this.showError('Invalid card picked, pick another one');
      return;
    } else if( selectedCardIndex === 0 ){
      // all good can claim for free
      let result = GameEngine.playerBuyResourceCard(activePlayer, newState.game.board, cardId, []);
      if( result === false ){
        this.showError('Not enough resources to pay for this card');
        return;
      }
      newState.game.players[newState.game.activePlayerIndex] = result.player;
      newState.game.board = result.board;
      newState.history.push(this.createLog(newState, activePlayer, 'bought a card'));
      this.endTurn(newState);
      return;
    }else{
      newState.currentActionData = {
        cardId: cardId,
        numResourcesForPayment: selectedCardIndex,
      };
      newState.currentAction = GameActions.PayResourceCard;
      newState.selectedUids[cardId] = true;
      this.updateState(newState);
      return;
    }
  }
  onActivePlayerCardClicked(cardId){
    const newState = this.copyState();
    if( newState.currentAction !== null ){
      return;
    }
    let activePlayer = GameEngine.getActivePlayer(newState.game);
    let selectedCard = GameEngine.playerFindCard(activePlayer, cardId);
    if (selectedCard === false) {
      return;
    }
    switch (selectedCard.type) {
      case CardType.Production:
        activePlayer = GameEngine.playerPlayProductionCard(activePlayer, cardId);
        if (activePlayer === false) {
          this.showError('Cannot play this card now, pick another one.');
          return;
        }
        newState.game.players[newState.game.activePlayerIndex] = activePlayer;
        newState.history.push(this.createLog(newState, activePlayer, 'produced'));
        this.endTurn(newState);
        break;
      case CardType.Trading:
        let selection = prompt("How many trades", "1");
        if( selection === null ){
          return;
        }
        let numTrades = parseInt(selection);
        if( numTrades <= 0 ){
          return;
        }
        activePlayer = GameEngine.playerPlayTradingCard(activePlayer, cardId, numTrades);
        if (activePlayer === false) {
          this.showError('Invalid trade, check your resources and try again.');
          return;
        }
        newState.game.players[newState.game.activePlayerIndex] = activePlayer;
        newState.history.push(this.createLog(newState, activePlayer, 'traded'));
        this.endTurn(newState);
        break;
      case CardType.Upgrade:
        newState.currentActionData = {
          cardId: cardId,
          numUpgradesRemaining: selectedCard.upgradeCount,
        };
        newState.selectedUids[cardId] = true;
        newState.currentAction = GameActions.SelectResourceUpgrade;
        this.updateState(newState);
        break;
      default:
        this.showError('Invalid card, pick another one');
        return;
    }
  }
  onActivePlayerResourceClicked(resourceId){
    const newState = this.copyState();
    // check that the resource belongs to the player
    let activePlayer = GameEngine.getActivePlayer(newState.game);
    if( activePlayer.resources.findIndex(r=>r.uid===resourceId) === -1){
      this.showError('You can only select your own resources');
      return;
    }

    if( newState.currentAction === GameActions.DiscardResources ){
      activePlayer = GameEngine.playerDiscardResource(activePlayer, resourceId);
      if( activePlayer === false ){
        this.showError('You can only select your own resources');
        return;
      }
      newState.game.players[newState.game.activePlayerIndex] = activePlayer;
      if( activePlayer.resources.length <= PlayerMaxResources ){
        this.endTurn(newState);
      }else{
        this.updateState(newState);
      }
      return;
    }
    if( newState.currentAction === GameActions.SelectResourceUpgrade ){
      let activePlayer = GameEngine.getActivePlayer(newState.game);
      activePlayer = GameEngine.playerUpgradeResource(activePlayer, resourceId);
      if( activePlayer === false ){
        this.showError('This resource cannot be upgraded further');
        return;
      }
      newState.game.players[newState.game.activePlayerIndex] = activePlayer;
      newState.currentActionData.numUpgradesRemaining--;
      if( newState.currentActionData.numUpgradesRemaining === 0 ){
        this.onPlayerPass(newState);
      }else{
        this.updateState(newState);
      }
      return;
    }
    if( newState.currentAction === GameActions.PayResourceCard ){
      if( newState.selectedUids[resourceId] === true ){
        newState.selectedUids[resourceId] = false;
      }else {
        newState.selectedUids[resourceId] = true;
      }
      // check if there are enough resources selected to pay.
      let activePlayer = GameEngine.getActivePlayer(newState.game);
      let payment = [];
      for( let res of activePlayer.resources ){
        if( newState.selectedUids[res.uid] === true ){
          payment.push(res.uid);
        }
      }
      if( payment.length < newState.currentActionData.numResourcesForPayment ){
        this.updateState(newState);
        return;
      }
      // Execute the action
      let result = GameEngine.playerBuyResourceCard(activePlayer, newState.game.board, newState.currentActionData.cardId, payment);
      if( result === false ){
        this.showError('Not enough resources for paying for this card');
        return;
      }
      newState.game.players[newState.game.activePlayerIndex] = result.player;
      newState.game.board = result.board;
      newState.history.push(this.createLog(newState, activePlayer, 'bought a card'));
      this.endTurn(newState);
      return;
    }
  }

  endTurn(state){
    const newState = this.copyState(state);
    const activePlayer = GameEngine.getActivePlayer(newState.game);
    // check if the active player has too many resources and should discard
    if( activePlayer.resources.length > PlayerMaxResources){
      newState.currentAction = GameActions.DiscardResources;
      this.updateState(newState);
      return;
    }

    newState.currentAction = null;
    newState.selectedUids = {};
    newState.currentActionData = null;

    const game = newState.game;
    // check if the game is on it's last turn
    // (if the active player has reached number of cards)
    if( newState.lastTurnStartingPlayer === null
        && activePlayer.victoryCards.length >= PlayerMaxVictoryCards){
      newState.lastTurnStartingPlayer = game.activePlayerIndex;
    }
    game.activePlayerIndex = (game.activePlayerIndex + 1) % game.players.length;
    // increase turn count when it's first player's turn again
    if( game.activePlayerIndex === 0 ){
      newState.turn++;
    }
    this.updateState(newState);
  }

  onCancelPlayerAction(){
    const newState = this.copyState();
    newState.currentAction = null;
    newState.selectedUids = {};
    this.updateState(newState);
  }

  onPlayerPass(state){
    if( state.currentAction === GameActions.SelectResourceUpgrade ){
      const newState = this.copyState(state);
      let activePlayer = GameEngine.getActivePlayer(newState.game);
      console.log("No more upgrades, discard the card", activePlayer);
      activePlayer = GameEngine.playerDiscardCard(activePlayer, newState.currentActionData.cardId);
      if (activePlayer === false) {
        this.showError('Error discarding this card');
        return;
      }
      newState.game.players[newState.game.activePlayerIndex] = activePlayer;
      newState.history.push(this.createLog(newState, activePlayer, 'upgraded'));
      this.endTurn(newState);
      return;
    }
  }

  onPlayerRests(){
    const newState = this.copyState();
    let activePlayer = GameEngine.getActivePlayer(newState.game);
    activePlayer = GameEngine.playerRests(activePlayer);
    newState.game.players[newState.game.activePlayerIndex] = activePlayer;
    newState.history.push(this.createLog(newState, activePlayer, 'rested'));
    this.endTurn(newState); // nothing async, end the action
  }

  render() {
    if(this.state.lastTurnStartingPlayer === this.state.game.activePlayerIndex ){
      return (
        <EndGameScoring players={this.state.game.players} />
      );
    }
    const error = this.state.error;
    if( error !== null ){
      setTimeout(() =>  this.dismissError(error), 3000);
    }

    return (
      <div id="game">
        <div id='error' className={error !== null?'active':'inactive'}>
          <span
            className='dismiss'
            onClick={()=>this.dismissError()}>&times;</span>
            {error !== null ? error.message:''}
        </div>
        <div id='panel'>
          <div id='game-logo' />
          <Players
            gameState={this.state}
            players={this.state.game.players}
            onResourceClicked={this.onActivePlayerResourceClicked}
          />
          <GameLog
            gameState={this.state}
            history={this.state.history}
          />
        </div>
        <div id="game-board">
          <ActionBar
            gameState={this.state}
            currentAction={this.state.currentAction}
            onCancelPlayerAction={this.onCancelPlayerAction}
            onPlayerPass={()=>this.onPlayerPass(this.state)}
            onPlayerRests={this.onPlayerRests}
          />
          <PlayerHand
            gameState={this.state}
            player={GameEngine.getActivePlayer(this.state.game)}
            onCardClicked={this.onActivePlayerCardClicked}
          />
          <VictoryCards
            gameState={this.state}
            board={this.state.game.board}
            onCardClicked={this.onVictoryCardClicked}
          />
          <ResourceCardSlots
            gameState={this.state}
            board={this.state.game.board}
            onCardClicked={this.onResourceCardClicked}
          />
        </div>
      </div>
    );
  }
}

export default Game;
