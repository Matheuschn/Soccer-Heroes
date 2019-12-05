// Importa a próxima cena
import { gameoverScene } from "./gameover.js";

// Importa a classe para criação do jogador e da arquibancada
import Player from "./player.js";
import Arquibancada from "./arquibancada.js";

var timer;
// Cria a cena do jogo
const gameScene = new Phaser.Scene("gameScene");

// A função init recebe a informação sobre o modo de jogo
gameScene.init = function(data) {
  this.isTimeGamemode = data.isTimeGamemode;
  this.isGoalGamemode = data.isGoalGamemode;
};

gameScene.preload = function() {
  // Carrega as imagens e sons que serão usados.
  this.load.audio("musica", "assets/sounds/musica.mp3");
  this.load.audio("whistle", "assets/sounds/whistle.mp3");
  this.load.audio("goalsound", "assets/sounds/goalsound.mp3");
  this.load.audio("over", "assets/sounds/over.mp3");

  this.load.image("sky", "assets/images/sky.png");
  this.load.image("ground", "assets/images/ground.png");
  this.load.image("ball", "assets/images/ball.png");
  this.load.image("adboard", "assets/images/adboard.png");
  this.load.image("goal", "assets/images/goal.png");
  this.load.image("goalimage", "assets/images/goalimage.png");

  this.load.spritesheet("arquibancada", "assets/sprites/arquibancada.png", {
    frameWidth: 988,
    frameHeight: 384
  });
  this.load.spritesheet("nino", "assets/sprites/nino.png", {
    frameWidth: 51,
    frameHeight: 48
  });
  this.load.spritesheet("preto", "assets/sprites/preto.png", {
    frameWidth: 51,
    frameHeight: 48
  });
  this.load.spritesheet("fullscreen", "assets/sprites/fullscreen.png", {
    frameWidth: 64,
    frameHeight: 64
  });
};

gameScene.create = function() {
  // Adiciona música de fundo
  this.music = this.sound.add("musica");
  this.music.setLoop(true).play();

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
  this.ground.level = this.ground.body.bounds.min.y;

  // Adiciona a publicidade
  let adHalfHeight = this.textures.get("adboard").frames.__BASE.halfHeight;
  let adboard = this.add.image(this.scale.width / 2, this.ground.level - adHalfHeight, "adboard");

  // Cria a arquibancada
  this.arquibancada = new Arquibancada(this, this.scale.width / 2, this.ground.level - adboard.height - 192);

  // Adiciona o placar
  this.score = {
    left: 0,
    right: 0,
    text: this.add.text(this.scale.width / 2 - 48, 16, "0 - 0", {
      fontSize: "32px",
      fill: "#000"
    })
  };

  // Adiciona o timer
  if (this.isTimeGamemode) {
    timer = {
      text: this.add.text(this.scale.width / 2 - 36, 48, "2:00", {
        fontSize: "32px",
        fill: "#000"
      }),
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
  this.ball = this.matter.add
    .sprite(this.scale.width / 2, this.ground.level - ballHalfWidth, "ball")
    .setMass(5)
    .setCircle()
    .setBounce(0.9)
    .setCollisionCategory(this.collision.ballCollision)
    .setCollidesWith([this.collision.groundCollision, this.collision.playerCollision]);

  // Cria as hitboxes dos gols. É melhor fazer assim
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
  // Variável que define se ocorreu um gol
  this.isGoal = false;

  // Adiciona as imagens dos gols
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

  // Adiciona a imagem de gol
  this.goal.image = this.add
    .image(this.scale.width / 2, this.scale.height / 2, "goalimage")
    .setVisible(false)
    .setScale(1.5);
};

gameScene.update = function() {
  // Função para atualizar os jogadores
  this.player.right.update();
  this.player.left.update();

  // Função para verificar se a bola entrou no gol
  checkGoal();

  // Atualiza o tempo
  if (this.isTimeGamemode) {
    let timeRemaining = 120 - Math.round(timer.event.getElapsedSeconds());
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = Math.round(timeRemaining % 60);
    seconds = (seconds < 10 ? "0" : "") + seconds;
    timer.text.setText(minutes + ":" + seconds);
  }
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
          if (gameScene.isGoal === false) {
            // A variável isGoal é true pra mostrar que ocorreu um gol
            gameScene.isGoal = true;
            // Adiciona o gol no placar, mostra a imagem do gol e toca o apito
            gameScene.score.right++;
            gameScene.score.text.setText(gameScene.score.left + " - " + gameScene.score.right);
            gameScene.goal.image.setVisible(true);
            gameScene.sound.add("whistle").play();
            gameScene.sound.add("goalsound").play();
            // A arquibancada faz a ola e depois de acabar, reseta a partida
            gameScene.arquibancada.ola();
            gameScene.time.delayedCall(1900, resetMatch, [-5], this);
          }
        }
      } // Caso a bola entre no gol direito
      else {
        if (Math.round(gameScene.ball.y) === gameScene.ground.level - gameScene.goal.height + 1 - ballHalfWidth) {
          gameScene.ball.setAngularVelocity(-0.1);
        }
        if (gameScene.ball.x >= gameScene.scale.width - gameScene.goal.width + ballHalfWidth && gameScene.ball.y >= gameScene.ground.level - gameScene.goal.height + 3) {
          if (gameScene.isGoal === false) {
            gameScene.isGoal = true;
            gameScene.score.left++;
            gameScene.score.text.setText(gameScene.score.left + " - " + gameScene.score.right);
            gameScene.goal.image.setVisible(true);
            gameScene.sound.add("whistle").play();
            gameScene.sound.add("goalsound").play();

            gameScene.arquibancada.ola();
            gameScene.time.delayedCall(1900, resetMatch, [5], this);
          }
        }
      }
    }
  });
}

function resetMatch(ballVelocity) {
  // Caso o modo de jogo seja de gols, acaba o jogo quando atingir 10
  if ((gameScene.score.left >= 10 || gameScene.score.right >= 10) && gameScene.isGoalGamemode) {
    gameScene.goal.image.setVisible(false);
    endGame();
  } else {
    // Posiciona os jogadores e a bola em suas posições iniciais
    let playerHalfHeight = gameScene.player.left.sprite.height / 2;
    gameScene.player.left.sprite.setPosition(100, gameScene.ground.level - playerHalfHeight).setVelocity(0, 0);
    gameScene.player.right.sprite.setPosition(gameScene.scale.width - 100, gameScene.ground.level - playerHalfHeight).setVelocity(0, 0);
    gameScene.ball
      .setPosition(gameScene.scale.width / 2, gameScene.scale.height / 2)
      .setVelocity(ballVelocity, 0)
      .setAngularVelocity(0)
      .setRotation(0);
    // Reseta a variável isGoal e remove a imagem da tela
    gameScene.goal.image.setVisible(false);
    gameScene.isGoal = false;
  }
}

function endGame() {
  // Quando acabar o jogo, parar a música e apitar duas vezes
  gameScene.music.stop();
  gameScene.sound.add("over").play();
  gameScene.sound.add("whistle").play();
  gameScene.time.delayedCall(1000, () => gameScene.sound.add("whistle").play(), this);

  // Ao definar o gol como true, para o jogo
  gameScene.isGoal = true;

  // Após 3 segundos, mostra a cena de gameOver
  gameScene.time.delayedCall(3000, () => gameScene.scene.start(gameoverScene), this);
}

export { gameScene };
