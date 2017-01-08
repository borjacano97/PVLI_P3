'use strict';

var PlayScene = {
  entities: {},
  toDelete: {},
  toAdd: {},

  create: function () {
      
      
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      
      // Añadimos el tilemap y el yileset
      this.map = this.add.tilemap('tilemap');
      this.map.addTilesetImage('tiles', 'tiles');
      // Creamos los layer del tilemap y las plataformas
    /*  this.platforms = this.add.physicsGroup(); 
      this.map.createFromObjects('Platforms', 6, 'plat',1,true,false,this.platforms);
      this.platforms.setAll('body.immovable', true);
      this.platforms.setAllChildren('body.checkCollision.down', false);
      this.platforms.setAllChildren('body.checkCollision.left', false);
      this.platforms.setAllChildren('body.checkCollision.right', false);
      
      this.map.setCollisionBetween(1, 5000, true, 'GroundLayer');
      for(var i = 0; i < this.platforms.children.length;i++){
         this.platforms.children[i].scale.x = this.platforms.children[i].ancho;
      }*/

      // Creamos los enemigos y configuramos la escena

      this.start();
      this.configure();
   
  },
  update: function(){
     for (var i in this.toDelete){
        if(this.entities[i] !== undefined){
	   delete this.entities[i];
	}
     }
     this.toDelete = {};
     for (var i in this.toAdd){
        this.entities[i]=this.toAdd[i];
     }
     this.toAdd = {};
     
     for(var i in this.entities){
        this.entities[i].update();
     }
     for(var i in this.entities){
	for(var j in this.entities){
	   if (j !== i && this.physics.arcade.collide(this.entities[i].sprite, this.entities[j].sprite))
              this.entities[i].onCollide(this.entities[j]);
        }
     }

  },
  start: function(){
      	 
      this.toAdd.player = new Player('player', this.add.sprite(96, 864, 'player'), this);
      this.toAdd.enemy1 = new Enemy('enemy1', this.add.sprite(768, 864, 'enemy'), this);
      this.toAdd.enemy2 = new Enemy('enemy2', this.add.sprite(1440, 864, 'enemy'), this);
      this.toAdd.enemy3 = new Enemy('enemy3', this.add.sprite(2560, 864, 'enemy'), this);
      this.toAdd.ground = new Entity('ground', this.map.createLayer('GroundLayer'), this);
      this.toAdd.death = new Entity('death', this.map.createLayer('Death'), this);
      this.toAdd.platforms = new Entity('platforms', this.add.physicsGroup(), this);
      this.map.createFromObjects('Platforms', 6, 'plat',1,true,false, this.toAdd.platforms.sprite);
      this.toAdd.platforms.sprite.setAll('body.immovable', true);
      this.toAdd.platforms.sprite.setAllChildren('body.checkCollision.down', false);
      this.toAdd.platforms.sprite.setAllChildren('body.checkCollision.left', false);
      this.toAdd.platforms.sprite.setAllChildren('body.checkCollision.right', false);
      for(var i = 0; i < this.toAdd.platforms.sprite.children.length;i++){
         this.toAdd.platforms.sprite.children[i].scale.x = this.toAdd.platforms.sprite.children[i].ancho;
      }
      this.toAdd.death.deathly = true;
      this.map.setCollisionBetween(1, 5000, true, 'Death');
      this.map.setCollisionBetween(1, 5000, true, 'GroundLayer');
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
  Entity.prototype.onCollide = function(collider){
     for(var i = 0; i < this.components.length;i++){
        this.components[i].onCollide(collider, this);
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
     this.jump = false;
     this.update = function(entity){
           // Actiualiza la gravedad y el movimiento
        entity.sprite.body.velocity.x = 0;
        entity.sprite.body.velocity.y = entity.sprite.body.velocity.y + (this._game.time.elapsed/10) * 9.8;

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
        if (this.jumpButton.isDown && this.jump){
           entity.sprite.body.velocity.y = this._jumpSpeed*-1;
           this.jump = false;
	}
           // Gestion del ataque
        this.waitFire++;

	if (this.attackButton.isDown && this.waitFire >= 30){
	   if (this._game.entities.knife === undefined){
               this._game.toAdd.knife = new Knife('knife', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife1 === undefined){
	      
     	      this._game.toAdd.knife1 = new Knife('knife1', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife2 === undefined){
	      
              this._game.toAdd.knife2 = new Knife('knife2', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   else if (this._game.entities.knife3 === undefined){
	      
              this._game.toAdd.knife3 = new Knife('knife3', this._game.add.sprite(entity.sprite.x, entity.sprite.y-30,'knife'), this.direction, this._game);
	   }
	   this.waitFire = 0;
        }
     };
     this.onCollide = function(collider, entity){
        // Si el jugador choca con el mapa la gravedad ya no le afecta
	console.log(entity.sprite.body.touching.down);
        if((collider.name === 'platforms' || collider.name === 'ground') && !entity.sprite.body.touching.down){	
           entity.sprite.body.velocity.y = 0;
           this.jump = true;	   
        }
        else if (collider.name === 'ground' && entity.sprite.body.touching.down){
           entity.sprite.body.velocity.x = 0;
        }
     };
  }

  function Die(self){
     this._game = self;
     this.update = function(entity){
	     
/*	for (var i in this._game.entities){
           if (this._game.game.physics.arcade.collide(entity.sprite, this._game.entities[i].sprite) && this._game.entities[i].deathly){
		   
		   this.restart();
		   break;
	   }
	}*/
     };
     this.onCollide = function(collider, entity){
        if (collider.deathly){
 	   for(var i in this._game.entities){
	      if(this._game.entities[i].name !== 'platforms'){
	      	 this._game.entities[i].sprite.kill();
	         this._game.toDelete[i] = true;
	      }
	   }
	   this.restart();
	}
     };
     this.restart = function(){
        /*for(var i in this._game.entities){
	   this._game.entities[i].sprite.kill();
	   this._game.toDelete[i] = true;
	}
	*/
	this._game.start();
     };
  }
  function Move(self){
     this._game = self;
     this.speed = -1000;
     this.turn = 0;
     this.direction = 'rigth';
     this.update = function(entity){
	this.turn++;
	entity.sprite.body.velocity.x = this.speed*(this._game.time.elapsed/100);
        if (this.turn > 90){
	   entity.sprite.scale.x *= -1;
	   this.turn = 0;
	   this.speed*=-1;
	}
/*	for (var i in this._game.entities){
	   if (this._game.game.physics.arcade.collide(entity.sprite, this._game.entities[i].sprite) && this._game.entities[i].kill){
	      this._game.toDelete[entity.name] = true;
	      entity.sprite.kill();
	      //delete this._game.entities[entity.name];

	   }
	}*/
     }
     this.onCollide = function(collider, entity){
        if(collider.kill){
	   this._game.toDelete[entity.name] = true;
	   entity.sprite.kill();
	}
     };
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
	   this._game.toDelete[entity.name] = true;
	}
/*	for (var i in this._game.entities){
	   if (this._game.game.physics.arcade.collide(entity.sprite, this._game.entities[i].sprite)){
	      entity.sprite.kill();
	      this._game.toDelete[entity.name] = true;
	      //delete this._game.entities[entity.name];
	   }
	}
	if (this._game.game.physics.arcade.collide(entity.sprite, this._game.groundLayer)){
	   entity.sprite.kill();
	   this._game.toDelete[entity.name] = true;
	   //delete this._game.entities[entity.name];
        }
	else if (this._game.game.physics.arcade.collide(entity.sprite, this._game.platforms)){
	   entity.sprite.kill();
	   this._game.toDelete[entity.name] = true;
	   //delete this._game.entities[entity.name];
        }*/
     };
     this.onCollide = function(collider, entity){
        entity.sprite.kill();
	this._game.toDelete[entity.name] = true;
     };
  }


module.exports = PlayScene;
