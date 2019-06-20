// Base character class
class Character {
    constructor(name, healthPoints, attackPower, isPlayer, image) {
        this.name = name;
        this.healthPoints = healthPoints;
        this.baseAttack = attackPower;
        this.isPlayer = isPlayer;
        this.image = image;
    }

    defeated() {
        return this.healthPoints <= 0;
    }
}

// Player character class
class Player extends Character {
    constructor(name, healthPoints, attackPower) {
        super(name, healthPoints, attackPower, true);
        this.attackPower = attackPower;
    }

    attack(character) {
        let currentAttackPower = this.attackPower;
        let newHealth = character.healthPoints - currentAttackPower;
        character.healthPoints = Math.max(0, newHealth);
        this.attackPower += this.baseAttack;
        return currentAttackPower;
    }
}

// Enemy character class
class Enemy extends Character {
    constructor(name, healthPoints, attackPower) {
        super(name, healthPoints, attackPower, false);
    }

    attack(character) {
        let newHealth = character.healthPoints - this.baseAttack;
        character.healthPoints = Math.max(0, newHealth);
        return this.baseAttack;
    }
}

class Game {
    constructor() {
        this.characters = [];
        this.started = false;
        this.playerCharacter = null;
        this.enemyCharacter = null;
    }

    createCharacters() {
        let characters = [
            new Character(
                'Obi-Wan Kenobi',
                120,
                20,
                false,
                'assets/images/obi-wan.png'
            ),
            new Character(
                'Luke Skywalker',
                100,
                15,
                false,
                'assets/images/luke.png'
            ),
            new Character('Yoda', 130, 55, false, 'assets/images/yoda.png'),
            new Character(
                'Darth Vader',
                180,
                50,
                false,
                'assets/images/vader.png'
            ),
            new Character(
                'Darth Maul',
                150,
                35,
                false,
                'assets/images/maul.png'
            )
        ];

        return characters;
    }

    // need a funcion to init game for new games and restarts
    init() {
        this.characters = this.createCharacters();
        this.started = false;
        this.playerCharacter = null;
        this.enemyCharacter = null;
        this.hideElements();
        this.fillCharacters();
        this.attachEventHandlers();
    }

    hideElements() {
        $('#player .content').empty();
        $('#enemies .content').empty();
        $('#defender .content').empty();
        $('#message').text('');
        $('#player').hide();
        $('#enemies').hide();
        $('#attack').hide();
        $('#defender').hide();
        $('#characters').show();
    }

    attachEventHandlers() {
        // Handle click event on available characters
        $('#characters').on('click', '.character', evt => {
            // If character already selected, do nothing
            if (this.playerCharacter != null) {
                return;
            }

            // Get clicked character
            let target = $(evt.currentTarget);
            let name = target.attr('name');

            // Set player character and update location
            let char = this.characters.find(c => c.name === name);
            this.playerCharacter = new Player(
                char.name,
                char.healthPoints,
                char.baseAttack
            );

            let selected = target
                .removeClass('character')
                .addClass('player')
                .remove();
            $('#player .content').append(selected);

            // Move remaining characters to enemies section
            let enemies = $('.character').remove();
            enemies.removeClass('character').addClass('enemy');
            $('#enemies .content').append(enemies);

            // Toggle headers visibility
            $('#characters').hide();
            $('#player').show();
            $('#enemies').show();
        });

        // Handle click events on available enemy
        $('#enemies').on('click', '.enemy', evt => {
            // If defender already selected, do nothing
            if (this.enemyCharacter != null) {
                return;
            }

            // Get clicked enemy
            let enemy = $(evt.currentTarget);
            let name = enemy.attr('name');

            // Set enemy defender and update location
            let char = this.characters.find(c => c.name === name);
            this.enemyCharacter = new Enemy(
                char.name,
                char.healthPoints,
                char.baseAttack
            );

            let selected = enemy
                .removeClass('enemy')
                .addClass('defender')
                .remove();
            $('#defender .content').append(selected);

            let enemies = $('.enemy').remove();

            // Toggle headers visibility
            $('#enemies').hide();
            $('#defender').show();
            $('#attack').show();
        });

        $('#attack').on('click', () => {
            // Get player and defender
            let player = this.playerCharacter;
            let defender = this.enemyCharacter;

            if (player === null || defender == null) {
                return;
            }

            // Player and defender attack eachother
            let playerDmg = player.attack(defender);
            let defenderDmg = defender.attack(player);

            // Check to see if player or defender defeated

            // Update status message
            let msg = `You attack ${defender.name} for ${playerDmg} damage.\n
            ${defender.name} attacks you back for ${defenderDmg} damage`;
            $('#message').html(`<p>${msg}</p>`);

            if (!this.canAttack()) {
                this.init();
            }
        });
    }

    fillCharacters() {
        this.characters.forEach(character => {
            let figure = $('<figure>')
                .html(`<img src="${character.image}">`)
                .addClass('character')
                .attr('name', character.name);
            let caption = $('<figcaption>').text(character.name);
            let health = $('<figcaption>').text(character.healthPoints);
            figure.prepend(caption);
            figure.append(health);
            $('#characters').append(figure);
        });
    }

    canAttack() {
        return (
            this.playerCharacter &&
            this.playerCharacter.healthPoints > 0 &&
            this.enemyCharacter &&
            this.enemyCharacter.healthPoints > 0
        );
    }

    characterSelect(character) {
        if (this.playerCharacter === null) {
            selectPlayer(character);
        } else if (this.enemyCharacter === null) {
            selectEnemy(character);
        }
    }

    selectPlayer(character) {}
    selectEnemy(character) {}

    // select character - remaining become enemies
    // move characters to appropriate locations

    // select enemy sets defender
    // moves enemy to defender area
    // now able to attack
    // update values (call attack) -> udpdate screen
    // display damage to target, and counter attack damage back

    // if lose, print message and display "restart" button

    // if win, clear enemy, display message to choose next enemy
    // press attack with no enemy shows message
    // click enemy to select new enemy -> move to location
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const game = new Game();
    game.init();
});
