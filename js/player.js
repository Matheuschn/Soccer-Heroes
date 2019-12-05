export default class Player {
  // Cria o objeto Player
  constructor(scene, x, y, name) {
    this.scene = scene;

    // Cria as animaÃ§Ãµes para o movimento do jogador
    const anims = scene.anims;
    anims.create({
      key: "leftnino",
      frames: anims.generateFrameNumbers("nino", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "rightnino",
      frames: anims.generateFrameNumbers("nino", { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "turnleftnino",
      frames: [{ key: "nino", frame: 0 }],
      frameRate: 20
    });
    anims.create({
      key: "turnrightnino",
      frames: [{ key: "nino", frame: 4 }],
      frameRate: 20
    });

    anims.create({
      key: "leftpreto",
      frames: anims.generateFrameNumbers("preto", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "rightpreto",
      frames: anims.generateFrameNumbers("preto", { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "turnleftpreto",
      frames: [{ key: "preto", frame: 0 }],
      frameRate: 20
    });
    anims.create({
      key: "turnrightpreto",
      frames: [{ key: "preto", frame: 4 }],
      frameRate: 20
    });

    // Adiciona o sprite e armazena o nome
    this.sprite = scene.matter.add.sprite(x, y, this.spritesheet, 0);
    this.sprite.name = name;

    // VariÃ¡vel para verificar o lado que o jogador estÃ¡ virado
    this.sprite.facing = {
      left: false,
      right: false
    };

    if (this.sprite.name === "playerLeft") this.sprite.facing.right = true;
    if (this.sprite.name === "playerRight") this.sprite.facing.left = true;

    // Cria o corpo arredondado do jogador. Esse corpo pode ser substituÃ­do
    // por um outro com uma hitbox mais elaborada
    this.sprite.playerBody = Phaser.Physics.Matter.Matter.Bodies.rectangle(x, y, 30, 48, {
      chamfer: { radius: 10 },
      label: name
    });

    // Cria o pÃ© do joagdor
    this.sprite.foot = {
      left: scene.matter.add.rectangle(x, y, 30, 12, {
        chamfer: { radius: 5 },
        label: name
      }),
      right: scene.matter.add.rectangle(x, y, 30, 12, {
        chamfer: { radius: 5 },
        label: name
      })
    };

    // Define algumas configuraÃ§Ãµes do sprite
    this.sprite
      .setExistingBody(this.sprite.playerBody)
      .setMass(100)
      .setFixedRotation(0)
      .setOrigin(0.5, 0.5)
      .setCollisionCategory(this.scene.collision.playerCollision)
      .setCollidesWith([this.scene.collision.groundCollision, this.scene.collision.playerCollision, this.scene.collision.ballCollision]);

    // Adiciona um ponto de dobra entre o pÃ© e o corpo
    scene.matter.add.constraint(this.sprite, this.sprite.foot.left, 0, 0.5, {
      pointA: { x: -12, y: 24 },
      pointB: { x: -15, y: 0 }
    });
    scene.matter.add.constraint(this.sprite, this.sprite.foot.right, 0, 0.5, {
      pointA: { x: 12, y: 24 },
      pointB: { x: -15, y: 0 }
    });

    // Define as teclas para o movimento
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = {
      W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      enter: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    };
  }

  update() {
    // Remove a velocidade angular do pÃ©, fazendo ele ficar parado.
    // Tentei fazer isso colocando a inÃ©rcia como infinito, mas dÃ¡ problema
    Phaser.Physics.Matter.Matter.Body.setAngularVelocity(this.sprite.foot.left, 0);
    Phaser.Physics.Matter.Matter.Body.setAngularVelocity(this.sprite.foot.right, 0);

    // Define o Ã¢ngulo do pÃ©, fixando ele pra baixo
    Phaser.Physics.Matter.Matter.Body.setAngle(this.sprite.foot.left, Math.PI / 2);
    Phaser.Physics.Matter.Matter.Body.setAngle(this.sprite.foot.right, Math.PI / 2);

    // Retira a colisÃ£o do pÃ©
    this.sprite.foot.left.collisionFilter.mask = this.scene.collision.groundCollision;
    this.sprite.foot.right.collisionFilter.mask = this.scene.collision.groundCollision;

    this.move();
  }

  move() {
    // Define o que fazer ao pressionar as teclas de movimento
    if (this.sprite.name === "playerRight") {
      if (this.cursors.left.isDown) {
        this.sprite.setVelocityX(-3);
        this.sprite.anims.play("leftpreto", true);

        this.sprite.facing.left = true;
        this.sprite.facing.right = false;
      } else if (this.cursors.right.isDown) {
        this.sprite.setVelocityX(3);
        this.sprite.anims.play("rightpreto", true);

        this.sprite.facing.left = false;
        this.sprite.facing.right = true;
      } else {
        this.sprite.setVelocityX(0);
        if (this.sprite.facing.left) {
          this.sprite.anims.play("turnleftpreto");
        } else {
          this.sprite.anims.play("turnrightpreto");
        }
      }

      let scene = this;
      this.keys.enter.on("down", function(event) {
        scene.kick();
      });

      // SÃ³ deixa o jogador pular caso ele esteja tocando o chÃ£o
      this.scene.matterCollision.addOnCollideActive({
        objectA: this.sprite,
        objectB: this.scene.ground,
        callback: () => {
          if (this.cursors.up.isDown) {
            this.sprite.setVelocityY(-7);
          }
        }
      });
    } else if (this.sprite.name === "playerLeft") {
      if (this.keys.A.isDown) {
        this.sprite.setVelocityX(-3);
        this.sprite.anims.play("leftnino", true);

        this.sprite.facing.left = true;
        this.sprite.facing.right = false;
      } else if (this.keys.D.isDown) {
        this.sprite.setVelocityX(3);
        this.sprite.anims.play("rightnino", true);

        this.sprite.facing.left = false;
        this.sprite.facing.right = true;
      } else {
        this.sprite.setVelocityX(0);
        if (this.sprite.facing.left) {
          this.sprite.anims.play("turnleftnino");
        } else {
          this.sprite.anims.play("turnrightnino");
        }
      }

      let scene = this;
      this.keys.space.on("down", function(event) {
        scene.kick();
      });

      this.scene.matterCollision.addOnCollideActive({
        objectA: this.sprite,
        objectB: this.scene.ground,
        callback: () => {
          if (this.keys.W.isDown) {
            this.sprite.setVelocityY(-7);
          }
        }
      });
    }
  }

  kick() {
    // Verfica qual pÃ© do jogador deve levantar para o chute
    if (this.sprite.facing.left) {
      this.sprite.foot.left.collisionFilter.mask = 0x0008;
      Phaser.Physics.Matter.Matter.Body.setAngle(this.sprite.foot.left, 3.92);
    } else if (this.sprite.facing.right) {
      this.sprite.foot.right.collisionFilter.mask = 0x0008;
      Phaser.Physics.Matter.Matter.Body.setAngle(this.sprite.foot.right, 5.49);
    }
  }
}
