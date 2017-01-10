'use strict';

var PlayScene = require('./play_scene.js');
var MenuScene = require('./menu_scene.js');
var WinScene = require('./win_scene.js');


var BootScene = {
  preload: function () {
    // load here assets required for the loading screen
    this.game.load.spritesheet('button', 'images/buttons.png', 168, 70);
    this.game.load.image('logo', 'images/phaser.png');
    this.game.load.image('preloader_bar', 'images/preloader_bar.png');
  },

  create: function () {
    this.game.state.start('menu');
  }
};


var PreloaderScene = {
  preload: function () {
    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);

    // TODO: load here the assets for the game
    
    this.load.onLoadStart.add(this.loadStart, this);
    this.game.load.image('pepper', 'images/pepper.png');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('goal', 'images/winLine.png');
    this.game.load.image('blank', 'images/blank.png');
    this.game.load.image('pause', 'images/pause.png');
    this.game.load.image('player', 'images/Leon.png');
    this.game.load.image('knife', 'images/Cuchillo.png');
    this.game.load.image('enemy', 'images/Gamba.png');
    this.game.load.image('plat', 'images/Platforms.png');
    this.game.load.tilemap('tilemap', 'images/map.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image("tiles", "images/tiles.png");
    this.game.load.image('win', 'images/win.png');
    this.load.onLoadComplete.add(this.loadComplete, this);
  },

  create: function(){},

  loadStart: function () {
    //this.game.state.start('play');
    console.log("Game Assets Loading ...");
  },

  loadComplete: function () {
    this.game.state.start('play');
  },

  update: function(){
    this._loadingBar
  }
};


window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', MenuScene);
  game.state.add('play', PlayScene);
  game.state.add('win', WinScene);

  game.state.start('boot');
};
