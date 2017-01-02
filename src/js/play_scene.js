'use strict';

var PlayScene = {
  _speed: 300, //velocidad del player
  _jumpSpeed: 500, //velocidad de salto
  _player: {},
  knife: [],
  direction: 'right',
  waitFire: 0,
  knifeLife: 0,

  create: function () {
      
      // Añadimos el tilemap y el yileset
      this.map = this.add.tilemap('tilemap');
      this.map.addTilesetImage('tiles', 'tiles');
      // Creamos los layer del tilemap
      this.groundLayer = this.map.createLayer('GroundLayer');
      this.platforms = this.map.createLayer('PassThrough');
      this.death = this.map.createLayer('Death');
      this.map.setCollisionBetween(1, 5000, true, 'Death');
      this.map.setCollisionBetween(1, 5000, true, 'PassThrough');
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
     if(this.game.physics.arcade.collide(this._player, this.groundLayer) && this._player.body.touching.down){
        this._player.body.velocity.y = 0;     
     }
     else if (this.game.physics.arcade.collide(this._player, this.platforms) && this._player.body.touching.down){
        this._player.body.velocity.y = 0;
     }
     // Gestion del movimiento
     if (this.cursors.left.isDown){
        this._player.body.velocity.x = this._speed*-1;
	this.direction = 'left';
     }
     else if (this.cursors.right.isDown){
        this._player.body.velocity.x = this._speed;
	this.direction = 'right';
     }
     // Gestion del salto
     if (this.jumpButton.isDown && this._player.body.onFloor() ){
        this._player.body.velocity.y = this._jumpSpeed*-1;
     }
     // Gestion del ataque
     this.waitFire++;
     if (this.knife.length >0){
        this.knifeLife++;
	
     }
     for (var i = 0; i<this.knife.length;i++){
        this.knife[i].body.velocity.y += 2*9.8;
	this.knife[i].angle+=10;
     }
     if (this.knifeLife >= 100 && this.knife.length > 0){
        this.knife[0].kill();
	this.knifeLife = 0;
	delete this.knife[0];
     }
     if (this.attackButton.isDown && this.waitFire >= 30){
        this.knife.push(this.game.add.sprite(this._player.x, this._player.y ,'knife'));
	this.game.physics.arcade.enable(this.knife[this.knife.length-1]);
	 if (this.direction=='left'){
            this.knife[this.knife.length-1].body.velocity.x = -500;
            this.knife[this.knife.length-1].body.velocity.y = -500;
	    this.knife[this.knife.length-1].scale.x = -1;
	    this.knife[this.knife.length-1].scale.y = -1;
        }
        else{
            this.knife[this.knife.length-1].body.velocity.x = 500;
            this.knife[this.knife.length-1].body.velocity.y = -500;
        }
	this.waitFire = 0;
     }
     for (var j = 0; j < this.knife.length;j++){
	     
        if (this.game.physics.arcade.collide(this.knife[j], this.groundLayer)){
	   this.knife[j].kill();
	   this.knifeLife = 0;
	   this.knife.splice(j,1);
	}
	else if (this.game.physics.arcade.collide(this.knife[j], this.death)){
	   this.knife[j].kill();
	   this.knifeLife = 0;
	   this.knife.splice(j,1);
	}
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
