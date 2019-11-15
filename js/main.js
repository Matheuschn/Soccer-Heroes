// Importa a classe para criação do jogador e a variável game
import Player from "./player.js";
import { game } from "./index.js";

// Define bitfields para as categorias de colisão
const collision = {
  groundCollision: 0x0001,
  playerCollision: 0x0004,
  ballCollision: 0x0008
};

var score = { left: 0, right: 0, text: null };
var goal = { left: null, right: null };
var player = { left: null, right: null };
var min = { x: 100, y: 450 };
var max = { x: 700, y: 400 };
var powerUp;
var lastTouch;

var keys = { W: null, A: null, D: null, R: null, space: null, enter: null };

var ground;
var ball;

// Cria a cena principal
const mainScene = new Phaser.Scene("mainScene");

mainScene.preload = function() {
  // Carrega as imagens que serão usadas.
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("ball", "assets/ball.png");
  this.load.spritesheet("player", "assets/player.png", { frameWidth: 32, frameHeight: 48 });
  this.load.image("goal", "assets/goal.png");
  this.load.spritesheet("fullscreen", "assets/fullscreen.png", { frameWidth: 64, frameHeight: 64 });
};

mainScene.create = function() {
  // Adiciona o fundo e define o mundo de acordo com a resolução
  this.add
    .image(0, 0, "sky")
    .setOrigin(0, 0)
    .setScale(game.scale.width / this.textures.get("sky").frames.__BASE.width, game.scale.height / this.textures.get("sky").frames.__BASE.height);

  this.matter.world.setBounds(0, 0, game.scale.width, game.scale.height);

  ground = this.matter.add
    .image(0, game.scale.height, "ground")
    .setScale(game.scale.width / this.textures.get("ground").frames.__BASE.halfWidth, 4)
    .setStatic(true);

  score.text = this.add.text(game.scale.width / 2 - 48, 16, "0 - 0", { fontSize: "32px", fill: "#000" });

  // Define a letra R, usada pra resetar o jogo em caso de bugs
  keys.R = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  // Define os dois jogadores como objetos, usando o arquivo player.js,
  // dessa forma, o código relacionado ao sprite fica todo no outro arquivo
  player.left = new Player(this, 100, game.scale.height - 200, "playerLeft");
  player.right = new Player(this, game.scale.width - 100, game.scale.height - 200, "playerRight");

  ball = this.matter.add
    .sprite(game.scale.width / 2, ground.body.bounds.min.y - this.textures.get("ball").frames.__BASE.halfWidth, "ball")
    .setMass(5)
    .setCircle()
    .setBounce(0.9)
    .setCollisionCategory(collision.ballCollision)
    .setCollidesWith([collision.groundCollision, collision.playerCollision]);

  // Cria a hitbox do gol esquerdo e adiciona uma imagem. É melhor fazer assim
  // do que criar um sprite, por causa da colisão.
  goal.left = this.matter.add.rectangle(this.textures.get("goal").frames.__BASE.halfWidth, ground.body.bounds.min.y - this.textures.get("goal").frames.__BASE.halfHeight, 45, 96, {
    isSensor: true,
    isStatic: true,
    label: "left"
  });
  this.add.image(0, goal.left.bounds.min.y, "goal").setOrigin(0, 0);

  // Mesma coisa, só que com o gol direito, invertendo a imagem no eixo horizontal.
  goal.right = this.matter.add.rectangle(game.scale.width - this.textures.get("goal").frames.__BASE.halfWidth, ground.body.bounds.min.y - this.textures.get("goal").frames.__BASE.halfHeight, 45, 96, {
    isSensor: true,
    isStatic: true,
    label: "right"
  });
  this.add
    .image(game.scale.width, goal.right.bounds.min.y, "goal")
    .setOrigin(0, 0)
    .setScale(-1, 1);

  // Cria as traves
  this.matter.add.rectangle(goal.left.position.x, goal.left.vertices[1].y + 2, goal.left.vertices[1].x, 3, {
    isStatic: true
  });
  this.matter.add.rectangle(goal.right.position.x, goal.right.vertices[1].y + 2, game.scale.width - goal.right.vertices[0].x, 3, {
    isStatic: true
  });

  const fullscreenButton = this.add
    .image(game.scale.width - 16, 16, "fullscreen", 0)
    .setOrigin(1, 0)
    .setInteractive();

  // Ao clicar no botão de tela cheia
  fullscreenButton.on("pointerup", () => {
    if (this.scale.isFullscreen) {
      fullscreenButton.setFrame(0);
      this.scale.stopFullscreen();
    } else {
      fullscreenButton.setFrame(1);
      this.scale.startFullscreen();
    }
  });

  //powerUp = this.matter.add.image(0, 0).setIgnoreGravity(true);
  //addPowerUp();
};

mainScene.update = function() {
  player.right.update();
  player.left.update();

  // Função para verificar se a bola entrou no gol
  checkGoal();

  //getLastTouch();
  //getPowerUp();

  if (keys.R.isDown) {
    resetMatch(0);
  }
};

function checkGoal() {
  // Evento que verifica a colisão entre os gols e a bola
  mainScene.matterCollision.addOnCollideActive({
    objectA: ball,
    objectB: [goal.left, goal.right],
    callback: eventData => {
      // Caso a bola entre no gol esquerdo
      if (eventData.bodyB.label === "left") {
        // Se a bola ficar em cima do gol, rola ela pra baixo
        if (Math.round(ball.y) === goal.left.vertices[1].y + 1 - ball.width / 2) {
          ball.setAngularVelocity(0.1);
        }
        // Se a bola tiver passado de certa posição, conta o gol
        if (ball.x <= goal.left.vertices[1].x - ball.width / 2 && ball.y >= goal.left.vertices[1].y + 3) {
          score.right++;
          score.text.setText(score.left + " - " + score.right);
          // O argumento da função define o lado que a bola vai após o gol
          resetMatch(-3);
        }
      } // Caso a bola entre no gol direito
      else {
        if (Math.round(ball.y) === goal.right.vertices[1].y + 1 - ball.width / 2) {
          ball.setAngularVelocity(-0.1);
        }
        if (ball.x >= goal.right.vertices[0].x + ball.width / 2 && ball.y >= goal.right.vertices[1].y + 3) {
          score.left++;
          score.text.setText(score.left + " - " + score.right);
          resetMatch(3);
        }
      }
    }
  });
}

function resetMatch(ballVelocity) {
  player.left.sprite.setPosition(100, ground.body.bounds.min.y - player.left.sprite.height / 2).setVelocity(0, 0);
  player.right.sprite.setPosition(game.scale.width - 100, ground.body.bounds.min.y - player.right.sprite.height / 2).setVelocity(0, 0);
  ball
    .setPosition(game.scale.width / 2, game.scale.height / 2)
    .setVelocity(ballVelocity, 0)
    .setAngularVelocity(0)
    .setRotation(0);
}

function addPowerUp() {
  if (powerUp.active) {
    powerUp.destroy();
    mainScene.time.addEvent({
      delay: 5000,
      callback: addPowerUp,
      callbackScope: this
    });
  } else {
    let randomX = Math.floor(Math.random() * (max.x - min.x + 1) + min.x);
    let randomY = Math.floor(Math.random() * (max.y - min.y + 1) + min.y);
    powerUp = mainScene.matter.add
      .image(randomX, randomY, "ball")
      .setCircle()
      .setIgnoreGravity(true)
      .setSensor(true);
    mainScene.time.addEvent({
      delay: 15000,
      callback: addPowerUp,
      callbackScope: this
    });
  }
}

function getPowerUp() {
  if (powerUp.active) {
    mainScene.matterCollision.addOnCollideStart({
      objectA: ball,
      objectB: powerUp,
      callback: () => {
        powerUp.destroy();
        console.log(lastTouch);
      }
    });
  }
}

function getLastTouch() {
  mainScene.matterCollision.addOnCollideStart({
    objectA: ball,
    objectB: [player.left.sprite, player.right.sprite, player.left.sprite.foot.left, player.left.sprite.foot.right, player.right.sprite.foot.left, player.right.sprite.foot.right],
    callback: eventData => {
      lastTouch = eventData.bodyB.label;
    }
  });
}

export { ground, collision, keys };

export { mainScene };
