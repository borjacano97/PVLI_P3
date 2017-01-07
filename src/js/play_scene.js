'use strict';

var PlayScene = {
  entities: {},


  create: function () {
      
      
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      
      // Añadimos el tilemap y el yileset
      this.map = this.add.tilemap('tilemap');
      this.map.addTilesetImage('tiles', 'tiles');
      // Creamos los layer del tilemap y las plataformas
      this.platforms = this.add.physicsGroup(); 
      this.map.createFromObjects('Platforms', 6, 'plat',1,true,false,this.platforms);
      this.platforms.setAll('body.immovable', true);
      this.platforms.setAllChildren('body.checkCollision.down', false);
      this.platforms.setAllChildren('body.checkCollision.left', false);
      this.platforms.setAllChildren('body.checkCollision.rigth', false);
      this.groundLayer = this.map.createLayer('GroundLayer');
      //this.death = this.map.createLayer('Death');
      
      this.map.setCollisionBetween(1, 5000, true, 'GroundLayer');
      for(var i = 0; i < this.platforms.children.length;i++){
         this.platforms.children[i].scale.x = this.platforms.children[i].ancho;
      }

      // Creamos los enemigos y configuramos la escena

      this.start();
   
  },
  update: function(){
     for(var i in this.entities){
        this.entities[i].update();
     };

  },
  start: function(){
      this.entities = {};	 
      this.entities.player = new Player('player', this.add.sprite(96, 864, 'player'), this);
      this.entities.enemy1 = new Enemy('enemy1', this.add.sprite(768, 864, 'enemy'), this);
      this.entities.enemy2 = new Enemy('enemy2', this.add.sprite(1440, 864, 'enemy'), this);
      this.entities.enemy3 = new Enemy('enemy3', this.add.sprite(2560, 864, 'enemy'), this);
      this.entities.death = new Entity('death', this.map.createLayer('Death'), this);
      this.entities.death.deathly = true;
      this.map.setCollisionBetween(1, 5000, true, 'Death');
      console.log(this.entities);

      this.configure();

  },

  configure: function(){
     // Start the Arcade Physics systems
     this.game.world.setBounds(0, 0, 3200, 1120);
     
     this.game.stage.backgroundColor = '#a9f0ff';

  },
  render: function(){
     //this.game.debug.cameraInfo(this.camera, 32, 32);
  }
  
};
  // Entidades---------------------------------------------------------------------
  // Prototipo
  function Entity(name, sprite, self){
     this._game = self;
     this.name = name;
     this.sprite = sprite;
     this.components = [];
  }

  Entity.prototype.update = function(){
     for(var i = 0; i < this.components.length;i++){
        this.components[i].update(this);
     }
  }
  // Player
  function Player(name, sprite, self){	  
     Entity.call(this, name, sprite, self);
     
     this.components.push(new Controller(self));
     this.components.push(new Die(self));
     self.game.physics.arcade.enable(this.sprite);
        
     this.sprite.body.gravity.y = 0;
     this.sprite.body.gravity.x = 0;
     this.sprite.body.velocity.x = 0;
     self.camera.follow(this.sprite);
  }
  Player.prototype = Object.create(Entity.prototype);
  Player.prototype.constructor = Entity;
  // Enemigo
  function Enemy(name, sprite, self){	  
     Entity.call(this, name, sprite, self);
     self.game.physics.arcade.enable(this.sprite);
     this.sprite.body.velocity.x = -300;
     this.deathly = true;
     this.components.push(new Move(self));
  }
  Enemy.prototype = Object.create(Entity.prototype);
  Enemy.prototype.constructor = Entity;
  // Cuchillo
  function Knife(name, sprite, direction, self){
     Entity.call(this, name, sprite, self);
     self.game.physics.arcade.enable(this.sprite);
     this.direction = direction;
     this.kill = true;
     this.components.push(new Throw(self, direction));
  }
  Knife.prototype = Object.create(Entity.prototype);
  Knife.prototype.constructor = Entity;

  // Componentes-------------------------------------------------------------------
  function Controller(self){
     this._game = self;
     this._speed = 300;
     this._jumpSpeed = 550;
     this.cursors = self.game.input.keyboard.createCursorKeys();
     this.jumpButton = self.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
     this.attackButton = self.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
     this.direction = 'rigth';
     this.waitFire = 0;
     this.update = function(entity){
           // Actiualiza la gravedad y el movimiento
        entity.sprite.body.velocity.x = 0;
        entity.sprite.body.velocity.y = entity.sprite.body.velocity.y + (this._game.time.elapsed/10) * 9.8;
           // Si el jugador choca con el mapa la gravedad ya no le afecta
        if(this._game.game.physics.arcade.collide(entity.sprite, this._game.groundLayer) &&
		       	entity.sprite.body.touching.down){
           entity.sprite.body.velocity.y = 0;	   
        }
        else if (this._game.game.physics.arcade.collide(entity.sprite, this._game.platforms) &&
		       	entity.sprite.body.touching.down){
           entity.sprite.body.velocity.y = 0;
        }
           // Gestion del movimiento
        if (this.cursors.left.isDown){
           entity.sprite.body.velocity.x = this._speed*-(this._game.time.elapsed/10);
	   this.direction = 'left';
	   entity.sprite.scale.x = -1;
        }
        else if (this.cursors.right.isDown){
           entity.sprite.body.velocity.x = this._speed*(this._game.time.elapsed/10);
	   this.direction = 'right';
	   entity.sprite.scale.x = 1;
        }
           // Gestion del salto
        if (this.jumpButton.isDown && (entity.sprite.body.onFloor() ||
			       	entity.sprite.body.touching.down)){
           entity.sprite.body.velocity.y = this._jumpSpeed*-1;
        }
           // Gestion del ataque
        this.waitFire++;

	if (this.attackButton.isDown && this.waitFire >= 30){
		console.log('Crea cuchillo');
	   console.log(this._game.entities);
	   if (this._game.entities.knife === undefined){
	     
               this._game.entities.knife = new Knife('knife', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife1 === undefined){
	      
     	      this._game.entities.knife1 = new Knife('knife1', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife2 === undefined){
	      
              this._game.entities.knife2 = new Knife('knife2', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife3 === undefined){
	      
              this._game.entities.knife3 = new Knife('knife3', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   this.waitFire = 0;
	   console.log(this._game.entities);
        }
     };
  }

  function Die(self){
     this._game = self;
     this.update = function(entity){
	     
	for (var i in this._game.entities){
           if (this._game.game.physics.arcade.collide(entity.sprite, this._game.entities[i].sprite) && this._game.entities[i].deathly){
		   
		   this.restart(this._game);
	   }
	}
     }
     this.restart = function(game){
	console.log('restart');
	console.log(this._game.entities);
        for(var i in this._game.entities){
	   game.entities[i].sprite.kill();
	}
	
	game.start();
     }
  }
  function Move(self){
     this._game = self;
     this._jumpSpeed = 350;
     this.turn = 0;
     this.direction = 'rigth';
     this.update = function(entity){
	this.turn++;
        if (this.turn > 90){
	   entity.sprite.body.velocity.x *= -1;
	   entity.sprite.scale.x *= -1;
	   this.turn = 0;
	}
	for (var i in this._game.entities){
	   if (this._game.game.physics.arcade.collide(entity.sprite, this._game.entities[i].sprite) && this._game.entities[i].kill){
	      console.log('Enemy die');
	      console.log(this._game.entities);
	      entity.sprite.kill();
	      delete this._game.entities[entity.name];
	      console.log(this._game.entities);
	   }
	}
     }
  }
  function Throw(self, direction){
     this._game = self;
     if (direction === 'left'){
        this.speedX = -500;
     }
     else this.speedX = 500;
     this.speedY = -1500;
     this.knifeLife = 0;
     this.update = function(entity){
	this.knifeLife++;
	entity.sprite.body.velocity.x = this.speedX *  (this._game.time.elapsed/10);
        entity.sprite.body.velocity.y = this.speedY + (this._game.time.elapsed)* 9.8;
	this.speedY = entity.sprite.body.velocity.y;
	entity.sprite.angle+= 10*(this.speedX/500);
	if (this.knifeLife > 100){
	   entity.sprite.kill();
	   delete this._game.entities[entity.name];
	}
	for (var i in this._game.entities){
	   if (this._game.game.physics.arcade.collide(entity.sprite, this._game.entities[i].sprite)){
	      console.log('Knife destruction');
	      console.log(this._game.entities);
	      entity.sprite.kill();
	      delete this._game.entities[entity.name];
	      console.log(this._game.entities);
	   }
	}
	if (this._game.game.physics.arcade.collide(entity.sprite, this._game.groundLayer)){
		console.log('Knife destruction');
		console.log(this._game.entities);
	   entity.sprite.kill();
	   delete this._game.entities[entity.name];
	   console.log(this._game.entities);
        }
	else if (this._game.game.physics.arcade.collide(entity.sprite, this._game.platforms)){
		console.log('Knife destruction');
		console.log(this._game.entities);
	   entity.sprite.kill();
	   delete this._game.entities[entity.name];
	   console.log(this._game.entities);
        }
     }
  }


module.exports = PlayScene;
