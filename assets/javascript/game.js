// Base character class
class Character {
    constructor(name, healthPoints, attackPower, isPlayer, image) {
        this.name = name;
        this.healthPoints = healthPoints;
        this.attackPower = attackPower;
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
    }

    attack(character) {
        let currentAttackPower = this.attackPower;
        let newHealth = character.healthPoints - currentAttackPower;
        character.healthPoints = Math.max(0, newHealth);
        this.attackPower += this.baseAttack;
        return currentAttackPower;
    }

    update() {
        $('.player .health').text(this.healthPoints);
        $('.player .power').text(this.attackPower);
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

    update() {
        $('.defender .health').text(this.healthPoints);
    }
}

class Game {
    constructor() {
        this.characters = [];
        this.fighting = false;
        this.playerCharacter = undefined;
        this.enemyCharacter = undefined;
        this.attachEventHandlers();
    }

    createCharacters() {
        let characters = [
            new Character(
                'Obi-Wan Kenobi',
                150,
                20,
                false,
                'assets/images/obi-wan.png'
            ),
            new Character(
                'Luke Skywalker',
                125,
                15,
                false,
                'assets/images/luke.png'
            ),
            new Character('Yoda', 100, 35, false, 'assets/images/yoda.png'),
            new Character(
                'Darth Vader',
                180,
                40,
                false,
                'assets/images/vader.png'
            ),
            new Character(
                'Darth Maul',
                150,
                45,
                false,
                'assets/images/maul.png'
            ),
            new Character('Anakin', 40, 10, false, 'assets/images/anakin.png')
        ];

        return characters;
    }

    // need a funcion to init game for new games and restarts
    init() {
        this.characters = this.createCharacters();
        this.fighting = false;
        this.playerCharacter = undefined;
        this.enemyCharacter = undefined;
        this.hideElements();
        this.fillCharacters();
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
            if (this.playerCharacter) {
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
            if (this.enemyCharacter) {
                return;
            }
            $('#message').text('');

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

            this.fighting = true;

            // Toggle headers visibility
            $('#enemies').hide();
            $('#defender').show();
            $('#attack').show();
        });

        $('button#attack').on('click', evt => {
            // Get player and defender
            let player = this.playerCharacter;
            let defender = this.enemyCharacter;

            // Make sure both characters are set...
            if (!this.fighting || !player) {
                if (!defender) {
                    $('#message').text('Select an enemy!');
                } else {
                    $('#attack').hide();
                }
                return;
            } else {
                $('#message').text('');
                $('#attack').show();
            }

            // Player and defender attack eachother
            let playerDmg = player.attack(defender);
            let defenderDmg = 0;
            if (!defender.defeated()) {
                // Defender will attack back if not defeated
                defenderDmg = defender.attack(player);
            }
            // Update player and defender stats
            player.update();
            defender.update();

            // Check to see if player or defender defeated
            let msg = '';
            if (defender.defeated()) {
                // this.characters = this.characters.filter(c => c.name !== defender.name);
                this.enemyCharacter = undefined;
                this.fighting = false;

                // Check to see if all enemies have been defeated (game won)
                let enemyCt = $('.enemy').length;
                console.log(enemyCt + ' enemies left.');
                if (enemyCt === 0) {
                    alert('You defeated all the enemies. You win!');
                    this.init();
                    return;
                }

                // Remove defeated defender, update screen for new selection
                msg = `You defeated ${defender.name}! Select new opponent.`;
                $('.defender').remove();
                $('#enemies').show();
                $('#defender').hide();
            } else if (player.defeated()) {
                // Player defeated... notify and reset game
                alert('You have been defeated! Try again.');
                this.init();
            } else {
                // Nodoby defeated - output message with attack stats
                msg = `You attack ${defender.name} for ${playerDmg} damage.\n
                ${defender.name} attacks you back for ${defenderDmg} damage`;
            }

            // Update status message
            $('#message').text(msg);
        });
    }

    fillCharacters() {
        $('#characters .content').empty();
        this.characters.forEach(character => {
            let figure = $('<figure>')
                .html(`<img src="${character.image}">`)
                .addClass('character')
                .attr({
                    name: character.name,
                    health: character.healthPoints,
                    power: character.attackPower
                });
            let heart = $('<i>').addClass('fas fa-heartbeat');
            let fist = $('<i>').addClass('fas fa-fist-raised');
            let caption = $('<figcaption>').text(character.name);
            let healthSpan = $('<span>')
                .text(character.healthPoints)
                .addClass('health');
            let powerSpan = $('<span>')
                .text(character.baseAttack)
                .addClass('power');
            let health = $('<figcaption>')
                .append(healthSpan)
                .append(heart);
            let power = $('<figcaption>')
                .append(powerSpan)
                .append(fist);
            figure.prepend(caption);
            figure.append(health);
            figure.append(power);
            $('#characters').append(figure);
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const game = new Game();
    game.init();
});
