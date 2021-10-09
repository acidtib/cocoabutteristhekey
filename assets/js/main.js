var DEBUG = false;
var SPEED = 180;
var GRAVITY = 18;
var FLAP = 420;
var SPAWN_RATE = 1 / 1.2;
var OPENING = 144;

function init(parent) {

var state = {
    preload: preload,
    create: create,
    update: update,
    render: render
};

var game = new Phaser.Game(
    480,
    700,
    Phaser.CANVAS,
    parent,
    state,
    false,
    false
);

function preload() {
    var assets = {
        spritesheet: {
            birdie: ['assets/images/vv.png', 33, 24],
            clouds: ['assets/images/clouds.png', 128, 64]
        },
        image: {
            key: ['assets/images/key.png'],
            cocoabutter: ['assets/images/cocoabutter.png'],
            ocean: ['assets/images/ocean.png']
        },
        audio: {
            flap: ['assets/audio/jetskinoises.mp3', 'assets/audio/flap.ogg'],
            score: ['assets/audio/blessup.mp3', 'assets/audio/score.ogg'],
            hurt: ['assets/audio/hurt.mp3', 'assets/audio/hurt.ogg'],
            anotherone: ['assets/audio/anotherone.mp3'],
            jetski: ['assets/audio/jetski.mp3']
        }
    };
    Object.keys(assets).forEach(function(type) {
        Object.keys(assets[type]).forEach(function(id) {
            game.load[type].apply(game.load, [id].concat(assets[type][id]));
        });
    });
}

var gameStarted,
    gameOver,
    score,
    bg,
    credits,
    clouds,
    keys,
    invs,
    birdie,
    ocean,
    scoreText,
    instText,
    gameOverText,
    flapSnd,
    scoreSnd,
    hurtSnd,
    anotheroneSnd,
    jetskiSnd,
    keysTimer,
    cloudsTimer,
    cobraMode = 0,
    gameOvers = 0;

function create() {
    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setScreenSize(true);
    // Draw bg
    bg = game.add.graphics(0, 0);
    bg.beginFill(0x81D4F4, 1);
    bg.drawRect(0, 0, game.world.width, game.world.height);
    bg.endFill();
    // Credits 'yo
    credits = game.add.text(
        game.world.width / 2,
        10,
        'Created By:\n\n @acidtib_ @hellomaisari',
        {
            font: '12px "Press Start 2P"',
            fill: '#000000',
            align: 'center'
        }
    );
    credits.anchor.x = 0.5;
    // Add ocean
    ocean = game.add.tileSprite(0, game.world.height - 360, game.world.width, 360, 'ocean');
    ocean.tileScale.setTo(2, 2);
    // Add clouds group
    clouds = game.add.group();
    // Add keys
    keys = game.add.group();
    // Add invisible thingies
    invs = game.add.group();
    // Add birdie
    birdie = game.add.sprite(0, 0, 'birdie');
    birdie.anchor.setTo(0.5, 0.5);
    birdie.animations.add('fly', [0], 10, true);
    birdie.animations.add('cobra', [0], 10, false);
    birdie.inputEnabled = true;
    birdie.body.collideWorldBounds = true;
    birdie.body.gravity.y = GRAVITY;

    // Add score text
    scoreText = game.add.text(
        game.world.width / 2,
        game.world.height / 4,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#fff',
            stroke: '#430',
            strokeThickness: 4,
            align: 'center'
        }
    );
    scoreText.anchor.setTo(0.5, 0.5);
    // Add instructions text
    instText = game.add.text(
        game.world.width / 2,
        game.world.height - game.world.height / 4,
        "",
        {
            font: '8px "Press Start 2P"',
            fill: '#fff',
            stroke: '#430',
            strokeThickness: 4,
            align: 'center'
        }
    );
    instText.anchor.setTo(0.5, 0.5);
    // Add game over text
    gameOverText = game.add.text(
        game.world.width / 2,
        game.world.height / 2,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#fff',
            stroke: '#430',
            strokeThickness: 4,
            align: 'center'
        }
    );
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(2, 2);
    // Add sounds
    flapSnd = game.add.audio('flap');
    scoreSnd = game.add.audio('score');
    hurtSnd = game.add.audio('hurt');
    anotheroneSnd = game.add.audio('anotherone');
    jetskiSnd = game.add.audio('jetski');
    // Add controls
    game.input.onDown.add(flap);
    game.input.keyboard.addCallbacks(game, onKeyDown, onKeyUp);
    // Start clouds timer
    cloudsTimer = new Phaser.Timer(game);
    cloudsTimer.onEvent.add(spawnCloud);
    cloudsTimer.start();
    cloudsTimer.add(Math.random());
    // RESET!
    reset();
}

function reset() {
    gameStarted = false;
    gameOver = false;
    score = 0;
    credits.renderable = true;
    scoreText.setText("THE KEY\n TO SUCCESS");
    instText.setText("CLICK TO APPLY\n COCOA BUTTER");
    gameOverText.renderable = false;
    birdie.body.allowGravity = false;
    birdie.angle = 0;
    birdie.reset(game.world.width / 4, game.world.height / 2);
    birdie.scale.setTo(2, 2);
    birdie.animations.play('fly');
    keys.removeAll();
    invs.removeAll();
}

function anotherone() {
  anotheroneSnd.play();
    gameStarted = false;
    gameOver = false;
    score = 0;
    credits.renderable = true;
    scoreText.setText("THE KEY\n TO SUCCESS");
    instText.setText("CLICK TO APPLY\n COCOA BUTTER");
    gameOverText.renderable = false;
    birdie.body.allowGravity = false;
    birdie.angle = 0;
    birdie.reset(game.world.width / 4, game.world.height / 2);
    birdie.scale.setTo(2, 2);
    birdie.animations.play('fly');
    keys.removeAll();
    invs.removeAll();
}

function start() {
    credits.renderable = false;
    birdie.body.allowGravity = true;
    // SPAWN FINGERS!
    keysTimer = new Phaser.Timer(game);
    keysTimer.onEvent.add(spawnFingers);
    keysTimer.start();
    keysTimer.add(2);
    // Show score
    scoreText.setText(score);
    instText.renderable = false;
    // START!
    gameStarted = true;

    // Track every game started
}

function flap() {
    if (!gameStarted) {
        start();
    }
    if (!gameOver) {
        birdie.body.velocity.y = -FLAP;
        flapSnd.play();
    }
}

function spawnCloud() {
    cloudsTimer.stop();

    var cloudY = game.height - 700;
    var cloud = clouds.create(
        game.width,
        cloudY,
        'clouds',
        Math.floor(4 * Math.random())
    );
    var cloudScale = 2 + 2 * Math.random();
    cloud.alpha = 2 / cloudScale;
    cloud.scale.setTo(cloudScale, cloudScale);
    cloud.body.allowGravity = false;
    cloud.body.velocity.x = -SPEED / cloudScale;
    cloud.anchor.y = 0;

    cloudsTimer.start();
    cloudsTimer.add(4 * Math.random());
}

function o() {
    return OPENING + 60 * ((score > 50 ? 50 : 50 - score) / 50);
}

function spawnFinger(keyY, flipped) {
  if (flipped == true) {
    var the_key = 'key';
  } else {
    var the_key = 'cocoabutter';
  }

    var key = keys.create(
        game.width,
        keyY + (flipped ? -o() : o()) / 2,
        the_key
    );

    key.body.allowGravity = false;

    // Flip key! *GASP*
    key.scale.setTo(2, flipped ? -2 : 2);
    key.body.offset.y = flipped ? -key.body.height * 2 : 0;

    // Move to the left
    key.body.velocity.x = -SPEED;

    return key;
}

function spawnFingers() {
    keysTimer.stop();

    var keyY = ((game.height - 16 - o() / 2) / 2) + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;
    // Bottom key
    var botFinger = spawnFinger(keyY);
    // Top key (flipped)
    var topFinger = spawnFinger(keyY, true);

    // Add invisible thingy
    var inv = invs.create(topFinger.x + topFinger.width, 0);
    inv.width = 2;
    inv.height = game.world.height;
    inv.body.allowGravity = false;
    inv.body.velocity.x = -SPEED;

    keysTimer.start();
    keysTimer.add(1 / SPAWN_RATE);
}

function addScore(_, inv) {
    invs.remove(inv);
    score += 1;
    scoreText.setText(score);
    scoreSnd.play();
}

function setGameOver() {
    gameOver = true;
    instText.setText("CLICK DJ KHALED\nTO TRY AGAIN");
    instText.renderable = true;
    var hiscore = window.localStorage.getItem('hiscore');
    hiscore = hiscore ? hiscore : score;
    hiscore = score > parseInt(hiscore, 10) ? score : hiscore;
    window.localStorage.setItem('hiscore', hiscore);
    gameOverText.setText("THEY DONT WANT\n YOU TO SUCCEED");
    gameOverText.renderable = true;
    // Stop all keys
    keys.forEachAlive(function(key) {
        key.body.velocity.x = 0;
    });
    invs.forEach(function(inv) {
        inv.body.velocity.x = 0;
    });
    // Stop spawning keys
    keysTimer.stop();
    // Make birdie reset the game
    birdie.events.onInputDown.addOnce(anotherone);
    jetskiSnd.play();
    gameOvers++;
}

function update() {
    if (gameStarted) {
        // Make birdie dive
        var dvy = FLAP + birdie.body.velocity.y;
        birdie.angle = (90 * dvy / FLAP) - 180;
        if (birdie.angle < -30) {
            birdie.angle = -30;
        }
        if (
            gameOver ||
            birdie.angle > 90 ||
            birdie.angle < -90
        ) {
            birdie.angle = 90;
            birdie.animations.stop();
            birdie.frame = 3;
        } else {
            birdie.animations.play(cobraMode > 0 ? 'cobra' : 'fly');
        }
        // Birdie is DEAD!
        if (gameOver) {
            if (birdie.scale.x < 4) {
                birdie.scale.setTo(
                    birdie.scale.x * 1.2,
                    birdie.scale.y * 1.2
                );
            }
            // Shake game over text
            gameOverText.angle = Math.random() * 5 * Math.cos(game.time.now / 100);
        } else {
            // Check game over
            if (cobraMode < 1) {
                game.physics.overlap(birdie, keys, setGameOver);
                if (!gameOver && birdie.body.bottom >= game.world.bounds.bottom) {
                    setGameOver();
                }
            }
            // Add score
            game.physics.overlap(birdie, invs, addScore);
        }
        // Remove offscreen keys
        keys.forEachAlive(function(key) {
            if (key.x + key.width < game.world.bounds.left) {
                key.kill();
            }
        });
        // Update key timer
        keysTimer.update();
    } else {
        birdie.y = (game.world.height / 2) + 8 * Math.cos(game.time.now / 200);
    }
    if (!gameStarted || gameOver) {
        // Shake instructions text
        instText.scale.setTo(
            2 + 0.1 * Math.sin(game.time.now / 100),
            2 + 0.1 * Math.cos(game.time.now / 100)
        );
    }
    // Shake score text
    scoreText.scale.setTo(
        2 + 0.1 * Math.cos(game.time.now / 100),
        2 + 0.1 * Math.sin(game.time.now / 100)
    );
    // Update clouds timer
    cloudsTimer.update();
    // Remove offscreen clouds
    clouds.forEachAlive(function(cloud) {
        if (cloud.x + cloud.width < game.world.bounds.left) {
            cloud.kill();
        }
    });
    // Scroll ocean
    if (!gameOver) {
        ocean.tilePosition.x -= game.time.physicsElapsed * SPEED / 2;
    }
    // Decrease cobra mode
    cobraMode -= game.time.physicsElapsed * SPEED * 5;
}

function render() {
    if (DEBUG) {
        game.debug.renderSpriteBody(birdie);
        keys.forEachAlive(function(key) {
            game.debug.renderSpriteBody(key);
        });
        invs.forEach(function(inv) {
            game.debug.renderSpriteBody(inv);
        });
    }
}

function onKeyDown(e) { }

var pressTime = 0;
function onKeyUp(e) {
    if (Phaser.Keyboard.SPACEBAR == e.keyCode) {
        if (game.time.now - pressTime < 200) {
            cobraMode = 1000;
        } else {
            flap();
        }
        pressTime = game.time.now;
    }
}

};
