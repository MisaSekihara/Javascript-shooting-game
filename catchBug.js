/*jslint plusplus: true*/
// global variables
var i, canvas, ctx, map, performance, game_start, game_end, timer, score, totalTime, totalTime2;

var roundCompleted = false;
var isGameEnded = false;

// set the waiting time for the player to shoot next shot
var shot_waitTime = 10;
var shot_nextInterval = 0;

// array length set to 256 for ordinary keyboards
// set each keys to false as default
var keyboard = new Array(256);
for (i = 0; i < keyboard.length; i++) {
    keyboard[i] = false;
}

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

var player;
var thisRound = 1;
var numberOfCatch = 0;
var numberOfBugs = 0;

// array that contains X and Y coordinates for shooting animation
var shot_parts = [];
// array that contains all bug coordinates
var bugs = [];

// store a user's each round scores
var userScores = [];
var totalScore = 0;

// store user's name and scores
var userRecord = [];

// create Player object with X,Y coordinates and image
var Player = function () {
    "use strict";
    this.x = 0;
    this.y = 0;
    this.img = document.getElementById("player_image");
    this.name = "";
    this.step = 10;

    this.draw = function () {
        ctx.drawImage(this.img, this.x, this.y);
    };
};
// create Bug object with X,Y coordinates and image
var Bug = function () {
    "use strict";
    this.x = 0;
    this.y = 0;
    this.img = new Image();
    this.img.src = "img/Bug.png";
    this.step = 2;
    this.count = 0;

    this.draw = function () {
        ctx.drawImage(this.img, this.x, this.y);
    };
};
// create Shot object with X,Y coordinates and image
var Shot = function () {
    "use strict";
    this.x = 0;
    this.y = 0;
    this.img = new Image();
    this.img.src = "img/Tongue.png";
    this.draw = function () {
        ctx.drawImage(this.img, this.x, this.y);
    };
};
var timeLog_start = function () {
    "use strict";
    var timeDisplay, t1, t2;
    timeDisplay = document.getElementById("playTime");
    timer = setInterval(function () {
        t1 = (performance.now() - game_start) / 100;
        t2 = Math.round(t1);
        t1 = t2 / 10;
        timeDisplay.innerHTML = "Time : " + t1;
    }, 10);
};
var timeLog_stop = function () {
    "use strict";
    clearInterval(timer);
};
// display previously played user's names and scores
var displayUserRecord = function () {
    "use strict";
    var table, header, row, numberHeading, nameHeading, scoreHeading, numberCell, nameCell, scoreCell;
    table = document.getElementById("scoreTable");

    if (localStorage.getItem('nameScores') !== null) {
        userRecord = localStorage.getItem('nameScores');
        userRecord = JSON.parse(userRecord);
    }

    // Overwriting html in the table(clear table)
    table.innerHTML = "";

    // Make tables for arrays
    if (userRecord !== null) {
        if (userRecord.length !== 0) {
            for (i = 0; i < userRecord.length; i++) {
                row = table.insertRow(i);
                numberCell = row.insertCell(0);
                nameCell = row.insertCell(1);
                scoreCell = row.insertCell(2);
                numberCell.innerHTML = i + 1;
                nameCell.innerHTML = userRecord[i][0];
                scoreCell.innerHTML = userRecord[i][1];
            }
        }
    }
    header = table.createTHead();
    row = header.insertRow(0);
    numberHeading = row.insertCell(0);
    nameHeading = row.insertCell(1);
    scoreHeading = row.insertCell(2);
    numberHeading.innerHTML = "<b>#</b>";
    nameHeading.innerHTML = "<b>Name</b>";
    scoreHeading.innerHTML = "<b>Score</b>";
};
var init = function () {
    "use strict";
    var bug;
    roundCompleted = false;
    // load a map
    map = new Image();
    map.src = "img/tree.jpg";
    // place the player at starting point which is the at center of bottom side
    player.x = (canvas.width - player.img.width) / 2;
    player.y = (canvas.height - player.img.height) + 5;
    player.draw();
    document.getElementById("background").play();
    // store randomly selected bug position in array and draw each enemies    
    for (i = 0; i < numberOfBugs; i++) {
        bug = new Bug();
        bug.x =  Math.random() * (canvas.width - bug.img.width);
        bug.y = Math.floor(Math.random() * -250);
        bug.draw();
        bugs.push(bug);
    }
    game_start = performance.now();
    timeLog_start();

    if (localStorage.length !== 0) {
        displayUserRecord();
    }
};
// draw player images and enemy images
var drawImages = function () {
    "use strict";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(map, 0, 0);
    player.draw();

    bugs.forEach(function (bug) {
        bug.draw();
    });

    shot_parts.forEach(function (shot) {
        shot.draw();
    });
};
// check if the shot hits the bug
var hitCheck = function () {
    "use strict";
    var removed = false, j, click;
    click = document.getElementById("clickSound");
    click.volume = 0.2;
    for (i = 0; i < shot_parts.length; i++) {
        for (j = 0; j < bugs.length; j++) {
            if ((shot_parts[i].x >= bugs[j].x - 20) &&
                    (shot_parts[i].x <= (bugs[j].x + bugs[j].img.width)) &&
                    (shot_parts[i].y <= (bugs[j].y + bugs[j].img.height))) {
                removed = true;
                bugs.splice(j, 1);
                console.log("Catch!");
                numberOfCatch = numberOfCatch + 1;
                click.play();
                console.log("Caught " + numberOfCatch + " so far!");
                document.getElementById("NumOfCatch").innerHTML = "Bugs caught :  " + numberOfCatch;
            }
        }
        if (removed === true) {
            shot_parts.splice(i, 1);
            removed = false;
        }
    }
};
var calculateScore = function () {
    "use strict";
    // calculate score
    score = numberOfCatch / totalTime * 100;
    score = Math.round(score);
    userScores.push(score);
    totalScore = 0;
    for (i = 0; i < userScores.length; i++) {
        totalScore += userScores[i];
    }
};
var saveUserRecord = function () {
    "use strict";
    userRecord.sort(function (e1, e2) {
        return e2[1] - e1[1];
    }
        );
    localStorage.setItem('nameScores', JSON.stringify(userRecord));
};
// check if you caught all bugs in the round
var isRoundComplete = function () {
    "use strict";
    var text, text2, text3, text4, text5, text6, width;
    if (bugs.length === 0) {
        roundCompleted = true;
        timeLog_stop();
        console.log("You caught all bugs in this round");
        // stop the timer
        game_end =  performance.now();
        totalTime = (game_end - game_start) / 100;
        totalTime2 = Math.round(totalTime);
        totalTime = totalTime2 / 10;

        calculateScore();

        // create half transparent black over-lay
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        // display text in the middle
        ctx.font = '20px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        text = "Round " + thisRound + " Clear";
        text2 = "Time : " + totalTime + " seconds";
        text3 = "Score : " + score;
        text4 = "Total score : " + totalScore;
        text5 = "Press ENTER to go next level";
        text6 = "Press ESC to go back to Menu";
        width = ctx.measureText(text).width;
        ctx.fillText(text,
                     (canvas.width - width) / 3,
                     canvas.height / 4);
        ctx.fillText(text2,
                     (canvas.width - width) / 3,
                     (canvas.height / 4) + 50);
        ctx.fillText(text3,
                     (canvas.width - width) / 3,
                     (canvas.height / 4) + 100);
        ctx.fillText(text4,
                     (canvas.width - width) / 3,
                     (canvas.height / 4) + 150);
        ctx.fillText(text5,
                     (canvas.width - width) / 3,
                     (canvas.height / 4) + 200);
        ctx.fillText(text6,
                     (canvas.width - width) / 3,
                     (canvas.height / 4) + 250);
        saveUserRecord();
        displayUserRecord();
    }
};
var gameEnd = function () {
    "use strict";
    var text, text2, text3, text4, text5, width;
    timeLog_stop();
    console.log("You lost some bugs in this round");
    // stop the timer
    game_end =  performance.now();
    totalTime = (game_end - game_start) / 100;
    totalTime2 = Math.round(totalTime);
    totalTime = totalTime2 / 10;
    calculateScore();

    // create half transparent black over-lay
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    // display text in the middle
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    text = "Game Over";
    text2 = "Player Name : " + player.name;
    text3 = "Time : " + totalTime + " seconds";
    text4 = "Total score : " + totalScore;
    text5 = "Press ESC to go back to menu";
    width = ctx.measureText(text).width;
    ctx.fillText(text,
                 (canvas.width - width) / 3,
                 canvas.height / 4);
    ctx.fillText(text2,
                 (canvas.width - width) / 3,
                 (canvas.height / 4) + 50);
    ctx.fillText(text3,
                 (canvas.width - width) / 3,
                 (canvas.height / 4) + 100);
    ctx.fillText(text4,
                 (canvas.width - width) / 3,
                 (canvas.height / 4) + 150);
    ctx.fillText(text5,
                 (canvas.width - width) / 3,
                 (canvas.height / 4) + 200);
};
// clear all user record
var clearHistory = function () {
    "use strict";
    localStorage.clear();
    userRecord = [];
    displayUserRecord();
};
var movePlayer = function () {
    "use strict";
    // 65=a, 68=d, 83=s, 87=w
    // leftKey=37, rightKey=39, downKey=40, upKey=38
    var Akey, Dkey, LEFTkey, RIGHTkey, Zkey, Space, shot, moved = false;
    Akey = 65;
    Dkey = 68;
    LEFTkey = 37;
    RIGHTkey = 39;
    Zkey = 90;
    Space = 32;
    // shoot
    if ((keyboard[Zkey] || keyboard[Space]) &&
            !(keyboard[Dkey] || keyboard[RIGHTkey] || keyboard[Akey] || keyboard[LEFTkey])) {
        shot = new Shot();
        shot.x = player.x + 15;
        if (shot_parts.length > 0) {
            shot.y = shot_parts[shot_parts.length - 1].y - shot_parts[shot_parts.length - 1].img.height;
        } else {
            shot.y = player.y - 50;
        }
        shot_parts.push(shot);
    }
    if (!(keyboard[Zkey] || keyboard[Space])) {
        shot_parts.pop();
    }
    // move to right by 10px. if player is going off the canvas then stop
    if ((keyboard[Dkey] || keyboard[RIGHTkey]) && (player.x + player.img.width) < (canvas.width + 50)) {
        player.x += player.step;
        moved = true;
    // move to left by 10px. if player is going off the canvas then stop
    } else if ((keyboard[Akey] || keyboard[LEFTkey]) && player.x > -35) {
        player.x -= player.step;
        moved = true;
    }
    // clear the canvas and re-draw the player and enemies
    if (moved) {
        drawImages();
    }
};
var moveEnemy = function () {
    "use strict";
    bugs.forEach(function (bug) {
        bug.y += bug.step;
    });
    for (i = 0; i < bugs.length; i++) {
        // if the bug go outside the canvas(from bottom) return to top
        if (bugs[i].y > canvas.height) {
            bugs[i].y = -bugs[i].img.height;
            // add 1 to bugs count(gameover condition if it reaches to 3)
            bugs[i].count += 1;
            console.log(bugs[i].count);
            // randomise the starting position
            bugs[i].x = Math.random() * (canvas.width - bugs[i].img.width);
        }
    }
};
// check for each bugs count if it reached to 3. if so then instant game over
var checkBugcount = function () {
    "use strict";
    for (i = 0; i < bugs.length; i++) {
        if (bugs[i].count === 3) {
            isGameEnded = true;
            gameEnd();
            console.log("got away");
        }
    }
};
var shoot = function () {
    "use strict";
    for (i = 0; i < shot_parts.length; i++) {
        if (shot_parts[i].y <= 0) {
            // remove the parts that have reached the canvas edge
            shot_parts.splice(i, 1);
        }
    }
};
// infinite loop created by calling itself and set the game speed constant(FPS)
var gameLoop = function () {
    "use strict";
    var FPS = 30, MSPF = 1000 / FPS, startTime = new Date(), deltaTime, interval;
    movePlayer();
    shoot();
    moveEnemy();
    hitCheck();
    drawImages();
    checkBugcount();
    isRoundComplete();
    document.getElementById("NumOfRemaining").innerHTML = "Remaining bugs :  " + bugs.length;

    // calculate how long it took to execute and calculate the interval time for next loop
    deltaTime = (new Date()) - startTime;
    interval = MSPF - deltaTime;
    if (!roundCompleted) {
        if (!isGameEnded) {
            if (interval > 0) {
                // speed too fast, wait until next loop starts
                setTimeout(gameLoop, interval);
            }
        }
    }
};
var gameSetup = function () {
    "use strict";
    var nameInput, stageSelect;
    player = new Player();
    nameInput = document.getElementById("Name").value;
    player.name = nameInput;
    stageSelect = document.getElementById("mySelect").selectedIndex;
    if ((nameInput !== null) && (stageSelect === 1 || stageSelect === 2 || stageSelect === 3)) {
        document.getElementById("start_button").disabled = false;
    }
    if (stageSelect === 1) {
        numberOfBugs = 5;
        thisRound = 1;
    } else {
        numberOfBugs += 10;
        thisRound += 1;
    }
};
var startGame = function () {
    "use strict";
    var nameInput;
    console.log("Welcome " + player.name);
    document.getElementById("playerName").innerHTML = "Player :  " + player.name;
    document.getElementById("gameMenu").style.display = "none";
    document.getElementById("canvas").style.display = "block";
    document.getElementById("menuContainer").style.display = "block";
    document.getElementById("clickSound").play();
    init();
    gameLoop();
};
// Allow only 0-9 and A-Z alphabets
function validate(name) {
    "use strict";
    var restriction = "abcdefghijklmnopqrstuvwxyzABCDEFDHIJKLMNOPQRSTUVWXYZ0123456789", validation = "yes", i, check;
    name = document.getElementById("Name");
    for (i = 0; i < name.value.length; i++) {
        check = name.value.substring(i, i + 1);
        if (restriction.indexOf(check) === -1) {
            validation = "no";
        }
        if (validation === "no") {
            alert("Invalid entry!  Only alphanumeric characters are accepted!");
        }
    }
}
window.onkeydown = function (event) {
    "use strict";
    keyboard[event.keyCode] = true;
    // go to next round by pressing SPACE key if the round is complete
    if (roundCompleted) {
        if (keyboard[13]) {
            numberOfBugs += 10;
            thisRound += 1;
            console.log("Round " + thisRound + " is starting");
            init();
            gameLoop();
        }
    }
    // reload the page with ESC key when game end
    if (keyboard[27]) { // esc key     
        userRecord.push([player.name, totalScore]);
        saveUserRecord();
        location.reload();  
    }
};
window.onkeyup = function (event) {
    "use strict";
    keyboard[event.keyCode] = false;
};
window.onload = function () {
    "use strict";
    displayUserRecord();
    document.getElementById("Name").addEventListener("change", gameSetup, false);
    document.getElementById("mySelect").addEventListener("change", gameSetup, false);
    document.getElementById("start_button").addEventListener("click", startGame, false);
    document.getElementById("clearTable").addEventListener("click", clearHistory, false);
};