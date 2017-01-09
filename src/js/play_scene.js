'use strict';

var PlayScene = {
  entities: {},
  toDelete: {},
  toAdd: {},
  paused: false,

  create: function () {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      
      // Añadimos el tilemap y el yileset
      this.map = this.add.tilemap('tilemap');
      this.map.addTilesetImage('tiles', 'tiles');
      // Creamos los layer del tilemap y las plataformas
      this.pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
      this.pauseControl = false;

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
     if(!this.paused){
        for(var i in this.entities){
           this.entities[i].update();
        }
        for(var i in this.entities){
	   for(var j in this.entities){
	      if (this.physics.arcade.collide(this.entities[i].sprite, this.entities[j].sprite)){
	     	      this.entities[i].onCollide(this.entities[j]);
	      }
           }
        }
     }
  },
  start: function(){
      	 
      this.toAdd.player = new Player('player', this.add.sprite(96, 832, 'player'), this);
      this.toAdd.enemy1 = new Enemy('enemy1', this.add.sprite(768, 864, 'enemy'), this);
      this.toAdd.enemy2 = new Enemy('enemy2', this.add.sprite(1440, 864, 'enemy'), this);
      this.toAdd.enemy3 = new Enemy('enemy3', this.add.sprite(2560, 864, 'enemy'), this);
      this.toAdd.enemy4 = new Enemy('enemy4', this.add.sprite(122*32, 26*32, 'enemy'), this);
      this.toAdd.enemy5 = new Enemy('enemy5', this.add.sprite(223*32, 28*32, 'enemy'), this);
      this.toAdd.enemy6 = new Enemy('enemy6', this.add.sprite(266*32, 27*32, 'enemy'), this);
      this.toAdd.enemy7 = new Enemy('enemy7', this.add.sprite(244*32, 27*32, 'enemy'), this);
      this.toAdd.enemy8 = new Enemy('enemy8', this.add.sprite(325*32, 25*32, 'enemy'), this);
      this.toAdd.enemy9 = new Enemy('enemy9', this.add.sprite(365*32, 19*32, 'enemy'), this);
      this.toAdd.enemy10 = new Enemy('enemy10', this.add.sprite(436*32, 34*32, 'enemy'), this);
      this.toAdd.enemy11 = new Enemy('enemy11', this.add.sprite(463*32, 11*32, 'enemy'), this);
      this.toAdd.goal = new Goal('goal', this.add.sprite(495*32, 27*32, 'goal'), this);
            this.map.createLayer('GroundLayer');
      this.toAdd.ground = new Entity('ground', this.add.physicsGroup(), this);
      this.map.createFromObjects('GroundObjects', 7, 'blank',1,true,false, this.toAdd.ground.sprite);

      this.toAdd.ground.sprite.setAll('body.immovable', true);
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
      for(var i = 0; i < this.toAdd.ground.sprite.children.length;i++){
         this.toAdd.ground.sprite.children[i].scale.x = this.toAdd.ground.sprite.children[i].ancho;
	 this.toAdd.ground.sprite.children[i].scale.y = this.toAdd.ground.sprite.children[i].alto;
      }
      this.toAdd.death.deathly = true;
      this.map.setCollisionBetween(1, 16000, true, 'Death');
      console.log(this.toAdd);

  },

  configure: function(){
     // Start the Arcade Physics systems
     this.game.world.setBounds(0, 0, 16000, 1120);
     
     this.game.stage.backgroundColor = '#a9f0ff';

  },
  render: function(){

     	if (this.pauseButton.isDown && !this.pauseControl){
	   this.pauseControl = true;
	}
	if (!this.pauseButton.isDown && this.pauseControl){
           if (!this.game.paused){	  
	      this.game.paused = true;
	      this.pauseImage = this.game.add.image(this.game.camera.x,this.game.camera.y,'pause');

	   }
	   else{
	      this.game.paused = false;
	      if(this.pauseImage);
	         this.pauseImage.kill();
	   }
	   this.pauseControl = false;
	}
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
     
     
     this.components.push(new Die(self));
     self.game.physics.arcade.enable(this.sprite);
        
     this.sprite.body.gravity.y = 0;
     this.sprite.body.gravity.x = 0
     this.sprite.body.inmovable = true;
     this.components.push(new Controller(self));
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
     this.sprite.body.inmovable = true;
     this.kill = true;
     this.components.push(new Throw(self, direction));
  }
  Knife.prototype = Object.create(Entity.prototype);
  Knife.prototype.constructor = Entity;
  // Meta
  function Goal(name, sprite, self){
     Entity.call(this, name, sprite, self);
     self.game.physics.arcade.enable(this.sprite);
  }
  Goal.prototype = Object.create(Entity.prototype);
  Goal.prototype.constructor = Entity;
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
     this.first = 0;
     this.update = function(entity){
           // Actiualiza la gravedad y el movimiento
        entity.sprite.body.velocity.x = 0;
	if (this.first < 50){
	   this.first++;
	   entity.sprite.body.velocity.y = 0;
	}
	else{
           entity.sprite.body.velocity.y = entity.sprite.body.velocity.y + (this._game.time.elapsed/10) * 9.8;
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

	if(this.jumpButton.isDown) console.log(entity.sprite.body.touching.down);
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
        if(collider.name === 'platforms' && entity.sprite.body.touching.down ){	
           entity.sprite.body.velocity.y = 0;
           this.jump = true;	   
        }
	else if(collider.name === 'ground' && entity.sprite.body.touching.down){
	   entity.sprite.body.velocity.y = 0;
           this.jump = true;
	}

	if (collider.name === 'goal'){
	   this._game.world.setBounds(0, 0, 800, 480);
           this._game.stage.backgroundColor = '#000000';
	   
	   this._game.state.start('win');
	}
     };
  }

  function Die(self){
     this._game = self;
     this.update = function(entity){
     };
     this.onCollide = function(collider, entity){
        if (collider.deathly){
 	   for(var i in this._game.entities){
	      if(this._game.entities[i].name !== 'platforms' && this._game.entities[i].name !== 'ground'){
	      	 this._game.entities[i].sprite.destroy();
	         this._game.toDelete[i] = true;
	      }
	      else this._game.toDelete[i] = true;
	   }
	   this.restart();
	}
     };
     this.restart = function(){
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
     }
     this.onCollide = function(collider, entity){
        if(collider.kill){
	   this._game.toDelete[entity.name] = true;
	   entity.sprite.destroy();
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
	if (this.knifeLife > 25){
	   entity.sprite.destroy();

	   this._game.toDelete[entity.name] = true;
	}

     };
     this.onCollide = function(collider, entity){
     }
  }


module.exports = PlayScene;
