// ========================================================
// SUPER MARIO BROS - WEB EDITION
// Pure HTML5 Canvas & Web Audio API
// ========================================================

(function () {
  'use strict';

  // --------------------------------------------------------
  // Audio Synthesizer (Zero External Dependencies)
  // --------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted && this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmPlaying = false;
      } else if (!this.muted && !this.bgmPlaying) {
        this.startBGM();
      }
      return this.muted;
    }

    playTone(freq, start, duration, type = 'square', gain = 0.1) {
      if (this.muted || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      amp.gain.setValueAtTime(gain, start);
      amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(amp);
      amp.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    }

    jump() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

      amp.gain.setValueAtTime(0.12, now);
      amp.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(amp);
      amp.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    }

    coin() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.playTone(987.77, now, 0.08, 'square', 0.15); // B5
      this.playTone(1318.51, now + 0.08, 0.28, 'square', 0.15); // E6
    }

    stomp() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

      amp.gain.setValueAtTime(0.2, now);
      amp.gain.linearRampToValueAtTime(0.01, now + 0.12);

      osc.connect(amp);
      amp.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    }

    bump() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.playTone(110, now, 0.08, 'triangle', 0.2);
    }

    powerup() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [330, 392, 659, 523, 587, 784];
      notes.forEach((freq, i) => {
        this.playTone(freq, now + i * 0.07, 0.09, 'square', 0.12);
      });
    }

    pipe() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [150, 180, 140, 170];
      notes.forEach((freq, i) => {
        this.playTone(freq, now + i * 0.06, 0.07, 'triangle', 0.18);
      });
    }

    death() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [500, 480, 450, 400, 350, 300, 200];
      notes.forEach((freq, i) => {
        this.playTone(freq, now + i * 0.08, 0.1, 'triangle', 0.15);
      });
    }

    win() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.12 }, { f: 659.25, d: 0.12 }, { f: 783.99, d: 0.12 },
        { f: 1046.50, d: 0.25 }, { f: 783.99, d: 0.12 }, { f: 1046.50, d: 0.4 }
      ];
      let t = now;
      fanfare.forEach(item => {
        this.playTone(item.f, t, item.d, 'square', 0.15);
        t += item.d + 0.04;
      });
    }

    startBGM() {
      if (this.muted || !this.ctx || this.bgmPlaying) return;
      this.bgmPlaying = true;

      // Classic Mario motif (E7, E7, pause, E7, C7, E7, G7, G6)
      const tempo = 120;
      const beat = 60 / tempo / 4;
      const notes = [
        { f: 659.25, len: 1 }, { f: 659.25, len: 1 }, { f: 0, len: 1 }, { f: 659.25, len: 1 },
        { f: 0, len: 1 }, { f: 523.25, len: 1 }, { f: 659.25, len: 2 },
        { f: 783.99, len: 2 }, { f: 0, len: 2 }, { f: 392.00, len: 2 }, { f: 0, len: 2 },
        // Bar 2
        { f: 523.25, len: 2 }, { f: 0, len: 1 }, { f: 392.00, len: 2 }, { f: 0, len: 1 },
        { f: 329.63, len: 2 }, { f: 0, len: 1 }, { f: 440.00, len: 1 }, { f: 493.88, len: 1 },
        { f: 466.16, len: 1 }, { f: 440.00, len: 2 }
      ];

      let totalDuration = 0;
      notes.forEach(n => { totalDuration += n.len * beat; });

      const scheduleLoop = () => {
        if (!this.bgmPlaying || this.muted) return;
        const start = this.ctx.currentTime;
        let cur = start;
        notes.forEach(note => {
          if (note.f > 0) {
            this.playTone(note.f, cur, note.len * beat * 0.85, 'triangle', 0.05);
          }
          cur += note.len * beat;
        });

        this.bgmTimer = setTimeout(() => {
          scheduleLoop();
        }, totalDuration * 1000);
      };

      scheduleLoop();
    }

    stopBGM() {
      this.bgmPlaying = false;
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  // --------------------------------------------------------
  // Constants & Global Configuration
  // --------------------------------------------------------
  const TILE_SIZE = 32;
  const GRAVITY = 0.52;
  const MAX_FALL_SPEED = 11;
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 448; // 14 tiles high

  // Tile IDs
  const T_EMPTY = 0;
  const T_GROUND = 1;
  const T_BRICK = 2;
  const T_Q_COIN = 3;
  const T_Q_MUSHROOM = 4;
  const T_EMPTY_BLOCK = 5;
  const T_PIPE_TL = 6;
  const T_PIPE_TR = 7;
  const T_PIPE_BL = 8;
  const T_PIPE_BR = 9;
  const T_FLAGPOLE = 10;
  const T_FLAG_TOP = 11;
  const T_CASTLE_BRICK = 12;
  const T_CASTLE_DOOR = 13;

  const audio = new SoundEngine();

  // --------------------------------------------------------
  // Level Definition (World 1-1 Structure)
  // --------------------------------------------------------
  const LEVEL_WIDTH = 175;
  const LEVEL_HEIGHT = 14;

  function createLevel() {
    const map = Array.from({ length: LEVEL_HEIGHT }, () => new Array(LEVEL_WIDTH).fill(T_EMPTY));

    // Ground floor (rows 12 & 13) with pits
    for (let c = 0; c < LEVEL_WIDTH; c++) {
      // Pits at columns: 69-71, 86-89, 148-150
      if ((c >= 69 && c <= 71) || (c >= 86 && c <= 89) || (c >= 148 && c <= 150)) {
        continue;
      }
      map[12][c] = T_GROUND;
      map[13][c] = T_GROUND;
    }

    // Helper to add pipe
    function addPipe(col, height) {
      const topRow = 12 - height;
      map[topRow][col] = T_PIPE_TL;
      map[topRow][col + 1] = T_PIPE_TR;
      for (let r = topRow + 1; r < 12; r++) {
        map[r][col] = T_PIPE_BL;
        map[r][col + 1] = T_PIPE_BR;
      }
    }

    // Pipes
    addPipe(28, 2);
    addPipe(38, 3);
    addPipe(46, 4);
    addPipe(57, 4);
    addPipe(160, 2);

    // Initial Blocks Section (World 1-1 style)
    map[9][16] = T_Q_COIN;
    map[9][20] = T_BRICK;
    map[9][21] = T_Q_MUSHROOM;
    map[9][22] = T_BRICK;
    map[9][23] = T_Q_COIN;
    map[9][24] = T_BRICK;
    map[5][22] = T_Q_COIN; // high block

    // Second Block cluster
    for (let c = 77; c <= 84; c++) {
      map[9][c] = (c === 78 || c === 81) ? T_Q_COIN : T_BRICK;
    }
    for (let c = 80; c <= 87; c++) {
      map[5][c] = T_BRICK;
    }

    // Staircase leading to gap
    for (let step = 1; step <= 4; step++) {
      for (let r = 12 - step; r < 12; r++) {
        map[r][130 + step] = T_BRICK;
      }
    }

    // Grand staircase leading to flagpole
    for (let step = 1; step <= 8; step++) {
      for (let r = 12 - step; r < 12; r++) {
        map[r][138 + step] = T_BRICK;
      }
    }

    // Flagpole
    const flagCol = 154;
    map[2][flagCol] = T_FLAG_TOP;
    for (let r = 3; r <= 11; r++) {
      map[r][flagCol] = T_FLAGPOLE;
    }

    // Castle
    const castleStart = 163;
    for (let r = 8; r < 12; r++) {
      for (let c = 0; c < 5; c++) {
        map[r][castleStart + c] = T_CASTLE_BRICK;
      }
    }
    map[11][castleStart + 2] = T_CASTLE_DOOR;
    map[10][castleStart + 2] = T_CASTLE_DOOR;
    // Battlements
    map[7][castleStart] = T_CASTLE_BRICK;
    map[7][castleStart + 2] = T_CASTLE_BRICK;
    map[7][castleStart + 4] = T_CASTLE_BRICK;

    return map;
  }

  // --------------------------------------------------------
  // Entities & Particle Effects
  // --------------------------------------------------------
  class Particle {
    constructor(x, y, vx, vy, color, size, life = 30) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.life = life;
      this.maxLife = life;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.3; // gravity
      this.life--;
    }

    draw(ctx, camX) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - camX, this.y, this.size, this.size);
    }
  }

  class FloatingText {
    constructor(text, x, y, color = '#fff') {
      this.text = text;
      this.x = x;
      this.y = y;
      this.color = color;
      this.life = 40;
    }

    update() {
      this.y -= 1;
      this.life--;
    }

    draw(ctx, camX) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText(this.text, this.x - camX, this.y);
      ctx.restore();
    }
  }

  class BouncingBlock {
    constructor(tileX, tileY, type) {
      this.tileX = tileX;
      this.tileY = tileY;
      this.type = type;
      this.offsetY = 0;
      this.vy = -4;
      this.done = false;
    }

    update() {
      this.offsetY += this.vy;
      this.vy += 0.8;
      if (this.offsetY >= 0) {
        this.offsetY = 0;
        this.done = true;
      }
    }
  }

  class CoinEffect {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.startY = y;
      this.vy = -6;
      this.done = false;
    }

    update() {
      this.y += this.vy;
      this.vy += 0.45;
      if (this.y >= this.startY) {
        this.done = true;
      }
    }

    draw(ctx, camX) {
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.ellipse(this.x - camX + 16, this.y + 16, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - camX + 14, this.y + 8, 4, 16);
    }
  }

  class Mushroom {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 28;
      this.height = 28;
      this.vx = 1.6;
      this.vy = 0;
      this.grounded = false;
      this.spawning = true;
      this.spawnOffset = 0;
    }

    update(level) {
      if (this.spawning) {
        this.spawnOffset += 1;
        this.y -= 1;
        if (this.spawnOffset >= TILE_SIZE) {
          this.spawning = false;
        }
        return;
      }

      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);
      this.x += this.vx;

      // Horizontal collision
      const leftTile = Math.floor(this.x / TILE_SIZE);
      const rightTile = Math.floor((this.x + this.width) / TILE_SIZE);
      const topTile = Math.floor(this.y / TILE_SIZE);
      const bottomTile = Math.floor((this.y + this.height - 1) / TILE_SIZE);

      if (this.vx > 0 && isSolid(level, rightTile, bottomTile)) {
        this.vx = -this.vx;
        this.x = rightTile * TILE_SIZE - this.width;
      } else if (this.vx < 0 && isSolid(level, leftTile, bottomTile)) {
        this.vx = -this.vx;
        this.x = (leftTile + 1) * TILE_SIZE;
      }

      // Vertical collision
      this.y += this.vy;
      const newBottomTile = Math.floor((this.y + this.height) / TILE_SIZE);
      const midLeftTile = Math.floor((this.x + 2) / TILE_SIZE);
      const midRightTile = Math.floor((this.x + this.width - 2) / TILE_SIZE);

      if (this.vy >= 0 && (isSolid(level, midLeftTile, newBottomTile) || isSolid(level, midRightTile, newBottomTile))) {
        this.y = newBottomTile * TILE_SIZE - this.height;
        this.vy = 0;
        this.grounded = true;
      } else {
        this.grounded = false;
      }
    }

    draw(ctx, camX) {
      const px = this.x - camX;
      const py = this.y;

      // Mushroom cap
      ctx.fillStyle = '#e52521';
      ctx.beginPath();
      ctx.arc(px + 14, py + 14, 14, Math.PI, 0, false);
      ctx.fill();

      // Mushroom white spots
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px + 14, py + 7, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px + 4, py + 9, 3, 5);
      ctx.fillRect(px + 21, py + 9, 3, 5);

      // Stem
      ctx.fillStyle = '#ffcca3';
      ctx.fillRect(px + 7, py + 14, 14, 14);
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 9, py + 17, 2, 5);
      ctx.fillRect(px + 17, py + 17, 2, 5);
    }
  }

  class Goomba {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 28;
      this.height = 28;
      this.vx = -1.1;
      this.vy = 0;
      this.alive = true;
      this.squashed = false;
      this.squashTimer = 0;
      this.animTimer = 0;
    }

    update(level) {
      if (this.squashed) {
        this.squashTimer++;
        return;
      }

      this.animTimer += 0.1;
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);
      this.x += this.vx;

      // Horizontal tile collision
      const checkCol = this.vx > 0
        ? Math.floor((this.x + this.width) / TILE_SIZE)
        : Math.floor(this.x / TILE_SIZE);
      const row = Math.floor((this.y + this.height / 2) / TILE_SIZE);

      if (isSolid(level, checkCol, row)) {
        this.vx = -this.vx;
      }

      // Vertical tile collision
      this.y += this.vy;
      const bottomRow = Math.floor((this.y + this.height) / TILE_SIZE);
      const colL = Math.floor((this.x + 4) / TILE_SIZE);
      const colR = Math.floor((this.x + this.width - 4) / TILE_SIZE);

      if (isSolid(level, colL, bottomRow) || isSolid(level, colR, bottomRow)) {
        this.y = bottomRow * TILE_SIZE - this.height;
        this.vy = 0;
      }
    }

    draw(ctx, camX) {
      const px = this.x - camX;
      const py = this.y;

      if (this.squashed) {
        // Squashed Goomba
        ctx.fillStyle = '#b84418';
        ctx.fillRect(px + 2, py + 18, 24, 10);
        ctx.fillStyle = '#000';
        ctx.fillRect(px + 8, py + 22, 12, 3);
        return;
      }

      // Goomba Mushroom Body
      ctx.fillStyle = '#b84418';
      ctx.beginPath();
      ctx.moveTo(px + 14, py);
      ctx.lineTo(px + 28, py + 18);
      ctx.lineTo(px, py + 18);
      ctx.closePath();
      ctx.fill();

      // Stem
      ctx.fillStyle = '#ffcca3';
      ctx.fillRect(px + 6, py + 16, 16, 8);

      // Angry Eyes
      ctx.fillStyle = '#fff';
      ctx.fillRect(px + 6, py + 8, 5, 8);
      ctx.fillRect(px + 17, py + 8, 5, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 9, py + 10, 2, 6);
      ctx.fillRect(px + 17, py + 10, 2, 6);

      // Eyebrows
      ctx.fillRect(px + 5, py + 6, 7, 2);
      ctx.fillRect(px + 16, py + 6, 7, 2);

      // Walking feet
      const step = Math.sin(this.animTimer * 2) > 0;
      ctx.fillStyle = '#000';
      if (step) {
        ctx.fillRect(px + 2, py + 22, 9, 6);
        ctx.fillRect(px + 18, py + 24, 8, 4);
      } else {
        ctx.fillRect(px + 2, py + 24, 8, 4);
        ctx.fillRect(px + 17, py + 22, 9, 6);
      }
    }
  }

  // --------------------------------------------------------
  // Helper: Tile Solidity
  // --------------------------------------------------------
  function isSolid(level, col, row) {
    if (col < 0 || col >= LEVEL_WIDTH || row < 0 || row >= LEVEL_HEIGHT) {
      return false;
    }
    const tile = level[row][col];
    return tile === T_GROUND ||
           tile === T_BRICK ||
           tile === T_Q_COIN ||
           tile === T_Q_MUSHROOM ||
           tile === T_EMPTY_BLOCK ||
           tile === T_PIPE_TL ||
           tile === T_PIPE_TR ||
           tile === T_PIPE_BL ||
           tile === T_PIPE_BR ||
           tile === T_CASTLE_BRICK;
  }

  // --------------------------------------------------------
  // Player: Mario
  // --------------------------------------------------------
  class Mario {
    constructor(x, y) {
      this.reset(x, y);
      this.lives = 3;
    }

    reset(x, y) {
      this.x = x;
      this.y = y;
      this.width = 24;
      this.height = 30;
      this.vx = 0;
      this.vy = 0;
      this.isSuper = false;
      this.grounded = false;
      this.facingRight = true;
      this.dead = false;
      this.deadTimer = 0;
      this.invincibleTimer = 0;
      this.animTimer = 0;
      this.state = 'idle'; // 'idle', 'walk', 'jump', 'flag', 'castle'
    }

    grow() {
      if (!this.isSuper) {
        this.isSuper = true;
        this.height = 46;
        this.y -= 16;
        audio.powerup();
      }
    }

    shrink() {
      if (this.isSuper) {
        this.isSuper = false;
        this.height = 30;
        this.y += 16;
        this.invincibleTimer = 90; // ~1.5s invincibility
        audio.pipe();
      } else {
        this.die();
      }
    }

    die() {
      if (this.dead) return;
      this.dead = true;
      this.vy = -10;
      this.vx = 0;
      audio.death();
      audio.stopBGM();
    }

    update(level, keys, onBlockHit) {
      if (this.dead) {
        this.vy += GRAVITY * 0.8;
        this.y += this.vy;
        this.deadTimer++;
        return;
      }

      if (this.invincibleTimer > 0) {
        this.invincibleTimer--;
      }

      // Horizontal movement
      const maxSpeed = keys.sprint ? 4.5 : 3.0;
      const accel = 0.35;
      const friction = 0.82;

      if (keys.left) {
        this.vx -= accel;
        this.facingRight = false;
        this.state = 'walk';
      } else if (keys.right) {
        this.vx += accel;
        this.facingRight = true;
        this.state = 'walk';
      } else {
        this.vx *= friction;
        if (Math.abs(this.vx) < 0.1) {
          this.vx = 0;
          this.state = 'idle';
        }
      }

      this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));

      // Jump
      if (keys.jump) {
        if (this.grounded && !this.jumpConsumed) {
          this.vy = this.isSuper ? -11.5 : -11;
          this.grounded = false;
          this.jumpConsumed = true;
          audio.jump();
        }
      } else {
        this.jumpConsumed = false;
        // Variable jump height cut
        if (this.vy < -4) {
          this.vy *= 0.65;
        }
      }

      // Apply Gravity
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL_SPEED);

      if (!this.grounded) {
        this.state = 'jump';
      }

      // Horizontal movement & tile collision
      this.x += this.vx;
      if (this.x < 0) this.x = 0;

      this.checkHorizontalCollisions(level);

      // Vertical movement & tile collision
      this.y += this.vy;
      this.grounded = false;
      this.checkVerticalCollisions(level, onBlockHit);

      // Pit death
      if (this.y > CANVAS_HEIGHT + 30) {
        this.die();
      }

      this.animTimer += Math.abs(this.vx) * 0.15;
    }

    checkHorizontalCollisions(level) {
      const topRow = Math.floor(this.y / TILE_SIZE);
      const bottomRow = Math.floor((this.y + this.height - 1) / TILE_SIZE);

      if (this.vx > 0) {
        const col = Math.floor((this.x + this.width) / TILE_SIZE);
        for (let r = topRow; r <= bottomRow; r++) {
          if (isSolid(level, col, r)) {
            this.x = col * TILE_SIZE - this.width;
            this.vx = 0;
            break;
          }
        }
      } else if (this.vx < 0) {
        const col = Math.floor(this.x / TILE_SIZE);
        for (let r = topRow; r <= bottomRow; r++) {
          if (isSolid(level, col, r)) {
            this.x = (col + 1) * TILE_SIZE;
            this.vx = 0;
            break;
          }
        }
      }
    }

    checkVerticalCollisions(level, onBlockHit) {
      const leftCol = Math.floor((this.x + 4) / TILE_SIZE);
      const rightCol = Math.floor((this.x + this.width - 4) / TILE_SIZE);

      if (this.vy >= 0) {
        // Falling down
        const row = Math.floor((this.y + this.height) / TILE_SIZE);
        for (let c = leftCol; c <= rightCol; c++) {
          if (isSolid(level, c, row)) {
            this.y = row * TILE_SIZE - this.height;
            this.vy = 0;
            this.grounded = true;
            break;
          }
        }
      } else {
        // Jumping up (hitting blocks)
        const row = Math.floor(this.y / TILE_SIZE);
        for (let c = leftCol; c <= rightCol; c++) {
          if (isSolid(level, c, row)) {
            this.y = (row + 1) * TILE_SIZE;
            this.vy = 0;
            onBlockHit(c, row);
            break;
          }
        }
      }
    }

    draw(ctx, camX) {
      if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
        return; // Blink when invincible
      }

      const px = Math.round(this.x - camX);
      const py = Math.round(this.y);

      ctx.save();
      if (!this.facingRight) {
        ctx.translate(px + this.width, py);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(px, py);
      }

      this.renderMarioSprite(ctx);
      ctx.restore();
    }

    renderMarioSprite(ctx) {
      const h = this.height;
      const isSuper = this.isSuper;

      if (this.dead) {
        // Dead Mario Pose
        ctx.fillStyle = '#e52521';
        ctx.fillRect(4, 2, 16, 8); // Cap
        ctx.fillStyle = '#ffcca3';
        ctx.fillRect(6, 10, 12, 8); // Face
        ctx.fillStyle = '#0026e6';
        ctx.fillRect(4, 18, 16, 8); // Overalls
        ctx.fillStyle = '#000';
        // X eyes
        ctx.fillRect(8, 12, 3, 3);
        ctx.fillRect(14, 12, 3, 3);
        return;
      }

      const capH = isSuper ? 10 : 8;
      const faceH = isSuper ? 10 : 8;
      const bodyH = isSuper ? 16 : 10;
      const legsH = isSuper ? 10 : 4;

      // 1. Red Cap
      ctx.fillStyle = '#e52521';
      ctx.fillRect(4, 0, 16, capH);
      ctx.fillRect(10, capH - 3, 10, 3); // visor

      // 2. Face & Nose
      ctx.fillStyle = '#ffcca3';
      ctx.fillRect(4, capH, 14, faceH);
      ctx.fillRect(16, capH + 2, 4, 4); // nose

      // Eye & Moustache
      ctx.fillStyle = '#000';
      ctx.fillRect(12, capH + 1, 3, 4); // eye
      ctx.fillStyle = '#5c2c00';
      ctx.fillRect(8, capH + 5, 12, 3); // moustache
      ctx.fillRect(2, capH + 2, 4, 6); // hair

      // 3. Overalls & Shirt
      let bodyY = capH + faceH;
      // Red Shirt
      ctx.fillStyle = '#e52521';
      ctx.fillRect(2, bodyY, 20, bodyH);

      // Blue Overalls
      ctx.fillStyle = '#0026e6';
      ctx.fillRect(6, bodyY + 2, 12, bodyH - 2);
      ctx.fillRect(8, bodyY + bodyH - 4, 8, 4);

      // Yellow Buttons
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(6, bodyY + 4, 2, 2);
      ctx.fillRect(16, bodyY + 4, 2, 2);

      // 4. Running / Jumping Legs animation
      const legY = bodyY + bodyH;
      ctx.fillStyle = '#5c2c00'; // Brown shoes

      if (this.state === 'jump') {
        // Spread legs in jump
        ctx.fillRect(0, legY - 2, 8, 6);
        ctx.fillRect(16, legY + 2, 8, 6);
      } else if (this.state === 'walk') {
        const frame = Math.floor(this.animTimer) % 3;
        if (frame === 0) {
          ctx.fillRect(2, legY, 8, legsH + 4);
          ctx.fillRect(14, legY, 8, legsH + 4);
        } else if (frame === 1) {
          ctx.fillRect(0, legY, 9, legsH + 4);
          ctx.fillRect(12, legY - 2, 8, legsH + 2);
        } else {
          ctx.fillRect(4, legY - 2, 8, legsH + 2);
          ctx.fillRect(15, legY, 9, legsH + 4);
        }
      } else {
        // Idle
        ctx.fillRect(3, legY, 8, legsH + 4);
        ctx.fillRect(13, legY, 8, legsH + 4);
      }
    }
  }

  // --------------------------------------------------------
  // Game Manager
  // --------------------------------------------------------
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.scoreDisplay = document.getElementById('score-display');
      this.coinsDisplay = document.getElementById('coins-display');
      this.timeDisplay = document.getElementById('time-display');
      this.livesDisplay = document.getElementById('lives-display');

      this.startOverlay = document.getElementById('start-overlay');
      this.gameOverOverlay = document.getElementById('game-over-overlay');
      this.victoryOverlay = document.getElementById('victory-overlay');

      this.score = 0;
      this.coins = 0;
      this.timeLeft = 400;
      this.timeCounter = 0;
      this.gameState = 'START'; // 'START', 'PLAY', 'WIN', 'GAMEOVER'

      this.camX = 0;
      this.level = createLevel();
      this.player = new Mario(64, 300);

      this.goombas = [];
      this.mushrooms = [];
      this.particles = [];
      this.floatingTexts = [];
      this.bouncingBlocks = [];
      this.coinEffects = [];

      this.keys = { left: false, right: false, jump: false, sprint: false };
      this.initEvents();
      this.populateEnemies();
    }

    initEvents() {
      // Keyboard input
      window.addEventListener('keydown', (e) => {
        audio.init();
        if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
        if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
        if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
          this.keys.jump = true;
          if (this.gameState === 'START') this.startGame();
        }
        if (e.key === 'Shift' || e.key === 'x' || e.key === 'X') this.keys.sprint = true;
        if (e.key === 'm' || e.key === 'M') audio.toggleMute();
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
        if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
        if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') this.keys.jump = false;
        if (e.key === 'Shift' || e.key === 'x' || e.key === 'X') this.keys.sprint = false;
      });

      // UI Buttons
      document.getElementById('start-btn').addEventListener('click', () => {
        audio.init();
        this.startGame();
      });
      document.getElementById('restart-btn').addEventListener('click', () => this.fullRestart());
      document.getElementById('victory-restart-btn').addEventListener('click', () => this.fullRestart());

      // Touch Buttons for Mobile
      const bindTouch = (id, key) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', (e) => {
          e.preventDefault();
          audio.init();
          this.keys[key] = true;
          if (key === 'jump' && this.gameState === 'START') this.startGame();
        });
        el.addEventListener('touchend', (e) => {
          e.preventDefault();
          this.keys[key] = false;
        });
      };

      bindTouch('btn-left', 'left');
      bindTouch('btn-right', 'right');
      bindTouch('btn-jump', 'jump');
      bindTouch('btn-run', 'sprint');
    }

    populateEnemies() {
      const goombaCols = [22, 41, 52, 54, 82, 84, 100, 116, 125, 127];
      this.goombas = goombaCols.map(col => new Goomba(col * TILE_SIZE, 350));
    }

    startGame() {
      this.startOverlay.classList.add('hidden');
      this.gameOverOverlay.classList.add('hidden');
      this.victoryOverlay.classList.add('hidden');
      this.gameState = 'PLAY';
      audio.startBGM();
    }

    fullRestart() {
      this.score = 0;
      this.coins = 0;
      this.player.lives = 3;
      this.restartStage();
      this.startGame();
    }

    restartStage() {
      this.timeLeft = 400;
      this.timeCounter = 0;
      this.camX = 0;
      this.level = createLevel();
      this.player.reset(64, 300);
      this.populateEnemies();
      this.mushrooms = [];
      this.particles = [];
      this.floatingTexts = [];
      this.bouncingBlocks = [];
      this.coinEffects = [];
      this.updateHUD();
    }

    onBlockHit(col, row) {
      const tile = this.level[row][col];
      const blockX = col * TILE_SIZE;
      const blockY = row * TILE_SIZE;

      if (tile === T_Q_COIN) {
        this.level[row][col] = T_EMPTY_BLOCK;
        this.bouncingBlocks.push(new BouncingBlock(col, row, T_EMPTY_BLOCK));
        this.coinEffects.push(new CoinEffect(blockX, blockY - 16));
        this.addScore(200, blockX, blockY - 20);
        this.addCoin();
        audio.coin();
      } else if (tile === T_Q_MUSHROOM) {
        this.level[row][col] = T_EMPTY_BLOCK;
        this.bouncingBlocks.push(new BouncingBlock(col, row, T_EMPTY_BLOCK));
        this.mushrooms.push(new Mushroom(blockX, blockY - TILE_SIZE));
        audio.powerup();
      } else if (tile === T_BRICK) {
        if (this.player.isSuper) {
          // Break Brick
          this.level[row][col] = T_EMPTY;
          this.createBrickDebris(blockX, blockY);
          this.addScore(50, blockX, blockY);
          audio.stomp();
        } else {
          // Bump Brick
          this.bouncingBlocks.push(new BouncingBlock(col, row, T_BRICK));
          audio.bump();
        }
      }
    }

    createBrickDebris(x, y) {
      const colors = ['#b84418', '#8b2500', '#d2691e'];
      for (let i = 0; i < 4; i++) {
        const vx = (i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 2);
        const vy = -(3 + Math.random() * 4);
        this.particles.push(new Particle(x + 16, y + 16, vx, vy, colors[i % colors.length], 8, 45));
      }
    }

    addScore(pts, x, y) {
      this.score += pts;
      this.floatingTexts.push(new FloatingText(`+${pts}`, x, y, '#ffff00'));
      this.updateHUD();
    }

    addCoin() {
      this.coins++;
      if (this.coins >= 100) {
        this.coins = 0;
        this.player.lives++;
      }
      this.updateHUD();
    }

    updateHUD() {
      this.scoreDisplay.textContent = String(this.score).padStart(6, '0');
      this.coinsDisplay.textContent = `🪙 x${String(this.coins).padStart(2, '0')}`;
      this.timeDisplay.textContent = String(this.timeLeft).padStart(3, '0');
      this.livesDisplay.textContent = `❤️ x${this.player.lives}`;
    }

    update() {
      if (this.gameState !== 'PLAY') return;

      // Timer update
      this.timeCounter++;
      if (this.timeCounter >= 60) {
        this.timeCounter = 0;
        this.timeLeft--;
        this.updateHUD();
        if (this.timeLeft <= 0) {
          this.player.die();
        }
      }

      // Update Player
      this.player.update(this.level, this.keys, (c, r) => this.onBlockHit(c, r));

      // Camera follows Mario horizontally
      if (this.player.x - this.camX > CANVAS_WIDTH * 0.45) {
        this.camX = Math.min(
          this.player.x - CANVAS_WIDTH * 0.45,
          LEVEL_WIDTH * TILE_SIZE - CANVAS_WIDTH
        );
      }

      // Check Flagpole Collision (Victory condition)
      const flagCol = 154;
      if (Math.floor(this.player.x / TILE_SIZE) >= flagCol - 1 && !this.player.dead) {
        this.handleVictory();
        return;
      }

      // Handle Player Death
      if (this.player.dead && this.player.deadTimer > 120) {
        this.player.lives--;
        if (this.player.lives <= 0) {
          this.handleGameOver();
        } else {
          this.restartStage();
        }
        return;
      }

      // Update Bouncing Blocks
      for (let i = this.bouncingBlocks.length - 1; i >= 0; i--) {
        const b = this.bouncingBlocks[i];
        b.update();
        if (b.done) this.bouncingBlocks.splice(i, 1);
      }

      // Update Coin Effects
      for (let i = this.coinEffects.length - 1; i >= 0; i--) {
        const c = this.coinEffects[i];
        c.update();
        if (c.done) this.coinEffects.splice(i, 1);
      }

      // Update Mushrooms
      for (let i = this.mushrooms.length - 1; i >= 0; i--) {
        const m = this.mushrooms[i];
        m.update(this.level);

        // Check pickup by Mario
        if (this.checkOverlap(this.player, m)) {
          this.player.grow();
          this.addScore(1000, m.x, m.y);
          this.mushrooms.splice(i, 1);
        }
      }

      // Update Goombas
      for (let i = this.goombas.length - 1; i >= 0; i--) {
        const g = this.goombas[i];
        // Only update goombas that are near camera view
        if (g.x > this.camX - 60 && g.x < this.camX + CANVAS_WIDTH + 60) {
          g.update(this.level);

          if (g.squashed && g.squashTimer > 30) {
            this.goombas.splice(i, 1);
            continue;
          }

          if (!g.squashed && !this.player.dead && this.checkOverlap(this.player, g)) {
            // Check if Mario jumped on top of Goomba
            const marioBottom = this.player.y + this.player.height;
            const goombaMid = g.y + g.height * 0.45;

            if (this.player.vy > 0 && marioBottom <= goombaMid + 10) {
              // Stomp Goomba
              g.squashed = true;
              this.player.vy = -8.5; // bounce up
              this.addScore(100, g.x, g.y);
              audio.stomp();
            } else if (this.player.invincibleTimer === 0) {
              // Mario takes damage
              this.player.shrink();
            }
          }
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update();
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // Update Floating Texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.update();
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
    }

    checkOverlap(a, b) {
      return a.x < b.x + b.width &&
             a.x + a.width > b.x &&
             a.y < b.y + b.height &&
             a.y + a.height > b.y;
    }

    handleVictory() {
      this.gameState = 'WIN';
      audio.stopBGM();
      audio.win();
      document.getElementById('victory-score').textContent = `Final Score: ${this.score + this.timeLeft * 50}`;
      this.victoryOverlay.classList.remove('hidden');
    }

    handleGameOver() {
      this.gameState = 'GAMEOVER';
      document.getElementById('game-over-score').textContent = `Final Score: ${this.score}`;
      this.gameOverOverlay.classList.remove('hidden');
    }

    // ------------------------------------------------------
    // Rendering Engine
    // ------------------------------------------------------
    draw() {
      this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sky Background
      this.ctx.fillStyle = '#5c94fc';
      this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      this.drawScenery();
      this.drawTiles();

      // Bouncing Blocks
      this.bouncingBlocks.forEach(b => {
        const px = b.tileX * TILE_SIZE - this.camX;
        const py = b.tileY * TILE_SIZE + b.offsetY;
        this.renderTile(px, py, b.type);
      });

      // Pickups & Items
      this.coinEffects.forEach(c => c.draw(this.ctx, this.camX));
      this.mushrooms.forEach(m => m.draw(this.ctx, this.camX));

      // Enemies
      this.goombas.forEach(g => g.draw(this.ctx, this.camX));

      // Player
      this.player.draw(this.ctx, this.camX);

      // Particles & UI Floaties
      this.particles.forEach(p => p.draw(this.ctx, this.camX));
      this.floatingTexts.forEach(ft => ft.draw(this.ctx, this.camX));
    }

    drawScenery() {
      // Fluffy clouds & rolling hills
      for (let i = 0; i < 25; i++) {
        const cloudX = i * 260 - (this.camX * 0.3) % (25 * 260);
        this.drawCloud(cloudX, 60 + (i % 3) * 30);

        const hillX = i * 380 - (this.camX * 0.5) % (25 * 380);
        this.drawHill(hillX, 384);
      }
    }

    drawCloud(x, y) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 20, 0, Math.PI * 2);
      this.ctx.arc(x + 20, y - 8, 24, 0, Math.PI * 2);
      this.ctx.arc(x + 44, y, 20, 0, Math.PI * 2);
      this.ctx.fill();
    }

    drawHill(x, y) {
      this.ctx.fillStyle = '#00a800';
      this.ctx.beginPath();
      this.ctx.moveTo(x - 60, y);
      this.ctx.quadraticCurveTo(x, y - 75, x + 60, y);
      this.ctx.fill();
      // Hill spot pattern
      this.ctx.fillStyle = '#008000';
      this.ctx.beginPath();
      this.ctx.arc(x, y - 45, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    drawTiles() {
      const startCol = Math.max(0, Math.floor(this.camX / TILE_SIZE));
      const endCol = Math.min(LEVEL_WIDTH - 1, Math.ceil((this.camX + CANVAS_WIDTH) / TILE_SIZE));

      for (let r = 0; r < LEVEL_HEIGHT; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const tile = this.level[r][c];
          if (tile === T_EMPTY) continue;

          // Don't draw if actively bouncing
          if (this.bouncingBlocks.some(b => b.tileX === c && b.tileY === r)) continue;

          const px = c * TILE_SIZE - this.camX;
          const py = r * TILE_SIZE;
          this.renderTile(px, py, tile);
        }
      }
    }

    renderTile(px, py, type) {
      const ctx = this.ctx;

      switch (type) {
        case T_GROUND:
          // Brown soil with green grass trim
          ctx.fillStyle = '#c84c0c';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#00a800';
          ctx.fillRect(px, py, TILE_SIZE, 6);
          // Dark speckles
          ctx.fillStyle = '#000';
          ctx.fillRect(px + 4, py + 12, 3, 3);
          ctx.fillRect(px + 18, py + 22, 3, 3);
          break;

        case T_BRICK:
          // Red-brown textured brick
          ctx.fillStyle = '#b84418';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#000';
          ctx.fillRect(px, py, TILE_SIZE, 2);
          ctx.fillRect(px, py + 15, TILE_SIZE, 2);
          ctx.fillRect(px + 15, py, 2, 16);
          ctx.fillRect(px + 7, py + 16, 2, 16);
          ctx.fillRect(px + 23, py + 16, 2, 16);
          break;

        case T_Q_COIN:
        case T_Q_MUSHROOM:
          // Glowing Animated Question Block
          ctx.fillStyle = '#fc9838';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#000';
          // Outline & corner bolts
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillRect(px + 3, py + 3, 2, 2);
          ctx.fillRect(px + TILE_SIZE - 5, py + 3, 2, 2);
          ctx.fillRect(px + 3, py + TILE_SIZE - 5, 2, 2);
          ctx.fillRect(px + TILE_SIZE - 5, py + TILE_SIZE - 5, 2, 2);

          // The '?' symbol
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillText('?', px + 9, py + 23);
          break;

        case T_EMPTY_BLOCK:
          // Depleted brown block
          ctx.fillStyle = '#8b5a2b';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#000';
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillRect(px + 4, py + 4, 3, 3);
          ctx.fillRect(px + TILE_SIZE - 7, py + 4, 3, 3);
          ctx.fillRect(px + 4, py + TILE_SIZE - 7, 3, 3);
          ctx.fillRect(px + TILE_SIZE - 7, py + TILE_SIZE - 7, 3, 3);
          break;

        case T_PIPE_TL:
          ctx.fillStyle = '#00a800';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#80d010';
          ctx.fillRect(px + 3, py, 5, TILE_SIZE);
          ctx.fillStyle = '#005000';
          ctx.fillRect(px + TILE_SIZE - 4, py, 4, TILE_SIZE);
          break;

        case T_PIPE_TR:
          ctx.fillStyle = '#00a800';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#005000';
          ctx.fillRect(px + TILE_SIZE - 4, py, 4, TILE_SIZE);
          break;

        case T_PIPE_BL:
          ctx.fillStyle = '#00a800';
          ctx.fillRect(px + 4, py, TILE_SIZE - 4, TILE_SIZE);
          ctx.fillStyle = '#80d010';
          ctx.fillRect(px + 7, py, 5, TILE_SIZE);
          break;

        case T_PIPE_BR:
          ctx.fillStyle = '#00a800';
          ctx.fillRect(px, py, TILE_SIZE - 4, TILE_SIZE);
          ctx.fillStyle = '#005000';
          ctx.fillRect(px + TILE_SIZE - 8, py, 4, TILE_SIZE);
          break;

        case T_FLAG_TOP:
          ctx.fillStyle = '#00a800';
          ctx.beginPath();
          ctx.arc(px + 16, py + 16, 10, 0, Math.PI * 2);
          ctx.fill();
          break;

        case T_FLAGPOLE:
          ctx.fillStyle = '#bbb';
          ctx.fillRect(px + 13, py, 6, TILE_SIZE);
          break;

        case T_CASTLE_BRICK:
          ctx.fillStyle = '#00a800';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#000';
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
          break;

        case T_CASTLE_DOOR:
          ctx.fillStyle = '#000';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          break;
      }
    }

    loop() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }
  }

  // Launch Game
  window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.loop();
  });
})();
