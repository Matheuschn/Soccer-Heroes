import { MainScene } from "./main.js";

// Configurando a instância do Phaser
const config = {
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
  scene: MainScene
};

new Phaser.Game(config);
