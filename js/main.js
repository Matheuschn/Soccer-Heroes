// Importando e exportando classes e variáveis necessárias
import Player from "./player.js";

// Define um bitfield para os grupos de colisão
var groundCollision = 0x0001;
var playerCollision = 0x0004;
var ballCollision = 0x0008;

var ground;
var playerLeft;
var playerRight;
var ball;
var scoreLeft = 0;
var scoreRight = 0;
var goalLeft;
var goalRight;
var scoreText;
var RKey;

var MainScene = new Phaser.Scene("MainScene");

MainScene.preload = function() {
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
  this.load.image("post", "assets/post.png");
};

MainScene.create = function() {
  // Adiciona o fundo e define o mundo de acordo com a resolução
  this.add.image(0, 0, "sky").setOrigin(0, 0);
  this.matter.world.setBounds(0, 0, 800, 600);

  ground = this.matter.add
    .image(0, 600, "ground")
    .setScale(4)
    .setStatic(true);

  scoreText = this.add.text(350, 16, "0 - 0", {
    fontSize: "32px",
    fill: "#000"
  });

  // Define a letra R, usada pra resetar o jogo em caso de bugs
  RKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  // Define os dois jogadores como objetos, usando o arquivo player.js,
  // dessa forma, o código relacionado ao sprite fica todo no outro arquivo
  playerLeft = new Player(this, 100, 400, "playerLeft");
  playerRight = new Player(this, 700, 400, "playerRight");

  ball = this.matter.add
    .sprite(400, 522, "ball")
    .setMass(5)
    .setCircle()
    .setBounce(0.9)
    .setCollisionCategory(ballCollision)
    .setCollidesWith([groundCollision, playerCollision]);

  // Cria a hitbox do gol esquerdo e adiciona uma imagem. É melhor fazer assim
  // do que criar um sprite, por causa da colisão.
  goalLeft = this.matter.add.rectangle(23, 488, 45, 96, {
    isSensor: true,
    isStatic: true
  });
  this.add.image(0, 440, "goal").setOrigin(0, 0);

  // Mesma coisa, só que com o gol direito, invertendo a imagem no eixo horizontal.
  goalRight = this.matter.add.rectangle(777, 488, 45, 96, {
    isSensor: true,
    isStatic: true
  });
  this.add
    .image(800, 440, "goal")
    .setOrigin(0, 0)
    .setScale(-1, 1);

  // Cria as traves
  this.matter.add.rectangle(23, 442, 45, 3, { isStatic: true });
  this.matter.add.rectangle(777, 442, 45, 3, { isStatic: true });
};

MainScene.update = function() {
  playerRight.update();
  playerLeft.update();

  // Função para verificar se a bola entrou no gol
  checkGoal.call(this);

  if (RKey.isDown) {
    resetMatch(0);
  }

  //var x = setInterval(addPowerUp.call(this), 10000);
};

function checkGoal() {
  // Evento que verifica a colisão entre o gol esquerdo e a bola
  this.matterCollision.addOnCollideActive({
    objectA: goalLeft,
    objectB: ball,
    callback: () => {
      // Se a bola ficar em cima do gol, rola ela pra baixo
      if (Math.round(ball.y) === 427) {
        ball.setAngularVelocity(0.1);
      }
      // Se a bola tiver passado de certa posição, conta o gol
      if (ball.x <= 31 && ball.y >= 443) {
        scoreRight++;
        scoreText.setText(scoreLeft + " - " + scoreRight);
        // O número passado define o lado que a bola vai após o gol. Ela
        // sempre vai pro lado que leva o gol
        resetMatch(-3);
      }
    }
  });
  // Mesmo evento, mas com o gol direito
  this.matterCollision.addOnCollideActive({
    objectA: goalRight,
    objectB: ball,
    callback: () => {
      if (Math.round(ball.y) === 427) {
        ball.setAngularVelocity(-0.1);
      }

      if (ball.x >= 769 && ball.y >= 443) {
        scoreLeft++;
        scoreText.setText(scoreLeft + " - " + scoreRight);
        resetMatch(3);
      }
    }
  });
}

function resetMatch(ballVelocity) {
  playerLeft.sprite.setPosition(100, 512).setVelocity(0, 0);
  playerRight.sprite.setPosition(700, 512).setVelocity(0, 0);
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

export { MainScene };

export { ground };
export { groundCollision };
export { playerCollision };
export { ballCollision };
