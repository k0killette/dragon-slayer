
/*************************************************************************************************/
/* **************************************** DONNEES JEU **************************************** */
/*************************************************************************************************/
// L'unique variable globale est un objet contenant l'état du jeu.
let game; //va être un objet


// Déclaration des constantes du jeu, rend le code plus compréhensible
const PLAYER = 'Grande Prêtresse';
const DRAGON = 'Smaug le dragon';

const LEVEL_EASY   = 1;
const LEVEL_NORMAL = 2;
const LEVEL_HARD   = 3;

/*************************************************************************************************/
/* *************************************** FONCTIONS JEU *************************************** */
/*************************************************************************************************/
/**
 * Détermine qui du joueur ou du dragon prend l'initiative et attaque
 * @returns {string} - DRAGON|PLAYER
 */
function getAttacker() {
    // On lance 10D6 pour le joueur et pour le dragon
    let playerDices = throwDices(10, 6)
    let dragonDices = throwDices(10, 6)
    // si le joueur a plus de point on retourne PLAYER
    do { 
        if (playerDices > dragonDices) {
        return PLAYER
    }
    //sinon on retourne DRAGON
    else {
        return DRAGON
    } 
    } while (playerDices !== dragonDices)
}


/*
 * Calcule les points de dommages causés par le dragon au chevalier
 * @returns {number} - le nombre de points de dommages
 */
function computeDamagePoint(attacker) {
    // On tire 3D6 pour le calcul des points de dommages causés par l'attaquant (fonction)
    let damagePoints = throwDices(3,6)
    /*
      Majoration ou minoration des points de dommage en fonction du niveau de difficulté
      Pas de pondération si niveau normal (switch sur l'objet)
    */
    switch(game.level) {
        case LEVEL_EASY:
            if (attacker===DRAGON) {
                damagePoints -= Math.round(damagePoints * throwDices(2,6)/100) 
            } 
            else {
                damagePoints += Math.round(damagePoints * throwDices(2,6)/100 )
            }
        break; 
        /*
         Au niveau Facile,
         Si le dragon attaque, on diminue les points de dommage de 2D6 %
         Si le joueur attaque, on augmente les points de dommage de 2D6 %
        */
        case LEVEL_HARD: 
            if (attacker===DRAGON) {
                damagePoints += Math.round(damagePoints * throwDices(1,6)/100)
            } else {
                damagePoints -= Math.round(damagePoints * throwDices(1,6)/100)
            } 
        break; 
        /*
         Au niveau difficile,
         Si le dragon attaque, on augmente les points de dommage de 1D6 %
         Si le joueur attaque, on diminue les points de dommage de 1D6 %
        */
    }
    //on retourne les points de dommage
    return damagePoints
}


/**
 * Boucle du jeu : répète l'exécution d'un tour de jeu tant que les 2 personnages sont vivants
 */
function gameLoop() {
    // Le jeu s'exécute tant que le dragon et le joueur sont vivants. (while)
    while (game.hpPlayer>0 && game.hpDragon>0) {
        // Qui va attaquer lors de ce tour de jeu ? (fonction)
        let attacker = getAttacker()
        // Combien de dommages infligent l'assaillant = PV que va perdre le personnage attaqué (fonction)
        let damagePoints = computeDamagePoint(attacker)
        
        //si le dragon est plus rapide que le joueur ?
        if (attacker===DRAGON) {
            // Diminution des points de vie du joueur.
            game.hpPlayer -= damagePoints
        }    
        //sinon
        else {
            // Diminution des points de vie du dragon.
            game.hpDragon -= damagePoints
        }    
        // Affichage du journal : que s'est-il passé ? (function)
        showGameLog(attacker, damagePoints)
        // Affichage de l'état du jeu (function)
        showGameState()
        // On passe au tour suivant. (incrémentation)
        game.round++
    }
}


/**
 * Initialise les paramètres du jeu
 *  Création d'un objet permettant de stocker les données du jeu
 *      ->  les données seront stockées dans une propriété de l'objet,
 *          on évite ainsi de manipuler des variables globales à l'intérieur des fonctions qui font évoluer les valeurs
 *
 * Quelles sont les données necessaires tout au long du jeu (pour chaque round)
 *    -  N° du round (affichage)
 *    -  Niveau de difficulté (calcul des dommages)
 *    -  Points de vie du joueur ( affichage + fin de jeu )
 *    -  Points de vie du dragon ( affichage + fin de jeu )
 */
function initializeGame() {
    // Initialisation de la variable globale du jeu. (déclaration d'objet sur la variable game)
    //initaliser une propriété round à l'objet game qui sera 1
    game = {
        round: 1
    }
    // Choix du niveau du jeu (appel de la fonction utilities) qu'on stock dans une propriété level sur l'objet game
    game.level = requestInteger("Choisissez votre niveau : 1 - Facile, 2 - Normal, 3 - Difficile", 1, 3)
    /*
    * Détermination des points de vie de départ selon le niveau de difficulté.
    * 10 tirages, la pondération se joue sur le nombre de faces
    *    -> plus il y a de faces, plus le nombre tiré peut-être élévé (switch sur le niveau choisi) switch sur game.level
    */
    switch(game.level) {
        case LEVEL_EASY:
            game.hpPlayer = 100 + throwDices(10,10)
            game.hpDragon = 100 + throwDices(5,10)
        break; 
        case LEVEL_NORMAL: 
            game.hpPlayer = 100 + throwDices(10,10)
            game.hpDragon = 100 + throwDices(10,10)
        break; 
        case LEVEL_HARD: 
            game.hpPlayer = 100 + throwDices(7,10)
            game.hpDragon = 100 + throwDices(10,10)
        break; 
    }
    /* le tout va donner cet objet
    {
        round: 1,
        level: 1,
        hpPlayer: 143, //nombre aléatoire
        hpDragon: 187 //nombre aléatoire
    }*/
    
    game.hpDragonStart=game.hpDragon
    game.hpPlayerStart=game.hpPlayer
}


/**
 * Affichage de l'état du jeu, c'est-à-dire des points de vie respectifs des deux combattants
 */
function showGameState() {
    // Au départ du jeu, les joueurs sont encore en bonne état ! 
    const imageFilePlayer = 'pretresse.png'
    const imageFileDragon = 'dragon.png'
    
    const jaugeDragon = game.hpDragon *100 / game.hpDragonStart
    const jaugePlayer = game.hpPlayer *100 / game.hpPlayerStart
    
    // Affichage du code HTML
    document.write(`<div class="game-state">`)
    
    // Affichage de l'état du joueur
    document.write(`<figure class="game-state_player">`)
    document.write(`<img src="images/${imageFilePlayer}" alt="${PLAYER}">`)
    // Si le joueur est toujours vivant
    if (game.hpPlayer > 0) {
        // on affiche ses points de vie
        document.write(`<figcaption>${PLAYER}<br>${game.hpPlayer} PV<progress max="100" value="${jaugePlayer}"></progress></figcaption>`)
    }    
    //sinon
    else {
        // Le joueur est mort, on affiche 'GAME OVER'
        document.write(`<figcaption>GAME OVER</figcaption>`)
    }
    document.write(`</figure>`)
    
    // Affichage de l'état du dragon
    document.write(`<figure class="game-state_player">`)
    document.write(`<img src="images/${imageFileDragon}" alt="${DRAGON}">`)
    // Si le dragon est toujours vivant 
    if (game.hpDragon > 0) {
        //on affiche ses points de vie
        document.write(`<figcaption>${DRAGON}<br>${game.hpDragon} PV<progress max="100" value="${jaugeDragon}"></progress></figcaption>`)
    }    
    //sinon
    else {
        // Le dragon est mort on affiche 'GAME OVER'
        document.write(`<figcaption>GAME OVER</figcaption>`)
    }
    
    document.write(`</figure>`)
    document.write('</div>')
}

/**
 * Affiche ce qu'il s'est passé lors d'un tour du jeu : qui a attaqué ? Combien de points de dommage ont été causés ?
 * @param {string} attacker - Qui attaque : DRAGON ou PLAYER
 * @param {number} damagePoints - Le nombre de points de dommage causés
 */
function showGameLog(attacker, damagePoints) {
    let alt;
    let imageFilename;
    let message;

    // Si c'est le dragon qui attaque...
    if (attacker===DRAGON) {
        //on attribue ce qui se passe aux variables
        alt = `${DRAGON} vainqueur`
        imageFilename = "dragon-winner.png"
        message = `${DRAGON} prend l'initiative et passe à l'attaque ! Il vous inflige ${damagePoints} points de dommage !`
    }    
    //sinon
    else {
        //on attribue ce qui se passe aux variables
        alt = `${PLAYER} vainqueur`
        imageFilename = "pretresse-winner.png"
        message = `${PLAYER} prend l'initiative et passe à l'attaque ! Vous infligez ${damagePoints} points de dommage à votre adversaire`
    }    
    // Affichage des informations du tour dans le document HTML
    document.write(`<h3>Tour n°${game.round}</h3>`)
    document.write(`<figure class="game-round">`)
    document.write(`<img src="images/${imageFilename}" alt="${alt}">`)
    document.write(`<figcaption>${message}</figcaption>`)
    document.write(`</figure>`)
}

/**
 * Affichage du vainqueur
 */
function showGameWinner()
{
    let imageFilename;
    let alt;
    let message;
    
    document.write(`<h3>Fin de la partie</h3>`)

    // Si les points de vie du dragon sont positifs, c'est qu'il est toujours vivant, c'est donc lui qui a gagné le combat
    if(game.hpDragon > 0) { 
        imageFilename = `dragon-winner.png`
        alt = `${DRAGON} vainqueur`
        message = `Vous avez perdu le combat, ${DRAGON} vous a carbonisé !`
    }
    
    //sinon c'est le joueur
    else {
        imageFilename = `pretresse-winner.png`
        alt = `${PLAYER} vainqueur`
        message = `Vous avez fait des brochettes de ${DRAGON}`
    }
    
    // Affichage des informations du tour dans le document HTML
    document.write(`<figure class="game-end">`)
    document.write(`<figcaption>${message}</figcaption>`)
    document.write(`<img src="images/${imageFilename}" alt="${alt}">`)
    document.write(`</figure>`)
}


/**
 * Fonction principale du jeu qui démarre la partie TELECOMANDE
 */
function startGame() {
    // Etape 1 : initialisation du jeu
    initializeGame()
    // Etape 2 : affichage de l'état des joueurs
    showGameState()
    // Etape 3 : exécution du jeu, déroulement de la partie
    gameLoop()
    // Fin du jeu, affichage du vainqueur
    showGameWinner()
}


/*************************************************************************************************/
/* ************************************** CODE PRINCIPAL *************************************** */
/*************************************************************************************************/
startGame()
/*  1er: initializeGame 
    2eme préparer mes fonction pour mes rounds: getAttacker, computedDamagePoints
    3eme: gestion de la boucle des rounds gameloop
    4eme: gestion d'affichage showGameState, showGameLog, showGameWinner
*/


console.log(game)
console.log(getAttacker())
console.log(computeDamagePoint())
/* console.log(gameLoop()) */