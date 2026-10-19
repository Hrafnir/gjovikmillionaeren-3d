import { BOARD_TILES, TOKENS, GROUP_COLORS, CHANCE_CARDS, CHEST_CARDS, GJOVIK_QUOTES } from './data.js';
import { BoardScene3D } from './scene3d.js';
import { sound } from './sound.js';

const AI_DIFFICULTIES = {
  human:     { label: '👤 Menneske (Bytte Sete)', isAI: false },
  ai_easy:   { label: '🤖 Robot: Lett (Toten-turist)', isAI: true, level: 'easy', badge: '🤖 Lett' },
  ai_medium: { label: '🤖 Robot: Middels (Kallerud)', isAI: true, level: 'medium', badge: '🤖 Middels' },
  ai_hard:   { label: '🤖 Robot: Vanskelig (Storgata)', isAI: true, level: 'hard', badge: '🤖 Vanskelig' }
};

class GjovikMonopolyGame {
  constructor() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.round = 1;
    this.fastlandPot = 500;

    // House Rules (Default: Classic full-group building rule!)
    this.buildRule = 'classic'; // 'classic' (full group + even build), 'classic_free' (full group), 'gjovik' (any owned street)
    this.potRule = 'pot';       // 'pot' or 'classic'
    this.goRule = 'normal';     // 'normal' (2000) or 'double' (4000 on exact landing)
    this.auctionRule = 'on';    // 'on' or 'off'
    this.showHotseatScreen = true;

    this.lastDiceSum = 7;
    this.doublesCount = 0;
    this.canRoll = true;
    this.pendingBuyTileId = null;
    this.aiBusy = false;

    // Shuffled decks for Byavisa (Sjanse) and Mjøsgløtt (Prøvelykken)
    this.chanceDeck = [];
    this.chestDeck = [];

    // Property ownership state: tileId -> { ownerId, houses (0..5), mortgaged: false }
    this.properties = new Map();
    BOARD_TILES.forEach(t => {
      if (['street', 'station', 'utility'].includes(t.type)) {
        this.properties.set(t.id, { ownerId: null, houses: 0, mortgaged: false });
      }
    });

    // Setup default 3 players (1 Human + 2 AI Robots so user can test AI immediately or switch to all human)
    this.setupDraftPlayers = [
      { name: 'Kari fra Kallerud', tokenIdx: 0, type: 'human' },
      { name: 'Ola i Storgata', tokenIdx: 1, type: 'ai_medium' },
      { name: 'Per på Hovdetoppen', tokenIdx: 2, type: 'ai_hard' }
    ];

    // Initialize 3D Scene
    const container = document.getElementById('canvas-container');
    this.scene3d = new BoardScene3D(container, (tileId) => {
      sound.click();
      this.inspectTile(tileId);
    });

    this.initSetupUI();
    this.bindUIEvents();
    this.inspectTile(0);
  }

  drawCardFromDeck(type) {
    if (type === 'chance') {
      if (this.chanceDeck.length === 0) {
        this.chanceDeck = [...CHANCE_CARDS].sort(() => Math.random() - 0.5);
      }
      return this.chanceDeck.pop();
    } else {
      if (this.chestDeck.length === 0) {
        this.chestDeck = [...CHEST_CARDS].sort(() => Math.random() - 0.5);
      }
      return this.chestDeck.pop();
    }
  }

  // ==================== SETUP SCREEN ====================
  initSetupUI() {
    this.renderSetupPlayers();

    document.getElementById('btn-add-player').addEventListener('click', () => {
      if (this.setupDraftPlayers.length >= 6) return;
      sound.click();
      const nextIdx = this.setupDraftPlayers.length;
      const defaultNames = [
        'Kari fra Kallerud', 'Ola i Storgata', 'Per på Hovdetoppen',
        'Lise fra Hunndalen', 'Sondre på Fastland', 'Gerd på Gjøvik Gård'
      ];
      this.setupDraftPlayers.push({
        name: defaultNames[nextIdx] || `Spiller ${nextIdx + 1}`,
        tokenIdx: nextIdx % TOKENS.length,
        type: 'ai_medium'
      });
      this.renderSetupPlayers();
    });

    document.getElementById('btn-rem-player').addEventListener('click', () => {
      if (this.setupDraftPlayers.length <= 2) return;
      sound.click();
      this.setupDraftPlayers.pop();
      this.renderSetupPlayers();
    });

    document.getElementById('btn-start-game').addEventListener('click', () => {
      sound.whistle();
      this.startNewGame();
    });
  }

  renderSetupPlayers() {
    const list = document.getElementById('setup-players-list');
    document.getElementById('setup-pcount').textContent = `${this.setupDraftPlayers.length} spillere`;
    list.innerHTML = '';

    this.setupDraftPlayers.forEach((dp, idx) => {
      const token = TOKENS[dp.tokenIdx];
      const row = document.createElement('div');
      row.className = 'setup-player-item';
      row.innerHTML = `
        <div class="sp-color-badge" style="background:${token.color}33; border: 2px solid ${token.color}">
          ${token.icon}
        </div>
        <input type="text" class="sp-name-input" value="${dp.name}" data-idx="${idx}" placeholder="Spillernavn" />
        <select class="sp-type-select" data-idx="${idx}">
          ${Object.entries(AI_DIFFICULTIES).map(([key, info]) => `
            <option value="${key}" ${key === dp.type ? 'selected' : ''}>${info.label}</option>
          `).join('')}
        </select>
        <select class="sp-token-select" data-idx="${idx}">
          ${TOKENS.map((t, tIdx) => `
            <option value="${tIdx}" ${tIdx === dp.tokenIdx ? 'selected' : ''}>
              ${t.icon} ${t.name}
            </option>
          `).join('')}
        </select>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll('.sp-name-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const i = Number(e.target.dataset.idx);
        this.setupDraftPlayers[i].name = e.target.value;
      });
    });

    list.querySelectorAll('.sp-type-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        sound.click();
        const i = Number(e.target.dataset.idx);
        this.setupDraftPlayers[i].type = e.target.value;
      });
    });

    list.querySelectorAll('.sp-token-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        sound.click();
        const i = Number(e.target.dataset.idx);
        this.setupDraftPlayers[i].tokenIdx = Number(e.target.value);
        this.renderSetupPlayers();
      });
    });
  }

  startNewGame() {
    const startCash = Number(document.getElementById('opt-start-cash').value) || 15000;
    this.buildRule = document.getElementById('opt-build-rule').value;
    this.potRule = document.getElementById('opt-pot-rule').value;
    this.goRule = document.getElementById('opt-go-rule').value;
    this.auctionRule = document.getElementById('opt-auction-rule').value;
    this.showHotseatScreen = document.getElementById('opt-hotseat-screen').value === 'on';

    this.fastlandPot = this.potRule === 'pot' ? 500 : 0;
    document.getElementById('pot-indicator').classList.toggle('hidden', this.potRule !== 'pot');

    this.players = this.setupDraftPlayers.map((dp, idx) => {
      const diffInfo = AI_DIFFICULTIES[dp.type] || AI_DIFFICULTIES.human;
      return {
        id: idx,
        name: dp.name.trim() || `Spiller ${idx + 1}`,
        token: TOKENS[dp.tokenIdx],
        isAI: diffInfo.isAI,
        aiLevel: diffInfo.level || null,
        aiBadge: diffInfo.badge || null,
        money: startCash,
        position: 0,
        inJail: false,
        jailTurns: 0,
        jailFreeCards: 0,
        bankrupt: false
      };
    });

    document.getElementById('setup-overlay').classList.add('hidden');
    this.scene3d.createPlayerTokens(this.players);

    const ruleText = this.buildRule === 'classic'
      ? 'Klassisk byggeregel (krever hel fargeserie + jevn bygging)'
      : this.buildRule === 'classic_free'
        ? 'Halvklassisk (krever hel fargeserie)'
        : 'Gjøvik-modus (bygg på enkeltgater)';

    this.addLog(`🚢 Spillet er i gang med ${this.players.length} spillere! Byggeregel: ${ruleText}.`);
    this.startPlayerTurn(false);
  }

  // ==================== UI BINDINGS ====================
  bindUIEvents() {
    // Camera Controls
    const setCamBtn = (activeId, mode) => {
      ['btn-cam-orbit', 'btn-cam-follow', 'btn-cam-top'].forEach(id => {
        document.getElementById(id).classList.toggle('active', id === activeId);
      });
      const p = this.getActivePlayer();
      const pos = p ? this.scene3d.tilePositions[p.position] : null;
      this.scene3d.setCameraMode(mode, pos);
    };

    document.getElementById('btn-cam-orbit').addEventListener('click', () => {
      sound.click();
      setCamBtn('btn-cam-orbit', 'orbit');
    });
    document.getElementById('btn-cam-follow').addEventListener('click', () => {
      sound.click();
      setCamBtn('btn-cam-follow', 'follow');
    });
    document.getElementById('btn-cam-top').addEventListener('click', () => {
      sound.click();
      setCamBtn('btn-cam-top', 'top');
    });

    // Day / Night Toggle
    document.getElementById('btn-daynight').addEventListener('click', (e) => {
      sound.click();
      const isNight = this.scene3d.toggleDayNight();
      e.currentTarget.textContent = isNight ? '☀️ Dag' : '🌙 Kveld';
      e.currentTarget.classList.toggle('active', isNight);
    });

    // Sound Toggle
    document.getElementById('btn-sound').addEventListener('click', (e) => {
      const enabled = sound.toggle();
      e.currentTarget.textContent = enabled ? '🔊 Lyd' : '🔇 Stille';
    });

    // Rules Modal
    document.getElementById('btn-rules').addEventListener('click', () => {
      sound.click();
      document.getElementById('rules-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-rules').addEventListener('click', () => {
      document.getElementById('rules-modal').classList.add('hidden');
    });

    // Real Place Photo Lightbox Modal
    document.getElementById('skjote-photo-wrap')?.addEventListener('click', () => {
      if (this.inspectedTileId !== undefined && BOARD_TILES[this.inspectedTileId]) {
        sound.click();
        this.openPhotoLightbox(BOARD_TILES[this.inspectedTileId]);
      }
    });
    document.getElementById('btn-close-lightbox')?.addEventListener('click', () => {
      sound.click();
      document.getElementById('photo-lightbox-modal').classList.add('hidden');
    });
    document.getElementById('photo-lightbox-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'photo-lightbox-modal') {
        document.getElementById('photo-lightbox-modal').classList.add('hidden');
      }
    });

    // Turn & Dice Actions
    document.getElementById('btn-roll').addEventListener('click', () => {
      if (!this.getActivePlayer()?.isAI) this.handleRollDice();
    });
    document.getElementById('btn-buy-inline').addEventListener('click', () => {
      if (!this.getActivePlayer()?.isAI) this.handleBuyCurrentTile();
    });
    document.getElementById('btn-auction-inline').addEventListener('click', () => {
      if (this.pendingBuyTileId !== null) {
        this.openAuctionModal(this.pendingBuyTileId);
      }
    });
    document.getElementById('btn-skip-buy-inline').addEventListener('click', () => {
      sound.click();
      const tid = this.pendingBuyTileId;
      this.pendingBuyTileId = null;
      if (tid !== null) {
        this.addLog(`⏭️ ${this.getActivePlayer().name} valgte å ikke kjøpe ${BOARD_TILES[tid].name}.`);
      }
      this.updateDockButtons();
    });
    document.getElementById('btn-jail-pay').addEventListener('click', () => {
      if (!this.getActivePlayer()?.isAI) this.handlePayJailFine();
    });
    document.getElementById('btn-jail-card').addEventListener('click', () => {
      if (!this.getActivePlayer()?.isAI) this.handleUseJailCard();
    });
    document.getElementById('btn-end-turn').addEventListener('click', () => {
      if (!this.getActivePlayer()?.isAI) this.advanceToNextPlayer();
    });

    // Hot-seat Ready Button
    document.getElementById('btn-hs-ready').addEventListener('click', () => {
      sound.click();
      document.getElementById('hotseat-overlay').classList.add('hidden');
    });

    // Property Manager Modal
    document.getElementById('btn-manage-props').addEventListener('click', () => {
      sound.click();
      this.openPropertyManager();
    });
    document.getElementById('btn-close-props').addEventListener('click', () => {
      document.getElementById('props-modal').classList.add('hidden');
    });

    // Trade Modal
    document.getElementById('btn-trade').addEventListener('click', () => {
      sound.click();
      this.openTradeModal();
    });
    document.getElementById('btn-close-trade').addEventListener('click', () => {
      document.getElementById('trade-modal').classList.add('hidden');
    });
    document.getElementById('btn-execute-trade').addEventListener('click', () => this.executeTrade());
  }

  // ==================== TURN MANAGEMENT & AI CONTROLLER ====================
  getActivePlayer() {
    return this.players[this.currentPlayerIndex];
  }

  startPlayerTurn(showTransition = true) {
    const p = this.getActivePlayer();
    if (!p || p.bankrupt) return;

    this.doublesCount = 0;
    this.canRoll = true;
    this.pendingBuyTileId = null;
    this.aiBusy = false;

    this.scene3d.focusOnTile(p.position);
    this.inspectTile(p.position);
    this.updateHUD();

    // Only show "Bytt Sete" screen if the player is a HUMAN and at least 2 humans are playing
    const humanCount = this.players.filter(pl => !pl.isAI && !pl.bankrupt).length;
    if (showTransition && this.showHotseatScreen && !p.isAI && humanCount > 1) {
      const overlay = document.getElementById('hotseat-overlay');
      document.getElementById('hs-icon').textContent = p.token.icon;
      document.getElementById('hs-player-name').textContent = p.name;
      document.getElementById('hs-player-rank').textContent = `${this.getPlayerRankTitle(p)} • kr ${p.money.toLocaleString('no-NO')}`;
      document.getElementById('hs-quote').textContent = GJOVIK_QUOTES[Math.floor(Math.random() * GJOVIK_QUOTES.length)];
      overlay.classList.remove('hidden');
    }

    if (p.inJail) {
      this.setTurnStatus(
        `${p.name} sitter i Arresten i Fjellhallen (Tur ${p.jailTurns + 1}/3)`,
        p.isAI ? '🤖 Roboten vurderer hvordan den skal komme seg ut...' : 'Betal kr 500, bruk frikort, eller prøv å kaste to like!'
      );
    } else {
      this.setTurnStatus(
        `${p.name} sin tur!`,
        p.isAI ? `🤖 ${p.aiBadge} gjør seg klar til å kaste...` : `Står på ${BOARD_TILES[p.position].name}. Kast terningene!`
      );
    }
    this.updateDockButtons();

    if (p.isAI) {
      this.runAITurn(p);
    }
  }

  // Full Autonomous AI Turn Loop – rolig tempo så alle rekker å lese!
  async runAITurn(aiPlayer) {
    this.aiBusy = true;
    this.updateDockButtons();
    await new Promise(r => setTimeout(r, 1500));

    if (aiPlayer.bankrupt || this.getActivePlayer()?.id !== aiPlayer.id) return;

    // 1. If AI is in Jail (Fjellhallen), decide whether to use card or pay kr 500 before rolling
    if (aiPlayer.inJail) {
      if (aiPlayer.jailFreeCards > 0) {
        this.handleUseJailCard();
        await new Promise(r => setTimeout(r, 1200));
      } else if (this.shouldAIPayJailFine(aiPlayer)) {
        this.handlePayJailFine();
        await new Promise(r => setTimeout(r, 1200));
      }
    }

    // 2. Roll Dice!
    if (this.canRoll) {
      await this.handleRollDice();
    }

    await new Promise(r => setTimeout(r, 1850));

    // 3. If landed on an unowned property, AI decides whether to buy or auction/skip
    if (this.pendingBuyTileId !== null && !aiPlayer.bankrupt) {
      const tile = BOARD_TILES[this.pendingBuyTileId];
      const wantsToBuy = this.shouldAIBuyProperty(aiPlayer, tile);
      if (wantsToBuy && aiPlayer.money >= tile.price) {
        this.handleBuyCurrentTile();
        await new Promise(r => setTimeout(r, 1350));
      } else {
        if (this.auctionRule === 'on') {
          this.addLog(`🤖 ${aiPlayer.name} takket nei til full pris på ${tile.name} – sender tomta til auksjon!`);
          await this.openAuctionModal(this.pendingBuyTileId);
        } else {
          this.addLog(`🤖 ${aiPlayer.name} stod over kjøp av ${tile.name}.`);
          this.pendingBuyTileId = null;
        }
      }
    }

    // 4. AI checks if it can unmortgage or build houses/hotels according to House Rules
    if (!aiPlayer.bankrupt) {
      await this.runAIPortfolioManagement(aiPlayer);
    }

    // 5. If AI rolled doubles and can still roll, continue AI turn!
    if (this.canRoll && !aiPlayer.inJail && !aiPlayer.bankrupt) {
      await new Promise(r => setTimeout(r, 1400));
      return this.runAITurn(aiPlayer);
    }

    // 6. End AI Turn after a readable pause
    await new Promise(r => setTimeout(r, 1650));
    if (this.getActivePlayer()?.id === aiPlayer.id) {
      this.advanceToNextPlayer();
    }
  }

  shouldAIPayJailFine(ai) {
    if (ai.money < 900) return false;
    const totalBuyable = this.properties.size;
    const ownedTotal = Array.from(this.properties.values()).filter(p => p.ownerId !== null).length;
    const unownedRatio = (totalBuyable - ownedTotal) / totalBuyable;

    if (ai.aiLevel === 'easy') return Math.random() < 0.5;
    if (ai.aiLevel === 'medium') return unownedRatio > 0.35;
    // Hard AI pays immediately while streets are still up for grabs, stays in jail if board has many enemy hotels
    return unownedRatio > 0.22;
  }

  shouldAIBuyProperty(ai, tile) {
    if (ai.money < tile.price) return false;
    const cashAfter = ai.money - tile.price;

    if (ai.aiLevel === 'easy') {
      // Easy AI: tourist from Toten, buys ~65% of the time if comfortable cash
      return cashAfter >= 400 && Math.random() < 0.68;
    }

    // Check if buying completes a color group or blocks an opponent's color group
    const groupTiles = BOARD_TILES.filter(t => t.group === tile.group && t.type === 'street');
    const aiOwnedInGroup = groupTiles.filter(t => this.properties.get(t.id)?.ownerId === ai.id).length;
    const completesGroup = tile.type === 'street' && (aiOwnedInGroup + 1 === groupTiles.length);

    const blocksOpponent = tile.type === 'street' && this.players.some(other => {
      if (other.id === ai.id || other.bankrupt) return false;
      const otherOwned = groupTiles.filter(t => this.properties.get(t.id)?.ownerId === other.id).length;
      return otherOwned + 1 === groupTiles.length;
    });

    if (ai.aiLevel === 'medium') {
      if (completesGroup || tile.type === 'station') return true;
      return cashAfter >= 350;
    }

    // Hard AI: Storgata-baron! Always buys if completing/blocking or if it has any cash
    if (completesGroup || blocksOpponent || tile.type === 'station') return true;
    return cashAfter >= 150;
  }

  // Evaluate max bid an AI is willing to make in an auction for `tile`
  getAIMaxAuctionBid(ai, tile) {
    if (ai.bankrupt || ai.money < 150) return 0;

    const groupTiles = BOARD_TILES.filter(t => t.group === tile.group && t.type === 'street');
    const aiOwnedInGroup = groupTiles.filter(t => this.properties.get(t.id)?.ownerId === ai.id).length;
    const completesGroup = tile.type === 'street' && (aiOwnedInGroup + 1 === groupTiles.length);
    const blocksOpponent = tile.type === 'street' && this.players.some(other => {
      if (other.id === ai.id || other.bankrupt) return false;
      const otherOwned = groupTiles.filter(t => this.properties.get(t.id)?.ownerId === other.id).length;
      return otherOwned + 1 === groupTiles.length;
    });

    let mult = 0.7;
    if (ai.aiLevel === 'easy') {
      mult = 0.55 + Math.random() * 0.25;
    } else if (ai.aiLevel === 'medium') {
      mult = completesGroup ? 1.15 : (aiOwnedInGroup > 0 ? 0.95 : 0.8);
    } else if (ai.aiLevel === 'hard') {
      mult = completesGroup ? 1.45 : (blocksOpponent ? 1.25 : (aiOwnedInGroup > 0 ? 1.05 : 0.92));
    }

    const maxAffordable = Math.max(0, ai.money - (ai.aiLevel === 'hard' ? 200 : 500));
    return Math.min(maxAffordable, Math.floor(tile.price * mult));
  }

  async runAIPortfolioManagement(ai) {
    const reserve = ai.aiLevel === 'easy' ? 2200 : (ai.aiLevel === 'medium' ? 1200 : 700);

    // 1. Unmortgage properties if flush with cash
    for (const [tid, prop] of this.properties.entries()) {
      if (prop.ownerId === ai.id && prop.mortgaged) {
        const tile = BOARD_TILES[tid];
        const unmortCost = Math.floor((tile.price / 2) * 1.1);
        if (ai.money - unmortCost >= reserve) {
          ai.money -= unmortCost;
          prop.mortgaged = false;
          sound.cash();
          this.scene3d.updateTileOwnershipAndBuildings(tid, ai.token.color, prop.houses, false);
          this.addLog(`🏦 🤖 ${ai.name} løste inn pantet på ${tile.name}.`);
          this.updateHUD();
          await new Promise(r => setTimeout(r, 850));
        }
      }
    }

    // 2. Build houses / hotels where permitted by the active House Rule!
    let builtCount = 0;
    const maxBuildsPerTurn = ai.aiLevel === 'easy' ? 1 : (ai.aiLevel === 'medium' ? 2 : 4);

    while (builtCount < maxBuildsPerTurn) {
      const buildableTiles = BOARD_TILES.filter(t => this.canBuildOnTile(ai, t).allowed);
      if (buildableTiles.length === 0) break;

      // Sort by highest rent jump
      buildableTiles.sort((a, b) => b.price - a.price);
      const targetTile = buildableTiles[0];

      if (ai.money - targetTile.houseCost < reserve) break;
      if (ai.aiLevel === 'easy' && Math.random() < 0.45) break;

      const prop = this.properties.get(targetTile.id);
      ai.money -= targetTile.houseCost;
      prop.houses++;
      builtCount++;

      sound.build();
      this.scene3d.updateTileOwnershipAndBuildings(targetTile.id, ai.token.color, prop.houses, prop.mortgaged);
      this.scene3d.spawnCelebrationParticles(this.scene3d.tilePositions[targetTile.id], '#10b981');
      this.addLog(`🏗️ 🤖 ${ai.name} bygget på ${targetTile.name} (${prop.houses === 5 ? 'HOTELL!' : prop.houses + ' hus'})!`);
      this.updateHUD();
      await new Promise(r => setTimeout(r, 950));
    }
  }

  updateDockButtons() {
    const p = this.getActivePlayer();
    const isAI = p?.isAI;

    const btnRoll = document.getElementById('btn-roll');
    const btnBuy = document.getElementById('btn-buy-inline');
    const btnAuc = document.getElementById('btn-auction-inline');
    const btnSkipBuy = document.getElementById('btn-skip-buy-inline');
    const btnJailPay = document.getElementById('btn-jail-pay');
    const btnJailCard = document.getElementById('btn-jail-card');
    const btnEnd = document.getElementById('btn-end-turn');

    document.getElementById('ap-turn-tag').textContent = isAI
      ? `🤖 ${p.aiBadge.toUpperCase()} TENKER...`
      : 'DIN TUR NÅ';

    if (isAI) {
      // Hide manual buttons during AI turn
      btnRoll.classList.add('hidden');
      btnBuy.classList.add('hidden');
      btnAuc.classList.add('hidden');
      btnSkipBuy.classList.add('hidden');
      btnJailPay.classList.add('hidden');
      btnJailCard.classList.add('hidden');
      btnEnd.classList.add('hidden');
      return;
    }

    btnRoll.classList.toggle('hidden', !this.canRoll);

    const canBuyPending = this.pendingBuyTileId !== null;
    if (canBuyPending) {
      const tile = BOARD_TILES[this.pendingBuyTileId];
      const canAfford = p.money >= tile.price;
      btnBuy.disabled = false;
      btnBuy.textContent = canAfford
        ? `💰 KJØP (${tile.shortName} – kr ${tile.price})`
        : `💰 KJØP (Mangler kr ${tile.price - p.money} – Pantsett først)`;
    }
    btnBuy.classList.toggle('hidden', !canBuyPending);
    btnAuc.classList.toggle('hidden', !(canBuyPending && this.auctionRule === 'on'));
    btnSkipBuy.classList.toggle('hidden', !(canBuyPending && this.auctionRule === 'off'));

    btnJailPay.classList.toggle('hidden', !(p.inJail && this.canRoll && p.money >= 500));
    btnJailCard.classList.toggle('hidden', !(p.inJail && this.canRoll && p.jailFreeCards > 0));

    // Must resolve pending buy/auction before ending turn if auction rule is on
    const blockEndForAuction = canBuyPending && this.auctionRule === 'on';
    btnEnd.classList.toggle('hidden', this.canRoll || blockEndForAuction);
  }

  async handleRollDice() {
    if (!this.canRoll) return;
    this.canRoll = false;
    this.pendingBuyTileId = null;
    this.updateDockButtons();

    const p = this.getActivePlayer();
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;
    const isDoubles = d1 === d2;
    this.lastDiceSum = sum;

    sound.diceRoll();
    this.scene3d.roll3DDice(d1, d2);

    const die1El = document.getElementById('die-1');
    const die2El = document.getElementById('die-2');
    die1El.classList.add('rolling');
    die2El.classList.add('rolling');

    this.setTurnStatus('Terningene ruller over Gjøvik...', 'Hva blir det?');

    await new Promise(r => setTimeout(r, 750));
    die1El.classList.remove('rolling');
    die2El.classList.remove('rolling');
    die1El.textContent = d1;
    die2El.textContent = d2;

    // Handle Jail logic
    if (p.inJail) {
      if (isDoubles) {
        p.inJail = false;
        p.jailTurns = 0;
        this.addLog(`🔓 ${p.name} kastet par (${d1}+${d2}) og slapp ut av Arresten i Fjellhallen!`);
      } else {
        p.jailTurns++;
        if (p.jailTurns >= 3) {
          this.addLog(`👮 ${p.name} har sonet 3 runder i Fjellhallen, betaler kr 500 og slipper ut.`);
          this.payToPot(p, 500);
          p.inJail = false;
          p.jailTurns = 0;
        } else {
          this.addLog(`⛰️ ${p.name} kastet ${d1}+${d2} (ikke par) og blir sittende i Fjellhallen.`);
          this.setTurnStatus(`Ingen like (${d1} + ${d2})`, 'Du må bli i Fjellhallen en runde til.');
          this.updateHUD();
          this.updateDockButtons();
          return;
        }
      }
    } else {
      if (isDoubles) {
        this.doublesCount++;
        if (this.doublesCount === 3) {
          this.addLog(`🚓 ${p.name} kastet par 3 ganger på rad – tatt for råkjøring og sendt rett i Fjellhallen!`);
          this.sendPlayerToJail(p);
          return;
        }
      }
    }

    // Move Player step-by-step
    await this.movePlayerSteps(p, sum);

    // Allow rolling again if doubles (and not sent to jail)
    if (isDoubles && !p.inJail && !p.bankrupt) {
      this.canRoll = true;
      this.addLog(`🎲 ${p.name} kastet to like (${d1}+${d2}) og får et ekstra kast!`);
    }

    this.updateHUD();
    this.updateDockButtons();
  }

  async movePlayerSteps(player, steps) {
    for (let s = 0; s < steps; s++) {
      player.position = (player.position + 1) % 40;
      sound.step();
      await this.scene3d.animatePlayerStep(player.id, player.position, player.id, this.players.length);

      // Passed or landed on START (Jernbanetorget)
      if (player.position === 0) {
        const isExactLanding = (s === steps - 1);
        const salary = (isExactLanding && this.goRule === 'double') ? 4000 : 2000;
        player.money += salary;
        sound.cash();
        this.scene3d.spawnCelebrationParticles(this.scene3d.tilePositions[0], '#10b981');
        this.addLog(`🚉 ${player.name} ${isExactLanding ? 'landet nøyaktig på' : 'passerte'} Jernbanetorget (START) og mottok kr ${salary}!`);
        this.updateHUD();
      }
    }

    const landedTile = BOARD_TILES[player.position];
    this.inspectTile(landedTile.id);
    await this.resolveLandedTile(player, landedTile);
  }

  async resolveLandedTile(player, tile = BOARD_TILES[player.position]) {
    if (!tile) tile = BOARD_TILES[player.position];
    this.setTurnStatus(`${player.name} landet på ${tile.name}`, tile.flavor);

    if (['street', 'station', 'utility'].includes(tile.type)) {
      const prop = this.properties.get(tile.id);

      if (prop.ownerId === null) {
        this.pendingBuyTileId = tile.id;
        this.setTurnStatus(
          `${tile.name} er til salgs for kr ${tile.price}!`,
          player.isAI
            ? `🤖 ${player.name} vurderer om tomta er verdt pengene...`
            : 'Vil du kjøpe skjøtet eller legge det ut på byauksjon?'
        );
      } else if (prop.ownerId === player.id) {
        this.setTurnStatus(
          `Du eier selv ${tile.name}`,
          'Her kan du nyte utsikten uten å betale ei krone.'
        );
      } else if (prop.mortgaged) {
        const owner = this.players[prop.ownerId];
        this.setTurnStatus(
          `${tile.name} er pantsatt av ${owner.name}`,
          'Ingen husleie kreves inn mens eiendommen er pantsatt!'
        );
      } else {
        // Owned by another player -> Pay Rent!
        const owner = this.players[prop.ownerId];
        const rent = this.calculateRent(tile.id, this.lastDiceSum);
        sound.payRent();
        this.transferMoney(player, owner, rent);
        this.addLog(`💸 ${player.name} betalte kr ${rent} i leie til ${owner.name} for ${tile.name}.`);
        this.setTurnStatus(
          `Betalte kr ${rent} i leie til ${owner.name}!`,
          `${owner.name} gnir seg i hendene på ${tile.name}.`
        );
      }
    } else if (tile.type === 'tax') {
      sound.payRent();
      this.payToPot(player, tile.amount);
      this.addLog(`🏛️ ${player.name} betalte kr ${tile.amount} i ${tile.name}.`);
      await this.showEventModalAsync('🏛️ SKATT TIL GJØVIK KOMMUNE', '💸', tile.name, tile.flavor, player.isAI, tile.photo);
    } else if (tile.type === 'parking') {
      if (this.potRule === 'pot' && this.fastlandPot > 0) {
        const won = this.fastlandPot;
        player.money += won;
        this.fastlandPot = 500;
        sound.fanfare();
        this.scene3d.spawnCelebrationParticles(this.scene3d.tilePositions[20], '#fbbf24');
        this.addLog(`🏊‍♂️ ${player.name} landet på Fastland Friluftsbad og vant hele potten på kr ${won}!`);
        await this.showEventModalAsync(
          '🏊‍♂️ JACKPOT VED STUPETÅRNET PÅ FASTLAND!',
          '🏆',
          `${player.name} vant kr ${won.toLocaleString('no-NO')}!`,
          'Etter et svalestup fra 10-meteren på Fastland dukket hele byens skatte- og bøtepott opp!',
          player.isAI,
          tile.photo
        );
      }
    } else if (tile.type === 'gotojail') {
      sound.jailSiren();
      await this.showEventModalAsync(
        '🚓 LASERKONTROLL VED HUNTONSTRANDA!',
        '⛰️',
        'Rett i Arresten i Fjellhallen!',
        tile.flavor,
        player.isAI,
        tile.photo
      );
      this.sendPlayerToJail(player);
    } else if (tile.type === 'chance') {
      const card = this.drawCardFromDeck('chance');
      await this.showEventModalAsync('📰 BYAVISA MELDER', card.icon, card.title, card.desc, player.isAI, card.photo || tile.photo);
      await this.executeCardAction(player, card);
    } else if (tile.type === 'chest') {
      const card = this.drawCardFromDeck('chest');
      await this.showEventModalAsync('🎁 MJØSGLØTT', card.icon, card.title, card.desc, player.isAI, card.photo || tile.photo);
      await this.executeCardAction(player, card);
    }

    this.updateHUD();
    this.updateDockButtons();
  }

  async executeCardAction(player, card) {
    if (card.action === 'gain_cash') {
      player.money += card.amount;
      sound.cash();
      this.addLog(`🎁 ${player.name} mottok kr ${card.amount}: ${card.title}`);
    } else if (card.action === 'pay_pot') {
      sound.payRent();
      this.payToPot(player, card.amount);
      this.addLog(`💸 ${player.name} betalte kr ${card.amount}.`);
    } else if (card.action === 'collect_from_all') {
      let total = 0;
      this.players.forEach(other => {
        if (other.id !== player.id && !other.bankrupt) {
          this.transferMoney(other, player, card.amount);
          total += card.amount;
        }
      });
      sound.cash();
      this.addLog(`🎸 ${player.name} samlet inn kr ${total} fra medspillerne!`);
    } else if (card.action === 'pay_each_player') {
      let total = 0;
      this.players.forEach(other => {
        if (other.id !== player.id && !other.bankrupt) {
          this.transferMoney(player, other, card.amount);
          total += card.amount;
        }
      });
      sound.payRent();
      this.addLog(`💸 ${player.name} spanderte totalt kr ${total} på medspillerne!`);
    } else if (card.action === 'street_repairs') {
      let cost = 0;
      this.properties.forEach((prop) => {
        if (prop.ownerId === player.id) {
          if (prop.houses >= 1 && prop.houses <= 4) cost += prop.houses * card.house;
          if (prop.houses === 5) cost += card.hotel;
        }
      });
      if (cost > 0) {
        this.payToPot(player, cost);
        this.addLog(`❄️ ${player.name} betalte kr ${cost} i snøbrøyting og vedlikehold.`);
      } else {
        this.addLog(`❄️ ${player.name} slapp billig unna snøbrøytinga (ingen hus/hotell).`);
      }
    } else if (card.action === 'jail_free') {
      player.jailFreeCards++;
      sound.cash();
      this.addLog(`🎟️ ${player.name} fikk et Frikort fra Arresten!`);
    } else if (card.action === 'goto_jail') {
      this.sendPlayerToJail(player);
    } else if (card.action === 'move_to') {
      const steps = (card.target - player.position + 40) % 40;
      await this.movePlayerSteps(player, steps);
    } else if (card.action === 'move_back') {
      this.isAnimatingMove = true;
      for (let i = 0; i < (card.steps || 3); i++) {
        player.position = (player.position - 1 + 40) % 40;
        sound.step();
        await this.scene3d.animatePlayerStep(player.id, player.position, player.id, this.players.length);
      }
      this.isAnimatingMove = false;
      const newTile = BOARD_TILES[player.position];
      this.scene3d.focusOnTile(player.position);
      this.inspectTile(player.position);
      await this.resolveLandedTile(player, newTile);
    }

    this.updateHUD();
    this.updateDockButtons();
  }

  sendPlayerToJail(player) {
    sound.jailSiren();
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    this.canRoll = false;
    this.pendingBuyTileId = null;

    this.scene3d.animatePlayerStep(player.id, 10, player.id, this.players.length);
    this.addLog(`⛰️ ${player.name} ble låst inn i Arresten i Fjellhallen!`);
    this.updateHUD();
    this.updateDockButtons();
  }

  handlePayJailFine() {
    const p = this.getActivePlayer();
    if (!p.inJail || p.money < 500) return;
    sound.cash();
    this.payToPot(p, 500);
    p.inJail = false;
    p.jailTurns = 0;
    this.addLog(`🔓 ${p.name} betalte kr 500 og slapp ut av Fjellhallen.`);
    this.setTurnStatus(`${p.name} er fri fra Fjellhallen!`, 'Kast terningene for å gå videre.');
    this.updateHUD();
    this.updateDockButtons();
  }

  handleUseJailCard() {
    const p = this.getActivePlayer();
    if (!p.inJail || p.jailFreeCards <= 0) return;
    sound.cash();
    p.jailFreeCards--;
    p.inJail = false;
    p.jailTurns = 0;
    this.addLog(`🎟️ ${p.name} brukte Frikort og slapp ut av Fjellhallen!`);
    this.updateHUD();
    this.updateDockButtons();
  }

  // ==================== BUYING, RENT & AUCTIONS (WITH AI BIDDERS!) ====================
  handleBuyCurrentTile(buyWithDirectMortgage = false) {
    if (this.pendingBuyTileId === null) return;
    const p = this.getActivePlayer();
    const tile = BOARD_TILES[this.pendingBuyTileId];
    const mortgageVal = Math.floor(tile.price / 2);
    const netCostWithMortgage = tile.price - mortgageVal;

    if (!buyWithDirectMortgage && p.money < tile.price) {
      // Open Property Manager so player can mortgage existing properties or buy with direct mortgage
      sound.click();
      this.setTurnStatus(
        `Du mangler kr ${tile.price - p.money} for å kjøpe ${tile.name} kontant`,
        'Pantsett en tomt i listen under (eller kjøp med direkte pant)!'
      );
      this.openPropertyManager();
      return;
    }

    if (buyWithDirectMortgage) {
      if (p.money < netCostWithMortgage) return;
      p.money -= netCostWithMortgage;
      const prop = this.properties.get(tile.id);
      prop.ownerId = p.id;
      prop.mortgaged = true;
      this.pendingBuyTileId = null;

      sound.cash();
      this.scene3d.updateTileOwnershipAndBuildings(tile.id, p.token.color, 0, true);
      this.addLog(`🏦 ${p.name} kjøpte ${tile.name} med direkte pant for kr ${netCostWithMortgage} (PANTSATT).`);
      this.setTurnStatus(`Kjøpte ${tile.name} (Pantsatt)!`, 'Du kan løse inn pantet senere når du har god råd.');
    } else {
      p.money -= tile.price;
      const prop = this.properties.get(tile.id);
      prop.ownerId = p.id;
      prop.mortgaged = false;
      this.pendingBuyTileId = null;

      sound.cash();
      this.scene3d.updateTileOwnershipAndBuildings(tile.id, p.token.color, 0, false);
      this.scene3d.spawnCelebrationParticles(this.scene3d.tilePositions[tile.id], p.token.color);
      this.addLog(`🏠 ${p.name} kjøpte ${tile.name} for kr ${tile.price}!`);
      this.setTurnStatus(`Kjøpte ${tile.name}!`, 'Eier du hele fargeserien kan du bygge hus og hotell.');
    }

    this.inspectTile(tile.id);
    this.updateHUD();
    this.updateDockButtons();
  }

  openAuctionModal(tileId) {
    return new Promise(resolve => {
      sound.click();
      const tile = BOARD_TILES[tileId];
      const modal = document.getElementById('auction-modal');
      document.getElementById('auc-prop-name').textContent = tile.name;
      document.getElementById('auc-prop-info').textContent = `Ordinær pris: kr ${tile.price}`;
      const aiStatusEl = document.getElementById('auc-ai-status');
      aiStatusEl.textContent = '';

      let highBid = Math.max(100, Math.floor(tile.price * 0.25));
      let highBidder = null;

      // Precompute AI max bids for this auction
      const aiMaxBids = new Map();
      this.players.filter(p => p.isAI && !p.bankrupt).forEach(ai => {
        aiMaxBids.set(ai.id, this.getAIMaxAuctionBid(ai, tile));
      });

      const updateAuctionUI = () => {
        document.getElementById('auc-high-bid').textContent = `kr ${highBid}`;
        document.getElementById('auc-high-bidder').textContent = highBidder
          ? `Ledes av: ${highBidder.token.icon} ${highBidder.name}`
          : 'Ingen har lagt inn bud ennå!';
      };

      // Trigger AI counter-bids automatically!
      const triggerAIBidding = () => {
        setTimeout(() => {
          if (modal.classList.contains('hidden')) return;
          const nextStepBid = highBidder ? highBid + 100 : highBid;
          const willingAIs = this.players.filter(
            p => p.isAI && !p.bankrupt && p.id !== highBidder?.id && (aiMaxBids.get(p.id) || 0) >= nextStepBid && p.money >= nextStepBid
          );

          if (willingAIs.length > 0) {
            const bidder = willingAIs[Math.floor(Math.random() * willingAIs.length)];
            highBid = nextStepBid;
            highBidder = bidder;
            sound.click();
            aiStatusEl.textContent = `🤖 ${bidder.name} byr kr ${highBid}!`;
            updateAuctionUI();
            triggerAIBidding(); // Let other AIs respond if multiple AIs want it!
          } else {
            aiStatusEl.textContent = highBidder?.isAI
              ? `🤖 ${highBidder.name} har høyeste bud. By over eller avslutt auksjonen!`
              : '🤖 Robotene trekker seg fra videre budrunde.';
          }
        }, 1100);
      };

      const grid = document.getElementById('auc-bidders-grid');
      grid.innerHTML = '';

      // Show manual bid buttons for Human players, and status card for AI players
      this.players.filter(p => !p.bankrupt).forEach(p => {
        const card = document.createElement('div');
        card.className = 'auc-bidder-card';
        if (p.isAI) {
          card.innerHTML = `
            <div style="font-weight:800">${p.token.icon} ${p.name}</div>
            <div style="font-size:0.75rem; color:#c084fc">${p.aiBadge} (Byr automatisk)</div>
            <div style="font-size:0.78rem; color:#34d399">Saldo: kr ${p.money}</div>
          `;
        } else {
          card.innerHTML = `
            <div style="font-weight:800">${p.token.icon} ${p.name}</div>
            <div style="font-size:0.78rem; color:#34d399">Saldo: kr ${p.money}</div>
            <div class="auc-bid-btns">
              <button data-inc="100">+100</button>
              <button data-inc="500">+500</button>
            </div>
          `;
          card.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
              const inc = Number(btn.dataset.inc);
              const nextBid = highBidder ? highBid + inc : highBid;
              if (p.money >= nextBid) {
                sound.click();
                highBid = nextBid;
                highBidder = p;
                aiStatusEl.textContent = `👤 ${p.name} bød kr ${highBid}!`;
                updateAuctionUI();
                triggerAIBidding();
              }
            });
          });
        }
        grid.appendChild(card);
      });

      updateAuctionUI();
      modal.classList.remove('hidden');
      triggerAIBidding();

      const finishBtn = document.getElementById('btn-auc-finish');
      finishBtn.onclick = () => {
        modal.classList.add('hidden');
        this.pendingBuyTileId = null;

        if (highBidder) {
          highBidder.money -= highBid;
          const prop = this.properties.get(tileId);
          prop.ownerId = highBidder.id;
          sound.cash();
          this.scene3d.updateTileOwnershipAndBuildings(tileId, highBidder.token.color, 0, false);
          this.scene3d.spawnCelebrationParticles(this.scene3d.tilePositions[tileId], highBidder.token.color);
          this.addLog(`🔨 ${highBidder.name} vant auksjonen på ${tile.name} for kr ${highBid}!`);
        } else {
          this.addLog(`🔨 Ingen bød på ${tile.name} – kommunen beholder tomta.`);
        }

        this.inspectTile(tileId);
        this.updateHUD();
        this.updateDockButtons();
        resolve();
      };
    });
  }

  ownsFullGroup(playerId, groupKey) {
    const groupTiles = BOARD_TILES.filter(t => t.group === groupKey && t.type === 'street');
    if (groupTiles.length === 0) return false;
    return groupTiles.every(t => {
      const p = this.properties.get(t.id);
      return p && p.ownerId === playerId && !p.mortgaged;
    });
  }

  calculateRent(tileId, diceSum = 7) {
    const tile = BOARD_TILES[tileId];
    const prop = this.properties.get(tileId);
    if (!prop || prop.ownerId === null || prop.mortgaged) return 0;

    if (tile.type === 'street') {
      if (prop.houses > 0) {
        return tile.rents[prop.houses];
      }
      const base = tile.rents[0];
      return this.ownsFullGroup(prop.ownerId, tile.group) ? base * 2 : base;
    }

    if (tile.type === 'station') {
      const ownedStations = BOARD_TILES.filter(
        t => t.type === 'station' && this.properties.get(t.id)?.ownerId === prop.ownerId
      ).length;
      return tile.rents[Math.max(0, ownedStations - 1)] || 250;
    }

    if (tile.type === 'utility') {
      const ownedUtils = BOARD_TILES.filter(
        t => t.type === 'utility' && this.properties.get(t.id)?.ownerId === prop.ownerId
      ).length;
      return ownedUtils >= 2 ? diceSum * 60 : diceSum * 25;
    }

    return 0;
  }

  // ==================== PROPERTY MANAGER (HOUSE RULES ENFORCED!) ====================
  canBuildOnTile(player, tile) {
    if (tile.type !== 'street') return { allowed: false, reason: 'Kun vanlige gater kan bebygges' };
    const prop = this.properties.get(tile.id);
    if (!prop || prop.ownerId !== player.id) return { allowed: false, reason: 'Du eier ikke gata' };
    if (prop.mortgaged) return { allowed: false, reason: 'Gata er pantsatt' };
    if (prop.houses >= 5) return { allowed: false, reason: 'Har allerede hotell!' };

    // Check full color group ownership unless 'gjovik' rule is active
    if (this.buildRule === 'classic' || this.buildRule === 'classic_free') {
      if (!this.ownsFullGroup(player.id, tile.group)) {
        return { allowed: false, reason: 'Krever at du eier alle gatene i fargeserien (uten pant)' };
      }
    }

    // Check even building rule in strict 'classic' mode
    if (this.buildRule === 'classic') {
      const groupTiles = BOARD_TILES.filter(t => t.group === tile.group && t.type === 'street');
      const minHousesInGroup = Math.min(...groupTiles.map(t => this.properties.get(t.id)?.houses || 0));
      if (prop.houses > minHousesInGroup) {
        return { allowed: false, reason: 'Må bygge jevnt i fargeserien først!' };
      }
    }

    if (player.money < tile.houseCost) {
      return { allowed: false, reason: `Mangler penger (kr ${tile.houseCost})` };
    }

    return { allowed: true, reason: 'Klar for utbygging!' };
  }

  openPropertyManager() {
    const p = this.getActivePlayer();
    const modal = document.getElementById('props-modal');
    const banner = document.getElementById('pm-rule-banner');
    const sub = document.getElementById('pm-sub');
    const grid = document.getElementById('pm-grid');
    grid.innerHTML = '';

    sub.textContent = `Aktiv spiller: ${p.token.icon} ${p.name} • Kontanter: kr ${p.money.toLocaleString('no-NO')}`;

    let ruleNote = '';
    if (this.buildRule === 'classic') {
      ruleNote = '🎩 Klassisk Monopol: Du må eie hele fargeserien (uten pant) for å bygge hus, og bygge jevnt.';
    } else if (this.buildRule === 'classic_free') {
      ruleNote = '🏗️ Halvklassisk: Du må eie hele fargeserien for å bygge hus, men kan bygge fritt i serien.';
    } else {
      ruleNote = '🏡 Snille Gjøvik-regler: Du kan bygge hus på enkeltgater uten å eie hele fargeserien.';
    }

    // If player is currently standing on an unowned property they want to buy, show quick-buy bar right here!
    if (this.pendingBuyTileId !== null && !p.isAI) {
      const pendingTile = BOARD_TILES[this.pendingBuyTileId];
      const canAffordFull = p.money >= pendingTile.price;
      const netMortCost = pendingTile.price - Math.floor(pendingTile.price / 2);
      const canAffordMort = p.money >= netMortCost;

      banner.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div>
            <strong>📍 Du står på ledige ${pendingTile.name} (kr ${pendingTile.price})</strong><br/>
            <span style="font-size:0.78rem; color:#cbd5e1">${ruleNote}</span>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button id="pm-quick-buy-full" style="padding:8px 14px; border-radius:9px; border:none; font-weight:800; cursor:pointer; background:${canAffordFull ? '#10b981' : '#334155'}; color:#fff" ${canAffordFull ? '' : 'disabled'}>
              💰 Kjøp ${pendingTile.shortName} (kr ${pendingTile.price})
            </button>
            <button id="pm-quick-buy-mort" style="padding:8px 14px; border-radius:9px; border:none; font-weight:800; cursor:pointer; background:${canAffordMort ? '#f59e0b' : '#334155'}; color:#0f172a" ${canAffordMort ? '' : 'disabled'} title="Kjøp tomta og pantsett den umiddelbart slik at du kun betaler halve prisen nå">
              🏦 Kjøp med direkte pant (kr ${netMortCost})
            </button>
          </div>
        </div>
      `;

      const qFull = banner.querySelector('#pm-quick-buy-full');
      if (qFull) {
        qFull.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.handleBuyCurrentTile(false);
        });
      }
      const qMort = banner.querySelector('#pm-quick-buy-mort');
      if (qMort) {
        qMort.addEventListener('click', () => {
          modal.classList.add('hidden');
          this.handleBuyCurrentTile(true);
        });
      }
    } else {
      banner.textContent = ruleNote;
    }

    const ownedTiles = BOARD_TILES.filter(t => this.properties.get(t.id)?.ownerId === p.id);

    if (ownedTiles.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1; color:#94a3b8; text-align:center; padding:24px;">
        Du eier ingen andre eiendommer i Gjøvik ennå!
      </p>`;
    }

    ownedTiles.forEach(tile => {
      const prop = this.properties.get(tile.id);
      const groupColor = GROUP_COLORS[tile.group]?.hex || '#475569';
      const item = document.createElement('div');
      item.className = 'pm-item';

      const levelLabel = prop.mortgaged
        ? '⚠️ PANTSATT'
        : prop.houses === 5
          ? '🏨 1 Hotell'
          : prop.houses > 0
            ? `🏠 ${prop.houses} hus`
            : 'Ubebygd tomt';

      const buildCheck = this.canBuildOnTile(p, tile);
      const canBuild = buildCheck.allowed;
      const canSellHouse = tile.type === 'street' && prop.houses > 0;
      const mortgageVal = Math.floor(tile.price / 2);
      const unmortgageCost = Math.floor(mortgageVal * 1.1);
      const canToggleMort = prop.mortgaged ? (p.money >= unmortgageCost) : (prop.houses === 0);

      item.innerHTML = `
        <div class="pm-color-bar" style="background:${groupColor}"></div>
        <div class="pm-content">
          ${tile.photo ? `<img class="pm-photo-thumb" src="${tile.photo}" alt="${tile.name}" title="Klikk for stort bilde av ${tile.name}" loading="lazy" />` : ''}
          <div style="font-weight:800; font-size:0.95rem;">${tile.name}</div>
          <div style="font-size:0.78rem; color:#cbd5e1">${levelLabel}</div>
          ${tile.houseCost ? `<div style="font-size:0.74rem; color:#94a3b8">Byggepris: kr ${tile.houseCost}</div>` : ''}
          ${tile.type === 'street' ? `<div style="font-size:0.72rem; color:${canBuild ? '#34d399' : '#fbbf24'}">${buildCheck.reason}</div>` : ''}
          <div class="pm-btns">
            ${tile.type === 'street' ? `
              <button class="btn-build" style="background:${canBuild ? '#10b981' : '#334155'}; color:#fff" ${canBuild ? '' : 'disabled'}>
                + Bygg
              </button>
              <button class="btn-sell-h" style="background:${canSellHouse ? '#f59e0b' : '#334155'}; color:#fff" ${canSellHouse ? '' : 'disabled'}>
                − Selg hus
              </button>
            ` : ''}
            <button class="btn-mort" style="background:${prop.mortgaged ? '#0284c7' : '#475569'}; color:#fff" ${canToggleMort ? '' : 'disabled'}>
              ${prop.mortgaged ? `Løs inn (kr ${unmortgageCost})` : `Pantsett (+kr ${mortgageVal})`}
            </button>
          </div>
        </div>
      `;

      item.querySelector('.pm-photo-thumb')?.addEventListener('click', () => {
        sound.click();
        this.openPhotoLightbox(tile);
      });

      const buildBtn = item.querySelector('.btn-build');
      if (buildBtn) {
        buildBtn.addEventListener('click', () => {
          this.buildHouseOnTile(p, tile.id);
          this.openPropertyManager();
        });
      }

      const sellBtn = item.querySelector('.btn-sell-h');
      if (sellBtn) {
        sellBtn.addEventListener('click', () => {
          this.sellHouseOnTile(p, tile.id);
          this.openPropertyManager();
        });
      }

      item.querySelector('.btn-mort').addEventListener('click', () => {
        this.toggleMortgageOnTile(p, tile.id);
        this.openPropertyManager();
      });

      grid.appendChild(item);
    });

    modal.classList.remove('hidden');
  }

  buildHouseOnTile(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const prop = this.properties.get(tileId);
    if (!this.canBuildOnTile(player, tile).allowed) return false;

    player.money -= tile.houseCost;
    prop.houses++;
    sound.build();
    this.scene3d.updateTileOwnershipAndBuildings(tile.id, player.token.color, prop.houses, prop.mortgaged);
    this.scene3d.spawnCelebrationParticles(this.scene3d.tilePositions[tile.id], '#10b981');
    this.addLog(`🏗️ ${player.name} bygget på ${tile.name} (${prop.houses === 5 ? 'HOTELL!' : prop.houses + ' hus'})!`);
    this.updateHUD();
    this.updateDockButtons();
    if (this.inspectedTileId !== undefined) this.inspectTile(this.inspectedTileId);
    return true;
  }

  sellHouseOnTile(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const prop = this.properties.get(tileId);
    if (!prop || prop.ownerId !== player.id || prop.houses <= 0) return false;

    prop.houses--;
    player.money += Math.floor(tile.houseCost / 2);
    sound.cash();
    this.scene3d.updateTileOwnershipAndBuildings(tile.id, player.token.color, prop.houses, prop.mortgaged);
    this.addLog(`🏚️ ${player.name} solgte et hus på ${tile.name} for kr ${Math.floor(tile.houseCost / 2)}.`);
    this.updateHUD();
    this.updateDockButtons();
    if (this.inspectedTileId !== undefined) this.inspectTile(this.inspectedTileId);
    return true;
  }

  toggleMortgageOnTile(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const prop = this.properties.get(tileId);
    if (!prop || prop.ownerId !== player.id) return false;

    const mortgageVal = Math.floor(tile.price / 2);
    const unmortgageCost = Math.floor(mortgageVal * 1.1);

    if (!prop.mortgaged) {
      if (prop.houses > 0) return false;
      prop.mortgaged = true;
      player.money += mortgageVal;
      sound.cash();
      this.addLog(`🏦 ${player.name} pantsatte ${tile.name} og fikk kr ${mortgageVal}.`);
    } else {
      if (player.money < unmortgageCost) return false;
      player.money -= unmortgageCost;
      prop.mortgaged = false;
      sound.cash();
      this.addLog(`🏦 ${player.name} løste inn pantet på ${tile.name} for kr ${unmortgageCost}.`);
    }

    this.scene3d.updateTileOwnershipAndBuildings(tile.id, player.token.color, prop.houses, prop.mortgaged);
    this.updateHUD();
    this.updateDockButtons();
    if (this.inspectedTileId !== undefined) this.inspectTile(this.inspectedTileId);
    return true;
  }

  // ==================== TRADING (HUMAN-TO-HUMAN & HUMAN-TO-AI!) ====================
  openTradeModal() {
    const p1 = this.getActivePlayer();
    const others = this.players.filter(p => p.id !== p1.id && !p.bankrupt);
    if (others.length === 0) return;

    const modal = document.getElementById('trade-modal');
    const feedback = document.getElementById('trade-feedback');
    feedback.classList.add('hidden');

    document.getElementById('trade-p1-name').textContent = `${p1.token.icon} ${p1.name} tilbyr:`;
    document.getElementById('trade-p1-cash').value = 0;
    document.getElementById('trade-p2-cash').value = 0;

    const targetSelect = document.getElementById('trade-target-select');
    targetSelect.innerHTML = others.map(o => `
      <option value="${o.id}">${o.token.icon} ${o.name} ${o.isAI ? `(${o.aiBadge})` : ''}</option>
    `).join('');

    const renderCheckboxes = (playerId, containerId) => {
      const container = document.getElementById(containerId);
      const props = BOARD_TILES.filter(t => {
        const pr = this.properties.get(t.id);
        return pr && pr.ownerId === playerId && pr.houses === 0;
      });
      if (props.length === 0) {
        container.innerHTML = '<span style="font-size:0.78rem; color:#94a3b8">Ingen ubebygde skjøter</span>';
        return;
      }
      container.innerHTML = props.map(t => `
        <label class="trade-prop-check">
          <input type="checkbox" value="${t.id}" />
          <span>${t.name} (kr ${t.price})</span>
        </label>
      `).join('');
    };

    renderCheckboxes(p1.id, 'trade-p1-props');
    renderCheckboxes(others[0].id, 'trade-p2-props');

    targetSelect.onchange = () => {
      feedback.classList.add('hidden');
      renderCheckboxes(Number(targetSelect.value), 'trade-p2-props');
    };

    modal.classList.remove('hidden');
  }

  executeTrade() {
    const p1 = this.getActivePlayer();
    const p2Id = Number(document.getElementById('trade-target-select').value);
    const p2 = this.players[p2Id];
    if (!p2) return;

    const cash1 = Math.max(0, Number(document.getElementById('trade-p1-cash').value) || 0);
    const cash2 = Math.max(0, Number(document.getElementById('trade-p2-cash').value) || 0);
    const feedback = document.getElementById('trade-feedback');

    if (p1.money < cash1 || p2.money < cash2) {
      feedback.textContent = '⚠️ En av partene har ikke nok kontanter til denne handelen!';
      feedback.classList.remove('hidden');
      return;
    }

    const props1 = Array.from(document.querySelectorAll('#trade-p1-props input:checked')).map(el => Number(el.value));
    const props2 = Array.from(document.querySelectorAll('#trade-p2-props input:checked')).map(el => Number(el.value));

    if (cash1 === 0 && cash2 === 0 && props1.length === 0 && props2.length === 0) return;

    // If trading with an AI Robot, evaluate whether the AI accepts the offer!
    if (p2.isAI) {
      const val1 = cash1 + props1.reduce((acc, tid) => acc + BOARD_TILES[tid].price * 1.1, 0);
      const val2 = cash2 + props2.reduce((acc, tid) => acc + BOARD_TILES[tid].price * 1.1, 0);
      const requiredRatio = p2.aiLevel === 'easy' ? 0.85 : (p2.aiLevel === 'medium' ? 1.05 : 1.3);

      if (val1 < val2 * requiredRatio) {
        sound.payRent();
        feedback.textContent = `🤖 ${p2.name} avslår handelen: «Tror du jeg er født bak Fjellhallen? Du må by mer (minst kr ${Math.ceil(val2 * requiredRatio - val1 + 100)} ekstra)!»`;
        feedback.classList.remove('hidden');
        return;
      }
    }

    p1.money = p1.money - cash1 + cash2;
    p2.money = p2.money - cash2 + cash1;

    props1.forEach(tid => {
      const pr = this.properties.get(tid);
      pr.ownerId = p2.id;
      this.scene3d.updateTileOwnershipAndBuildings(tid, p2.token.color, pr.houses, pr.mortgaged);
    });

    props2.forEach(tid => {
      const pr = this.properties.get(tid);
      pr.ownerId = p1.id;
      this.scene3d.updateTileOwnershipAndBuildings(tid, p1.token.color, pr.houses, pr.mortgaged);
    });

    sound.cash();
    document.getElementById('trade-modal').classList.add('hidden');
    this.addLog(`🤝 ${p1.name} og ${p2.name} gjennomførte en hestehandel!`);
    this.updateHUD();
    this.updateDockButtons();
    if (this.inspectedTileId !== undefined) this.inspectTile(this.inspectedTileId);
  }

  // ==================== MONEY & BANKRUPTCY ====================
  payToPot(player, amount) {
    if (this.potRule === 'pot') {
      this.fastlandPot += amount;
    }
    player.money -= amount;
    this.checkBankruptcy(player, null);
  }

  transferMoney(fromPlayer, toPlayer, amount) {
    fromPlayer.money -= amount;
    toPlayer.money += amount;
    this.checkBankruptcy(fromPlayer, toPlayer);
  }

  checkBankruptcy(player, creditor) {
    if (player.money >= 0) return;

    // Automatically sell houses or mortgage properties to stay afloat if possible
    this.properties.forEach((prop, tid) => {
      if (prop.ownerId === player.id && player.money < 0) {
        const tile = BOARD_TILES[tid];
        while (prop.houses > 0 && player.money < 0) {
          prop.houses--;
          player.money += Math.floor((tile.houseCost || 500) / 2);
        }
        if (!prop.mortgaged && player.money < 0) {
          prop.mortgaged = true;
          player.money += Math.floor(tile.price / 2);
        }
        this.scene3d.updateTileOwnershipAndBuildings(tid, player.token.color, prop.houses, prop.mortgaged);
      }
    });

    if (player.money >= 0) {
      this.addLog(`🏦 ${player.name} måtte tvangsselge/pantsette eiendom for å unngå konkurs!`);
      return;
    }

    // Player is bankrupt!
    player.bankrupt = true;
    player.money = 0;
    this.addLog(`💥 ${player.name} er slått KONKURS i Gjøvik!`);

    this.properties.forEach((prop, tid) => {
      if (prop.ownerId === player.id) {
        if (creditor) {
          prop.ownerId = creditor.id;
          this.scene3d.updateTileOwnershipAndBuildings(tid, creditor.token.color, prop.houses, prop.mortgaged);
        } else {
          prop.ownerId = null;
          prop.houses = 0;
          prop.mortgaged = false;
          this.scene3d.updateTileOwnershipAndBuildings(tid, null, 0, false);
        }
      }
    });

    const alive = this.players.filter(p => !p.bankrupt);
    if (alive.length === 1) {
      this.declareWinner(alive[0]);
    }
  }

  declareWinner(winner) {
    sound.fanfare();
    this.scene3d.spawnCelebrationParticles(this.scene3d.tilePositions[winner.position], '#fbbf24');
    const modal = document.getElementById('winner-modal');
    document.getElementById('win-title').textContent = `👑 ${winner.name.toUpperCase()} ER GJØVIKMILLIONÆREN!`;
    document.getElementById('win-desc').textContent = `Med ${winner.token.name} og kr ${winner.money.toLocaleString('no-NO')} på bok eier ${winner.name} hele Gjøvik fra Kallerud til Hovdetoppen!`;
    modal.classList.remove('hidden');
  }

  advanceToNextPlayer() {
    sound.click();
    const total = this.players.length;
    for (let i = 1; i <= total; i++) {
      const nextIdx = (this.currentPlayerIndex + i) % total;
      if (nextIdx < this.currentPlayerIndex) {
        this.round++;
      }
      if (!this.players[nextIdx].bankrupt) {
        this.currentPlayerIndex = nextIdx;
        break;
      }
    }
    this.startPlayerTurn(true);
  }

  // ==================== INSPECTOR & HUD UPDATES ====================
  openPhotoLightbox(tile) {
    if (!tile || !tile.photo) return;
    const modal = document.getElementById('photo-lightbox-modal');
    const groupInfo = GROUP_COLORS[tile.group] || GROUP_COLORS.special;
    document.getElementById('pl-group').textContent = groupInfo.name;
    document.getElementById('pl-title').textContent = tile.name;
    document.getElementById('pl-img').src = tile.photo.replace('?width=720', '?width=1280');
    document.getElementById('pl-img').alt = tile.name;
    document.getElementById('pl-caption').textContent = `📸 ${tile.photoCaption || tile.name}`;
    document.getElementById('pl-flavor').textContent = tile.flavor || '';
    modal.classList.remove('hidden');
  }

  inspectTile(tileId) {
    const tile = BOARD_TILES[tileId];
    if (!tile) return;
    this.inspectedTileId = tileId;

    const groupInfo = GROUP_COLORS[tile.group] || GROUP_COLORS.special;
    const header = document.getElementById('skjote-header');
    header.style.background = groupInfo.hex;

    document.getElementById('skjote-group').textContent = groupInfo.name;
    document.getElementById('skjote-title').textContent = tile.name;
    document.getElementById('skjote-flavor').textContent = tile.flavor;

    // Show real photograph of the street/landmark in Gjøvik
    const photoWrap = document.getElementById('skjote-photo-wrap');
    const photoImg = document.getElementById('skjote-photo');
    const photoCap = document.getElementById('skjote-photo-caption');
    if (photoWrap && photoImg && tile.photo) {
      photoImg.src = tile.photo;
      photoImg.alt = tile.name;
      if (photoCap) {
        photoCap.textContent = `📸 ${tile.photoCaption || tile.name}`;
      }
      photoWrap.classList.remove('hidden');
    } else if (photoWrap) {
      photoWrap.classList.add('hidden');
    }

    const details = document.getElementById('skjote-details');
    const prop = this.properties.get(tile.id);
    const activePlayer = this.getActivePlayer();

    if (tile.type === 'street') {
      details.classList.remove('hidden');
      const owner = prop?.ownerId !== null ? this.players[prop.ownerId] : null;
      const curH = prop?.houses || 0;

      details.innerHTML = `
        <div class="rent-row"><span>Tomtepris:</span><strong>kr ${tile.price}</strong></div>
        <div class="skjote-divider"></div>
        <div class="rent-row ${curH === 0 ? 'current-level' : ''}"><span>Grunnleie (dobbel ved serie):</span><span>kr ${tile.rents[0]}</span></div>
        <div class="rent-row ${curH === 1 ? 'current-level' : ''}"><span>🏠 Med 1 hus:</span><span>kr ${tile.rents[1]}</span></div>
        <div class="rent-row ${curH === 2 ? 'current-level' : ''}"><span>🏠🏠 Med 2 hus:</span><span>kr ${tile.rents[2]}</span></div>
        <div class="rent-row ${curH === 3 ? 'current-level' : ''}"><span>🏠🏠🏠 Med 3 hus:</span><span>kr ${tile.rents[3]}</span></div>
        <div class="rent-row ${curH === 4 ? 'current-level' : ''}"><span>🏠🏠🏠🏠 Med 4 hus:</span><span>kr ${tile.rents[4]}</span></div>
        <div class="rent-row ${curH === 5 ? 'current-level' : ''}"><span>🏨 Med HOTELL:</span><span>kr ${tile.rents[5]}</span></div>
        <div class="skjote-divider"></div>
        <div class="rent-row"><span>Pris per hus / hotell:</span><strong>kr ${tile.houseCost}</strong></div>
        <div class="skjote-owner-badge" style="background:${owner ? owner.token.color + '33' : '#e2e8f0'}">
          ${owner ? `Eies av: ${owner.token.icon} ${owner.name}${prop.mortgaged ? ' (PANTSATT)' : ''}` : '🟢 Ledig tomt – kan kjøpes!'}
        </div>
        <div id="skjote-inline-actions" class="skjote-actions"></div>
      `;
    } else if (tile.type === 'station') {
      details.classList.remove('hidden');
      const owner = prop?.ownerId !== null ? this.players[prop.ownerId] : null;
      details.innerHTML = `
        <div class="rent-row"><span>Pris:</span><strong>kr ${tile.price}</strong></div>
        <div class="skjote-divider"></div>
        <div class="rent-row"><span>Leie med 1 knutepunkt:</span><span>kr 250</span></div>
        <div class="rent-row"><span>Leie med 2 knutepunkt:</span><span>kr 500</span></div>
        <div class="rent-row"><span>Leie med 3 knutepunkt:</span><span>kr 1 000</span></div>
        <div class="rent-row"><span>Leie med 4 knutepunkt:</span><span>kr 2 000</span></div>
        <div class="skjote-owner-badge">
          ${owner ? `Eies av: ${owner.token.icon} ${owner.name}${prop.mortgaged ? ' (PANTSATT)' : ''}` : '🟢 Ledig – kan kjøpes!'}
        </div>
        <div id="skjote-inline-actions" class="skjote-actions"></div>
      `;
    } else if (tile.type === 'utility') {
      details.classList.remove('hidden');
      const owner = prop?.ownerId !== null ? this.players[prop.ownerId] : null;
      details.innerHTML = `
        <div class="rent-row"><span>Pris:</span><strong>kr ${tile.price}</strong></div>
        <div class="skjote-divider"></div>
        <div class="rent-row"><span>1 kommunalt verk:</span><span>25 × terningkast</span></div>
        <div class="rent-row"><span>Begge kommunale verk:</span><span>60 × terningkast</span></div>
        <div class="skjote-owner-badge">
          ${owner ? `Eies av: ${owner.token.icon} ${owner.name}${prop.mortgaged ? ' (PANTSATT)' : ''}` : '🟢 Ledig – kan kjøpes!'}
        </div>
        <div id="skjote-inline-actions" class="skjote-actions"></div>
      `;
    } else {
      details.classList.add('hidden');
      return;
    }

    // Populate direct action buttons inside the Skjøte card if owned by active human player OR if pending buy!
    const actContainer = document.getElementById('skjote-inline-actions');
    if (!actContainer || !activePlayer || activePlayer.isAI) return;

    if (this.pendingBuyTileId === tile.id && prop?.ownerId === null) {
      const canAffordFull = activePlayer.money >= tile.price;
      const netMort = tile.price - Math.floor(tile.price / 2);
      const canAffordMort = activePlayer.money >= netMort;
      actContainer.innerHTML = `
        <button id="skjote-btn-buy" style="background:#10b981; color:#052e16;" ${canAffordFull ? '' : 'disabled'}>
          💰 Kjøp nå (kr ${tile.price})
        </button>
        <button id="skjote-btn-buymort" style="background:#f59e0b; color:#0f172a;" ${canAffordMort ? '' : 'disabled'} title="Kjøp gata og pantsett den samtidig (betal kun halve prisen nå)">
          🏦 Kjøp m/pant (kr ${netMort})
        </button>
      `;
      actContainer.querySelector('#skjote-btn-buy')?.addEventListener('click', () => this.handleBuyCurrentTile(false));
      actContainer.querySelector('#skjote-btn-buymort')?.addEventListener('click', () => this.handleBuyCurrentTile(true));
    } else if (prop && prop.ownerId === activePlayer.id) {
      const buildCheck = this.canBuildOnTile(activePlayer, tile);
      const canBuild = buildCheck.allowed;
      const canSellH = tile.type === 'street' && prop.houses > 0;
      const mortVal = Math.floor(tile.price / 2);
      const unmortCost = Math.floor(mortVal * 1.1);
      const canToggleMort = prop.mortgaged ? (activePlayer.money >= unmortCost) : (prop.houses === 0);

      actContainer.innerHTML = `
        ${tile.type === 'street' ? `
          <button id="skjote-btn-build" style="background:${canBuild ? '#10b981' : '#94a3b8'}; color:#052e16;" ${canBuild ? '' : 'disabled'} title="${buildCheck.reason}">
            + Bygg (kr ${tile.houseCost})
          </button>
          <button id="skjote-btn-sellh" style="background:${canSellH ? '#f59e0b' : '#94a3b8'}; color:#0f172a;" ${canSellH ? '' : 'disabled'}>
            − Selg hus
          </button>
        ` : ''}
        <button id="skjote-btn-mort" style="background:${prop.mortgaged ? '#0284c7' : '#334155'}; color:#fff;" ${canToggleMort ? '' : 'disabled'}>
          ${prop.mortgaged ? `Løs inn (kr ${unmortCost})` : `Pantsett (+kr ${mortVal})`}
        </button>
      `;

      actContainer.querySelector('#skjote-btn-build')?.addEventListener('click', () => this.buildHouseOnTile(activePlayer, tile.id));
      actContainer.querySelector('#skjote-btn-sellh')?.addEventListener('click', () => this.sellHouseOnTile(activePlayer, tile.id));
      actContainer.querySelector('#skjote-btn-mort')?.addEventListener('click', () => this.toggleMortgageOnTile(activePlayer, tile.id));
    }
  }

  getPlayerRankTitle(player) {
    const ownedCount = Array.from(this.properties.values()).filter(pr => pr.ownerId === player.id).length;
    if (ownedCount >= 7) return '👑 Eiendomsbaron i Storgata';
    if (ownedCount >= 4) return '🎩 Storkar på Hovdetoppen';
    if (ownedCount >= 2) return '🏡 Boliginvestor på Tongjordet';
    if (player.money < 2500) return '🍜 Nudel-student på Kallerud';
    return '🚢 Byvandrer ved Mjøsa';
  }

  updateHUD() {
    document.getElementById('pot-amount').textContent = `kr ${this.fastlandPot.toLocaleString('no-NO')}`;
    document.getElementById('round-counter').textContent = `Runde ${this.round}`;

    const pList = document.getElementById('players-list');
    pList.innerHTML = '';

    this.players.forEach((p, idx) => {
      const owned = BOARD_TILES.filter(t => this.properties.get(t.id)?.ownerId === p.id);
      const row = document.createElement('div');
      row.className = `player-row ${idx === this.currentPlayerIndex ? 'active-turn' : ''} ${p.bankrupt ? 'bankrupt' : ''}`;
      row.style.borderLeftColor = p.token.color;

      const dotsHtml = owned.map(t => {
        const c = GROUP_COLORS[t.group]?.hex || '#94a3b8';
        const isMort = this.properties.get(t.id)?.mortgaged;
        return `<span class="p-dot" data-tid="${t.id}" style="background:${c}; opacity:${isMort ? 0.35 : 1}; cursor:pointer;" title="Klikk for å se ${t.name}${isMort ? ' (Pantsatt)' : ''}"></span>`;
      }).join('');

      row.innerHTML = `
        <div class="p-left">
          <div class="p-token-icon">${p.token.icon}</div>
          <div>
            <div class="p-name">
              ${p.name}
              ${p.isAI ? `<span class="ai-badge">${p.aiBadge}</span>` : ''}
              ${p.inJail ? '⛓️' : ''}
            </div>
            <div class="p-loc">${p.bankrupt ? 'Konkurs' : BOARD_TILES[p.position].shortName}</div>
          </div>
        </div>
        <div class="p-right">
          <div class="p-cash">kr ${p.money.toLocaleString('no-NO')}</div>
          <div class="p-dots">${dotsHtml}</div>
        </div>
      `;

      row.querySelectorAll('.p-dot').forEach(dotEl => {
        dotEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const tid = Number(dotEl.dataset.tid);
          sound.click();
          this.scene3d.focusOnTile(tid);
          this.inspectTile(tid);
        });
      });

      row.addEventListener('click', () => {
        sound.click();
        this.scene3d.focusOnTile(p.position);
        this.inspectTile(p.position);
      });

      pList.appendChild(row);
    });

    const active = this.getActivePlayer();
    if (active) {
      const ownedCount = Array.from(this.properties.values()).filter(pr => pr.ownerId === active.id).length;
      const avatar = document.getElementById('ap-avatar');
      avatar.textContent = active.token.icon;
      avatar.style.borderColor = active.token.color;
      document.getElementById('ap-name').textContent = active.name;
      document.getElementById('ap-title').textContent = this.getPlayerRankTitle(active);
      document.getElementById('ap-money').textContent = `kr ${active.money.toLocaleString('no-NO')}`;
      document.getElementById('ap-props-count').textContent = `${ownedCount} skjøter`;
    }

    this.updateDockButtons();
  }

  setTurnStatus(main, sub) {
    document.getElementById('turn-status-text').textContent = main;
    document.getElementById('turn-subtext').textContent = sub || '';
  }

  addLog(msg) {
    const log = document.getElementById('event-log');
    const item = document.createElement('div');
    item.className = 'log-item';
    item.textContent = msg;
    log.prepend(item);
  }

  showEventModalAsync(banner, icon, title, desc, autoCloseForAI = false, photoUrl = null) {
    return new Promise(resolve => {
      const modal = document.getElementById('event-modal');
      document.getElementById('em-banner').textContent = banner;
      document.getElementById('em-icon').textContent = icon;
      document.getElementById('em-title').textContent = title;
      document.getElementById('em-desc').textContent = desc;

      const photoWrap = document.getElementById('em-photo-wrap');
      const photoImg = document.getElementById('em-photo');
      if (photoWrap && photoImg && photoUrl) {
        photoImg.src = photoUrl;
        photoImg.alt = title;
        photoWrap.classList.remove('hidden');
      } else if (photoWrap) {
        photoWrap.classList.add('hidden');
      }

      modal.classList.remove('hidden');

      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        sound.click();
        modal.classList.add('hidden');
        resolve();
      };

      const okBtn = document.getElementById('btn-em-ok');
      okBtn.onclick = close;

      if (autoCloseForAI) {
        setTimeout(close, 4200);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GjovikMonopolyGame();
});
