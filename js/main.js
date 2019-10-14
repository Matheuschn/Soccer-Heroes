// Importando e exportando classes e variáveis necessárias
import Player from "./player.js";

export { ground };

export { groundCollision };
export { playerCollision };
export { ballCollision };

// Configurando a instância do Phaser
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "matter", // Define a engine de física MatterJS
    matter: {
      debug: true
    }
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // Plugin para facilitar as colisões no Matter
        key: "matterCollision",
        mapping: "matterCollision"
      }
    ]
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

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

var game = new Phaser.Game(config);

function preload() {
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
}

function create() {
  // Adiciona o fundo e define o mundo de acordo com a resolução
  this.add.image(0, 0, "sky").setOrigin(0, 0);
  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);

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
    .sprite(400, 400, "ball")
    .setMass(5)
    .setCircle(7)
    .setScale(2)
    .setBounce(1)
    .setCollisionCategory(ballCollision)
    .setCollidesWith([groundCollision, playerCollision]);

  // Cria a hitbox do gol esquerdo e adiciona uma imagem. É melhor fazer assim
  // do que criar um sprite, por causa da colisão.
  // *LEMBRAR DE DEFINIR OS GOLS COMO OBJETOS NO PRÓXIMO COMMIT*
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
  this.matter.add.rectangle(23, 440, 45, 3, { isStatic: true });
  this.matter.add.rectangle(777, 440, 45, 3, { isStatic: true });
}

function update() {
  playerRight.update();
  playerLeft.update();

  // Função para verificar se a bola entrou no gol
  checkGoal.call(this);

  if (RKey.isDown) {
    resetMatch();
  }
}

function checkGoal() {
  // Evento que verifica a colisão entre o gol esquerdo e a bola
  this.matterCollision.addOnCollideActive({
    objectA: goalLeft,
    objectB: ball,
    callback: () => {
      // Se a bola tiver passado de certa posição
      if (ball.x <= 31 && ball.y >= 443) {
        scoreRight++;
        scoreText.setText(scoreLeft + " - " + scoreRight);
        resetMatch();
      }
    }
  });
  // Mesmo evento, mas com o gol direito
  this.matterCollision.addOnCollideActive({
    objectA: goalRight,
    objectB: ball,
    callback: () => {
      if (ball.x >= 769 && ball.y >= 443) {
        scoreLeft++;
        scoreText.setText(scoreLeft + " - " + scoreRight);
        resetMatch();
      }
    }
  });
}

function resetMatch() {
  playerLeft.sprite.setPosition(100, 512).setVelocity(0, 0);
  playerRight.sprite.setPosition(700, 512).setVelocity(0, 0);
  ball
    .setPosition(400, 522)
    .setVelocity(0, 0)
    .setRotation(0);
}
