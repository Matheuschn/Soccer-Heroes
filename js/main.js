// Importa a classe para criação do jogador
import Player from "./player.js";

// Define bitfields para as categorias de colisão
var collision = {
  groundCollision: 0x0001,
  playerCollision: 0x0004,
  ballCollision: 0x0008
};

var score = { left: 0, right: 0, text: null };
var goal = { left: null, right: null };
var player = { left: null, right: null };

var keys = {
  W: null,
  A: null,
  D: null,
  R: null,
  space: null,
  enter: null
};

var ground;
var ball;

// Cria a cena principal
var mainScene = new Phaser.Scene("mainScene");

mainScene.preload = function() {
  // Carrega as imagens que serão usadas.
  // A imagem da trave (post) não é carregada pro retângulo permanecer invisível,
  // o que causa um erro 404 no console. Isso é intencional e não afeta a execução.
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("ball", "assets/ball.png");
  this.load.spritesheet("player", "assets/player.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image("goal", "assets/goal.png");
  this.load.spritesheet("fullscreen", "assets/fullscreen.png", {
    frameWidth: 64,
    frameHeight: 64
  });
};

mainScene.create = function() {
  // Adiciona o fundo e define o mundo de acordo com a resolução
  this.add.image(0, 0, "sky").setOrigin(0, 0);
  this.matter.world.setBounds(0, 0, 800, 600);

  ground = this.matter.add
    .image(0, 600, "ground")
    .setScale(4)
    .setStatic(true);

  score.text = this.add.text(350, 16, "0 - 0", {
    fontSize: "32px",
    fill: "#000"
  });

  // Define a letra R, usada pra resetar o jogo em caso de bugs
  keys.R = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  // Define os dois jogadores como objetos, usando o arquivo player.js,
  // dessa forma, o código relacionado ao sprite fica todo no outro arquivo
  player.left = new Player(this, 100, 400, "playerLeft");
  player.right = new Player(this, 700, 400, "playerRight");

  ball = this.matter.add
    .sprite(400, 522, "ball")
    .setMass(5)
    .setCircle()
    .setBounce(0.9)
    .setCollisionCategory(collision.ballCollision)
    .setCollidesWith([collision.groundCollision, collision.playerCollision]);

  // Cria a hitbox do gol esquerdo e adiciona uma imagem. É melhor fazer assim
  // do que criar um sprite, por causa da colisão.
  goal.left = this.matter.add.rectangle(23, 488, 45, 96, {
    isSensor: true,
    isStatic: true,
    label: "left"
  });
  this.add.image(0, 440, "goal").setOrigin(0, 0);

  // Mesma coisa, só que com o gol direito, invertendo a imagem no eixo horizontal.
  goal.right = this.matter.add.rectangle(777, 488, 45, 96, {
    isSensor: true,
    isStatic: true,
    label: "right"
  });
  this.add
    .image(800, 440, "goal")
    .setOrigin(0, 0)
    .setScale(-1, 1);

  // Cria as traves
  this.matter.add.rectangle(23, 442, 45, 3, { isStatic: true });
  this.matter.add.rectangle(777, 442, 45, 3, { isStatic: true });

  const fullscreenButton = this.add
    .image(800 - 16, 16, "fullscreen", 0)
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
};

mainScene.update = function() {
  player.right.update();
  player.left.update();

  // Função para verificar se a bola entrou no gol
  checkGoal.call(this);

  if (keys.R.isDown) {
    resetMatch(0);
  }

  //var x = setInterval(addPowerUp.call(this), 10000);
};

function checkGoal() {
  // Evento que verifica a colisão entre os gols e a bola
  this.matterCollision.addOnCollideActive({
    objectA: ball,
    objectB: [goal.left, goal.right],
    callback: eventData => {
      // Caso a bola entre no gol esquerdo
      if (eventData.bodyB.label === "left") {
        // Se a bola ficar em cima do gol, rola ela pra baixo
        if (Math.round(ball.y) === 427) {
          ball.setAngularVelocity(0.1);
        }
        // Se a bola tiver passado de certa posição, conta o gol
        if (ball.x <= 31 && ball.y >= 443) {
          score.right++;
          score.text.setText(score.left + " - " + score.right);
          // O argumento da função define o lado que a bola vai após o gol
          resetMatch(-3);
        }
      } // Caso a bola entre no gol direito
      else {
        if (Math.round(ball.y) === 427) {
          ball.setAngularVelocity(-0.1);
        }
        if (ball.x >= 769 && ball.y >= 443) {
          score.left++;
          score.text.setText(score.left + " - " + score.right);
          resetMatch(3);
        }
      }
    }
  });
}

function resetMatch(ballVelocity) {
  player.left.sprite.setPosition(100, 512).setVelocity(0, 0);
  player.right.sprite.setPosition(700, 512).setVelocity(0, 0);
  ball
    .setPosition(400, 200)
    .setVelocity(ballVelocity, 0)
    .setAngularVelocity(0)
    .setRotation(0);
}

function addPowerUp() {
  let minX = 100;
  let maxX = 700;
  let minY = 400;
  let maxY = 350;
  let randomX = Math.floor(Math.random() * (maxX - minX + 1) + minX);
  let randomY = Math.floor(Math.random() * (maxY - minY + 1) + minY);
  var powerUp = this.add.image(randomX, randomY, "ball");
}

export { ground, collision, keys };

export { mainScene };
