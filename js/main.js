import Player from "./player.js";

export { ground };

export { groundCollision };
export { playerCollision };
export { ballCollision };

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "matter",
    matter: {
      debug: true
    }
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
      }
    ]
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

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

  RKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

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

  goalLeft = this.matter.add.rectangle(23, 488, 45, 96, {
    isSensor: true,
    isStatic: true
  });
  this.add.image(0, 440, "goal").setOrigin(0, 0);

  goalRight = this.matter.add.rectangle(777, 488, 45, 96, {
    isSensor: true,
    isStatic: true
  });
  this.add
    .image(800, 440, "goal")
    .setOrigin(0, 0)
    .setScale(-1, 1);

  this.matter.add.rectangle(23, 440, 45, 3, { isStatic: true });
  this.matter.add.rectangle(777, 440, 45, 3, {
    isStatic: true
  });
}

function update() {
  playerRight.update();
  playerLeft.update();

  checkGoal.call(this);

  if (RKey.isDown) {
    resetMatch();
  }
}

function checkGoal() {
  this.matterCollision.addOnCollideActive({
    objectA: goalLeft,
    objectB: ball,
    callback: () => {
      if (ball.x <= 31 && ball.y >= 443) {
        scoreRight++;
        scoreText.setText(scoreLeft + " - " + scoreRight);
        resetMatch();
      }
    }
  });
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
