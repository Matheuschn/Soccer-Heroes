// Importa a classe para criação do jogador e a variável game
import Player from "./player.js";

// Cria a cena do jogo
const gameScene = new Phaser.Scene("gameScene");

gameScene.init = function(data) {
  this.isTimeGamemode = data.isTimeGamemode;
  this.isGoalGamemode = data.isGoalGamemode;
};

gameScene.preload = function() {
  // Carrega as imagens que serão usadas.
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("ball", "assets/ball.png");
  this.load.spritesheet("player", "assets/player.png", { frameWidth: 32, frameHeight: 48 });
  this.load.image("goal", "assets/goal.png");
  this.load.spritesheet("fullscreen", "assets/fullscreen.png", { frameWidth: 64, frameHeight: 64 });
};

gameScene.create = function() {
  // Adiciona o fundo e define o mundo de acordo com a resolução
  let skyWidth = this.textures.get("sky").frames.__BASE.width;
  let skyHeight = this.textures.get("sky").frames.__BASE.height;
  this.add
    .image(0, 0, "sky")
    .setOrigin(0, 0)
    .setScale(this.scale.width / skyWidth, this.scale.height / skyHeight);
  this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height);

  // Adiciona o chão
  let groundHalfWidth = this.textures.get("ground").frames.__BASE.halfWidth;
  this.ground = this.matter.add
    .image(0, this.scale.height, "ground")
    .setScale(this.scale.width / groundHalfWidth, 4)
    .setStatic(true);

  // Adiciona o placar
  this.score = {
    left: 0,
    right: 0,
    text: this.add.text(this.scale.width / 2 - 48, 16, "0 - 0", { fontSize: "32px", fill: "#000" })
  };

  // Adiciona o timer
  if (this.isTimeGamemode) {
    this.time = {
      text: this.add.text(this.scale.width / 2 - 36, 48, "2:00", { fontSize: "32px", fill: "#000" }),
      event: this.time.addEvent({
        delay: 120000,
        callback: endGame,
        callbackScope: this
      })
    };
  }

  // Define os grupos de colisão
  this.collision = {
    groundCollision: 0x0001,
    playerCollision: 0x0004,
    ballCollision: 0x0008
  };

  // Define os dois jogadores como objetos, usando o arquivo player.js,
  // dessa forma, o código relacionado ao sprite fica todo no outro arquivo
  this.player = {
    left: new Player(this, 100, this.scale.height - 200, "playerLeft"),
    right: new Player(this, this.scale.width - 100, this.scale.height - 200, "playerRight")
  };

  // Adiciona a bola
  let ballHalfWidth = this.textures.get("ball").frames.__BASE.halfWidth;
  this.ground.level = this.ground.body.bounds.min.y;
  this.ball = this.matter.add
    .sprite(this.scale.width / 2, this.ground.level - ballHalfWidth, "ball")
    .setMass(5)
    .setCircle()
    .setBounce(0.9)
    .setCollisionCategory(this.collision.ballCollision)
    .setCollidesWith([this.collision.groundCollision, this.collision.playerCollision]);

  // Cria as hitboxes dos gols e adiciona as imagens. É melhor fazer assim
  // do que criar um sprite, por causa da colisão.
  let goalHalfWidth = this.textures.get("goal").frames.__BASE.halfWidth;
  let goalHalfHeight = this.textures.get("goal").frames.__BASE.halfHeight;
  this.goal = {
    width: this.textures.get("goal").frames.__BASE.width,
    height: this.textures.get("goal").frames.__BASE.height,
    left: this.matter.add.rectangle(goalHalfWidth, this.ground.level - goalHalfHeight, 45, 96, {
      isSensor: true,
      isStatic: true,
      label: "left"
    }),
    right: this.matter.add.rectangle(this.scale.width - goalHalfWidth, this.ground.level - goalHalfHeight, 45, 96, {
      isSensor: true,
      isStatic: true,
      label: "right"
    })
  };

  this.add.image(0, this.ground.level - this.goal.height, "goal").setOrigin(0, 0);
  this.add
    .image(this.scale.width, this.ground.level - this.goal.height, "goal")
    .setOrigin(0, 0)
    .setScale(-1, 1);

  // Cria as traves
  this.matter.add.rectangle(this.goal.width / 2, this.ground.level - this.goal.height + 2, this.goal.width, 3, {
    isStatic: true
  });
  this.matter.add.rectangle(this.scale.width - this.goal.width / 2, this.ground.level - this.goal.height + 2, this.goal.width, 3, {
    isStatic: true
  });

  // Adiciona o botão de tela cheia
  const fullscreenButton = this.add
    .image(this.scale.width - 16, 16, "fullscreen", 0)
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

gameScene.update = function() {
  // Função para atualizar os jogadores
  this.player.right.update();
  this.player.left.update();

  // Função para verificar se a bola entrou no gol
  checkGoal();

  // Atualiza o tempo
  if (this.isTimeGamemode) {
    let timeRemaining = 120 - Math.round(this.time.event.getElapsedSeconds());
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = Math.round(timeRemaining % 60);
    seconds = (seconds < 10 ? "0" : "") + seconds;
    this.time.text.setText(minutes + ":" + seconds);
  }

  //getLastTouch();
  //getPowerUp();
};

function checkGoal() {
  // Evento que verifica a colisão entre os gols e a bola
  gameScene.matterCollision.addOnCollideActive({
    objectA: gameScene.ball,
    objectB: [gameScene.goal.left, gameScene.goal.right],
    callback: eventData => {
      let ballHalfWidth = gameScene.ball.width / 2;
      // Caso a bola entre no gol esquerdo
      if (eventData.bodyB.label === "left") {
        // Se a bola ficar em cima do gol, rola ela pra baixo
        if (Math.round(gameScene.ball.y) === gameScene.ground.level - gameScene.goal.height + 1 - ballHalfWidth) {
          gameScene.ball.setAngularVelocity(0.1);
        }
        // Se a bola tiver passado de certa posição, conta o gol
        if (gameScene.ball.x <= gameScene.goal.width - ballHalfWidth && gameScene.ball.y >= gameScene.ground.level - gameScene.goal.height + 3) {
          gameScene.score.right++;
          gameScene.score.text.setText(gameScene.score.left + " - " + gameScene.score.right);
          // O argumento da função define o lado que a bola vai após o gol
          resetMatch(-5);
        }
      } // Caso a bola entre no gol direito
      else {
        if (Math.round(gameScene.ball.y) === gameScene.ground.level - gameScene.goal.height + 1 - ballHalfWidth) {
          gameScene.ball.setAngularVelocity(-0.1);
        }
        if (gameScene.ball.x >= gameScene.scale.width - gameScene.goal.width + ballHalfWidth && gameScene.ball.y >= gameScene.ground.level - gameScene.goal.height + 3) {
          gameScene.score.left++;
          gameScene.score.text.setText(gameScene.score.left + " - " + gameScene.score.right);
          resetMatch(5);
        }
      }
    }
  });

  if ((gameScene.score.left >= 10 || gameScene.score.right >= 10) && gameScene.isGoalGamemode) {
    endGame();
  }
}

function resetMatch(ballVelocity) {
  // Posiciona os jogadores e a bola em suas posições iniciais
  let playerHalfHeight = gameScene.player.left.sprite.height / 2;
  gameScene.player.left.sprite.setPosition(100, gameScene.ground.level - playerHalfHeight).setVelocity(0, 0);
  gameScene.player.right.sprite.setPosition(gameScene.scale.width - 100, gameScene.ground.level - playerHalfHeight).setVelocity(0, 0);
  gameScene.ball
    .setPosition(gameScene.scale.width / 2, gameScene.scale.height / 2)
    .setVelocity(ballVelocity, 0)
    .setAngularVelocity(0)
    .setRotation(0);
}

/*
function addPowerUp() {
  if (powerUp.active) {
    powerUp.destroy();
    gameScene.time.addEvent({
      delay: 5000,
      callback: addPowerUp,
      callbackScope: this
    });
  } else {
    let min = { x: 100, y: 450 };
    let max = { x: 700, y: 400 };
    let randomX = Math.floor(Math.random() * (max.x - min.x + 1) + min.x);
    let randomY = Math.floor(Math.random() * (max.y - min.y + 1) + min.y);
    powerUp = gameScene.matter.add
      .image(randomX, randomY, "ball")
      .setCircle()
      .setIgnoreGravity(true)
      .setSensor(true);
    gameScene.time.addEvent({
      delay: 15000,
      callback: addPowerUp,
      callbackScope: this
    });
  }
}

function getPowerUp() {
  if (powerUp.active) {
    gameScene.matterCollision.addOnCollideStart({
      objectA: gameScene.ball,
      objectB: powerUp,
      callback: () => {
        powerUp.destroy();
        console.log(lastTouch);
      }
    });
  }
}

function getLastTouch() {
  gameScene.matterCollision.addOnCollideStart({
    objectA: gameScene.ball,
    objectB: [player.left.sprite, player.right.sprite, player.left.sprite.foot.left, player.left.sprite.foot.right, player.right.sprite.foot.left, player.right.sprite.foot.right],
    callback: eventData => {
      lastTouch = eventData.bodyB.label;
    }
  });
}
*/

function endGame() {}

export { gameScene };
