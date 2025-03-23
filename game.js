

import { createAnimations } from "./animations.js"
import { checkcontrols } from "./controls.js"
import { initAudio, playAudio } from "./audio.js"
import { initSpritesheet } from "./spritesheet.js"


const config = {
    autoFocus: false,
    type: Phaser.AUTO, // webgl, canvas
    width: 256, //revisar el tamaño de la pantalla
    height: 244,
    backgroundColor: '#181818',
    parent: 'game',
    physics:{
        default: 'arcade',
        arcade: {
            gravity: {y:300}, // buscar la gravedad original
            debug: true
        }
    },
    scene: {
        preload, // funcion para pre-cargar los recursos
        create,
        update
    }
}

new Phaser.Game(config)

function preload () {
    this.load.image(
        'cloud1',
        'assets/scenery/overworld/cloud1.png'
    )
    this.load.image(
        'floorbricks',
        'assets/scenery/overworld/floorbricks.png'
    )

    this.load.image(
        'supermushroom',
        'assets/collectibles/super-mushroom.png'
    )

// spritesheet

initSpritesheet(this)


// audio

    initAudio(this)
    
}

function create () {
    createAnimations(this)
    this.add.image(200,50, 'cloud1')
    .setOrigin(0,0)
    .setScale(0.15)
    this.add.image(100,50, 'cloud1')
    .setOrigin(0,0)
    .setScale(0.15)

    this.add.image(150,20, 'cloud1')
    .setOrigin(0,0)
    .setScale(0.15)

    this.add.image(300,100, 'cloud1')
    .setOrigin(0,0)
    .setScale(0.15)
    
    this.add.image(400,30, 'cloud1')
    .setOrigin(0,0)
    .setScale(0.15)

    this.add.image(450,70, 'cloud1')
    .setOrigin(0,0)
    .setScale(0.15)

    this.add.image(300,100, 'cloud1')
    .setOrigin(0,0)
    .setScale(0.15)

    this.floor = this.physics.add.staticGroup()

    this.floor
        .create(0, config.height -  16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody()

    this.floor
        .create(200, config.height -  16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody()
        
        this.floor
        .create(400, config.height -  16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody()

        this.floor
        .create(650, config.height -  16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody()

    this.mario = this.physics.add.sprite(50,100, 'mario')
    .setOrigin(0,1)
    .setCollideWorldBounds(true)
    .setGravityY(300)

    this.enemy = this.physics.add.sprite(120, config.height - 30, 'goomba')
    .setOrigin(0,1)
    .setGravityY(300)
    .setVelocityX(-50)
    
    
    this.enemy.anims.play('goomba-walk', true)

    this.collectibes = this.physics.add.staticGroup()
    this.collectibes.create(150,150, 'coin').anims.play('coin-idle', true)
    this.collectibes.create(200,150, 'coin').anims.play('coin-idle', true)
    this.collectibes.create(250,150, 'coin').anims.play('coin-idle', true)
    this.collectibes.create(300,150, 'coin').anims.play('coin-idle', true)
    this.collectibes.create(350,150, 'coin').anims.play('coin-idle', true)
    this.collectibes.create(600,150, 'coin').anims.play('coin-idle', true)
    this.collectibes.create(650,150, 'coin').anims.play('coin-idle', true)

    //this.collectibes.create(250, config.height - 40, 'supermushroom').anims.play('supermushroom-idle', true)

    this.physics.add.overlap(this.mario, this.collectibes, collectItem, null, this)


    
    this.physics.world.setBounds(0,0,2000, config.height)
    this.physics.add.collider(this.mario, this.floor)
    this.physics.add.collider(this.enemy, this.floor)
    this.physics.add.collider(this.mario, this.enemy, onHitEnemy, null, this)

    

    this.cameras.main.setBounds(0,0,2000, config.height)
    this.cameras.main.startFollow(this.mario)

    this.keys = this.input.keyboard.createCursorKeys()



}

function collectItem (mario, item){
    const {texture: {key}} = item
    item.destroy()

    if(key === 'coin'){
        playAudio('coin-pickup', this, { volume: 0.2 })
        addToScore(100, item, this)
    } else if (key === 'supermushroom'){
        this.physics.world.pause()
        this.anims.pauseAll()

        

        playAudio('powerup', this, {volume:0.1})
        
        let i = 0
        const interval = setInterval(()=>{
            i++
            mario.anims.play(i%2 == 0
                ? 'mario-grown-idle'
                : 'mario-idle'
            )
        }, 100)

        mario.isBlocked = true
        mario.isGrown = true

        setTimeout(()=>{
            mario.setDisplaySize(18,32)
            mario.body.setSize(18,32)
            this.anims.resumeAll()
            mario.isBlocked = false
            clearInterval(interval)
            this.physics.world.resume()
            
        },1000)
    }
}

function addToScore(scoreToAdd, origin, game){
    const scoreText = game.add.text(
        origin.x,
        origin.y,
        scoreToAdd,
        {
            fontFamily: 'pixel',
            fontSize: config.width / 40
        }
    )

    game.tweens.add({
        targets: scoreText,
        duration: 500,
        y: scoreText.y -30,
        onComplete: () => {
            game.tweens.add({
                targets: scoreText,
                duration: 100,
                alpha: 0,
                onComplete: () => {
                    scoreText.destroy()
                }
            })
        }
    })
}

function onHitEnemy (mario, enemy) {
    if (mario.body.touching.down && enemy.body.touching.up){
        enemy.anims.play('goomba-hurt', true)
        enemy.setVelocityX(0)
        mario.setVelocityY(-200)

        playAudio('goomba-stomp', this, {volume:2})
        addToScore(200, enemy, this)
        
        setTimeout(() => {
            enemy.destroy()
        },500)
        
        
    } else {
        //muere mario
        killMario(this)
    }
}

function update () {
    const {mario} = this

    checkcontrols(this)
    

    // check if mario is dead
    if (mario.y >= config.height){
        killMario(this)
    }
}

function killMario (game){
    const {mario, scene} = game

    if(mario.isDead) return

    mario.isDead = true
    mario.anims.play('mario-dead')
    mario.setCollideWorldBounds(false)
        
    playAudio('gameover', game, {volume:0.2})
        
    mario.body.checkCollision.none = true
    mario.setVelocityX(0)

    setTimeout(() => {
        mario.setVelocityY(-350)
    }, 100)

    setTimeout(()=> {
        scene.restart()
    }, 2000)
}
