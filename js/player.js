import { ground } from "./main.js";

import { groundCollision } from "./main.js";
import { playerCollision } from "./main.js";
import { ballCollision } from "./main.js";

var cursors;
var WKey;
var AKey;
var DKey;
var SpaceKey;
var EnterKey;

export default class Player {
  // Cria o objeto Player
  constructor(scene, x, y, name) {
    this.scene = scene;

    // Cria as animações para o movimento do jogador
    const anims = scene.anims;
    anims.create({
      key: "left",
      frames: anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 4 }],
      frameRate: 20
    });
    anims.create({
      key: "right",
      frames: anims.generateFrameNumbers("player", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    // Adiciona o sprite e armazena o nome
    this.sprite = scene.matter.add.sprite(x, y, "player", 0);
    this.sprite.name = name;

    // Variável para verificar o lado que o jogador está virado
    this.sprite.facing = {
      left: false,
      right: false
    };
    if (this.sprite.name === "playerLeft") this.sprite.facing.right = true;
    if (this.sprite.name === "playerRight") this.sprite.facing.left = true;

    // Cria o corpo arredondado do jogador. Esse corpo pode ser substituído
    // por um outro com uma hitbox mais elaborada
    this.sprite.playerBody = Phaser.Physics.Matter.Matter.Bodies.rectangle(
      x,
      y,
      32,
      48,
      {
        chamfer: { radius: 10 }
      }
    );

    // Cria o pé do joagdor
    this.sprite.foot = {
      left: scene.matter.add.rectangle(x, y, 30, 12, {
        chamfer: { radius: 5 }
      }),
      right: scene.matter.add.rectangle(x, y, 30, 12, {
        chamfer: { radius: 5 }
      })
    };
    this.sprite.foot.left.collisionFilter.mask = groundCollision;
    this.sprite.foot.right.collisionFilter.mask = groundCollision;

    // Define algumas configurações do sprite
    this.sprite
      .setExistingBody(this.sprite.playerBody)
      .setMass(100)
      .setFixedRotation(0)
      .setCollisionCategory(playerCollision)
      .setCollidesWith([groundCollision, playerCollision, ballCollision]);

    // Adiciona um ponto de dobra entre o pé e o corpo
    scene.matter.add.constraint(this.sprite, this.sprite.foot.left, 0, 0.5, {
      pointA: { x: -16, y: 24 },
      pointB: { x: -15, y: 0 }
    });
    scene.matter.add.constraint(this.sprite, this.sprite.foot.right, 0, 0.5, {
      pointA: { x: 16, y: 24 },
      pointB: { x: -15, y: 0 }
    });

    // Define as teclas para o movimento
    cursors = scene.input.keyboard.createCursorKeys();
    WKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    AKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    DKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    SpaceKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    EnterKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
  }

  update() {
    // Remove a velocidade angular do pé, fazendo ele ficar parado.
    // Tentei fazer isso colocando a inércia como infinito, mas dá problema
    Phaser.Physics.Matter.Matter.Body.setAngularVelocity(
      this.sprite.foot.left,
      0
    );
    Phaser.Physics.Matter.Matter.Body.setAngularVelocity(
      this.sprite.foot.right,
      0
    );

    // Define o ângulo do pé, fixando ele pra baixo
    Phaser.Physics.Matter.Matter.Body.setAngle(
      this.sprite.foot.left,
      Math.PI / 2
    );
    Phaser.Physics.Matter.Matter.Body.setAngle(
      this.sprite.foot.right,
      Math.PI / 2
    );

    // Retira a colisão do pé
    this.sprite.foot.left.collisionFilter.mask = groundCollision;
    this.sprite.foot.right.collisionFilter.mask = groundCollision;

    this.move();
  }

  move() {
    // Define o que fazer ao pressionar as teclas de movimento
    if (this.sprite.name === "playerRight") {
      if (cursors.left.isDown) {
        this.sprite.setVelocityX(-3);
        this.sprite.anims.play("left", true);

        this.sprite.facing.left = true;
        this.sprite.facing.right = false;
      } else if (cursors.right.isDown) {
        this.sprite.setVelocityX(3);
        this.sprite.anims.play("right", true);

        this.sprite.facing.left = false;
        this.sprite.facing.right = true;
      } else {
        this.sprite.setVelocityX(0);
        this.sprite.anims.play("turn");
      }

      if (EnterKey.isDown) {
        this.kick();
      }

      // Só deixa o jogador pular caso ele esteja tocando o chão
      this.scene.matterCollision.addOnCollideActive({
        objectA: this.sprite,
        objectB: ground,
        callback: () => {
          if (cursors.up.isDown) {
            this.sprite.setVelocityY(-7);
          }
        }
      });
    } else if (this.sprite.name === "playerLeft") {
      if (AKey.isDown) {
        this.sprite.setVelocityX(-3);
        this.sprite.anims.play("left", true);

        this.sprite.facing.left = true;
        this.sprite.facing.right = false;
      } else if (DKey.isDown) {
        this.sprite.setVelocityX(3);
        this.sprite.anims.play("right", true);

        this.sprite.facing.left = false;
        this.sprite.facing.right = true;
      } else {
        this.sprite.setVelocityX(0);
        this.sprite.anims.play("turn");
      }

      if (SpaceKey.isDown) {
        this.kick();
      }

      this.scene.matterCollision.addOnCollideActive({
        objectA: this.sprite,
        objectB: ground,
        callback: () => {
          if (WKey.isDown) {
            this.sprite.setVelocityY(-7);
          }
        }
      });
    }
  }

  kick() {
    // Verfica qual pé do jogador deve levantar para o chute
    if (this.sprite.facing.left) {
      this.sprite.foot.left.collisionFilter.mask = 0x0008;
      Phaser.Physics.Matter.Matter.Body.setAngle(this.sprite.foot.left, 3.92);
    } else if (this.sprite.facing.right) {
      this.sprite.foot.right.collisionFilter.mask = 0x0008;
      Phaser.Physics.Matter.Matter.Body.setAngle(this.sprite.foot.right, 5.49);
    }
  }
}
