'use strict';

var PlayScene = {
  _speed: 300, //velocidad del player
  _jumpSpeed: 500, //velocidad de salto
  _player: {},

  create: function () {
      
      // Añadimos el tilemap y el yileset
      this.map = this.add.tilemap('tilemap');
      this.map.addTilesetImage('tiles', 'tiles');
      // Creamos los layer del tilemap
      this.groundLayer = this.map.createLayer('GroundLayer');
      this.death = this.map.createLayer('Death');
      this.map.setCollisionBetween(1, 5000, true, 'Death');
      this.map.setCollisionBetween(1, 5000, true, 'GroundLayer');
      // Creamos el player y configuramos la escena
      this._player = this.add.sprite(96, 32, 'player');
      this.configure();
      // Creamos los botones de accion
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.attackButton = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
   
  },
  update: function(){
     // Actiualiza la gravedad y el movimiento
     this._player.body.velocity.x = 0;
     this._player.body.velocity.y = this._player.body.velocity.y + 2 * 9.8;
     // Si el jugador choca con el mapa la gravedad ya no le afecta
     if(this.game.physics.arcade.collide(this._player, this.groundLayer)){
        this._player.body.gravity.y = 0;     
     }
     // Gestion del movimiento
     if (this.cursors.left.isDown){
        this._player.body.velocity.x = this._speed*-1;
     }
     else if (this.cursors.right.isDown){
        this._player.body.velocity.x = this._speed;
     }
     // Gestion del salto
     if (this.jumpButton.isDown && this._player.body.onFloor() ){
        this._player.body.velocity.y = this._jumpSpeed*-1;
     }
     
  },
  configure: function(){
     //Start the Arcade Physics systems
     this.game.world.setBounds(0, 0, 5000, 1120);
     this.game.physics.startSystem(Phaser.Physics.ARCADE);
     this.game.stage.backgroundColor = '#a9f0ff';
     this.game.physics.arcade.enable(this._player);
        
     this._player.body.gravity.y = 0;
     this._player.body.gravity.x = 0;
     this._player.body.velocity.x = 0;
     this.camera.follow(this._player);
  },
  render: function(){
     this.game.debug.cameraInfo(this.camera, 32, 32);
  }
  
};

module.exports = PlayScene;
