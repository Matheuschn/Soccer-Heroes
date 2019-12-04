export default class Arquibancada {
  // Cria o objeto da arquibancada
  constructor(scene, x, y) {
    this.scene = scene;

    // Cria a animação
    const anims = scene.anims;
    anims.create({
      key: "ola",
      frames: anims.generateFrameNumbers("arquibancada", { start: 5, end: 23 }),
      frameRate: 10
    });
    anims.create({
      key: "idle",
      frames: anims.generateFrameNumbers("arquibancada", { start: 0, end: 4 }),
      frameRate: 4,
      repeat: -1
    });

    // Adiciona o sprite como estático e sem interação (sensor)
    this.sprite = scene.matter.add.sprite(x, y, "arquibancada", 0, {
      isStatic: true,
      isSensor: true
    });

    // Roda a animação padrão
    this.sprite.anims.play("idle", true);
  }

  ola() {
    // Roda a animação de ola e quando acabar, roda a padrão novamente
    this.sprite.anims.play("ola").on("animationcomplete", () => {
      this.sprite.anims.play("idle", true);
    });
  }
}
