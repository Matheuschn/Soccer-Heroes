// Importa todas cenas do jogo
import { startScene } from "./start.js";
import { gameScene } from "./main.js";
import { menuScene } from "./menu.js";
import { gameoverScene } from "./gameover.js";

// Configurando a instância do Phaser
let config = {
  type: Phaser.CANVAS,
  width: 1366,
  height: 768,
  backgroundColor: "#f3cca3",
  physics: {
    default: "matter", // Define a engine de física MatterJS
    matter: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1366,
    height: 768
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
  scene: [startScene, menuScene, gameScene, gameoverScene]
};

// Inicia o jogo com as configurações definidas acima
new Phaser.Game(config);
