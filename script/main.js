/**
 * snake game
 */
// TODO  'use strict'
const Direction = {left: 0, up: 1, right: 2, down: 3};

const FoodType = {
    regular: {color: 'red', score: 1},      // regular
    moving: {color: 'yellow', score: 2},    // moves
    disappear: {color: 'green', score:2}    // disappears, if eaten produces 3 red
};

function snakeGame (canvas) {
    const ctx = canvas.getContext('2d');
    const nRows = 15;
    const nCols = 20;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const cellWidth = width/nCols;
    const cellHeight = height/nRows;
    const timeStepMsDefault = 400;  // ATT inititially hard coded in index.html
    const MoveFoodInterval = 4000;
    const DisappearFoodInterval =8000;
    
    var score = 0;
    var foods = [];
    var timeStepMs = 500;

    function Snake(x, y) {
        this.x = x
        this.y = y
        this.dx = 0
        this.dy = 0
        this.dir
        this.tail = [{x: this.x, y: this.y}];

        this.canWalk = function() {
            switch (this.dir) {
                case Direction.up:
                    this.dx = 0;
                    this.dy = -1;
                    break;
                case Direction.down:
                    this.dx = 0;
                    this.dy = 1;
                    break;
                case Direction.left:
                    this.dx = -1;
                    this.dy = 0;
                    break;
                case Direction.right:
                    this.dx = 1;
                    this.dy = 0;
                    break;
            }
    
            // detect collision also consider current direction!
            if (this.x + this.dx < 0 || this.x + this.dx > nCols-1 ||
                this.y + this.dy < 0 || this.y + this.dy > nRows-1) {
                return false;
            }
            return true;
        }

        this.walk = function() {
            this.x += this.dx;
            this.y += this.dy;
            for (let i = this.tail.length -1 ; i >= 1; i--) {
                this.tail[i] = this.tail[i-1];
            }
            this.tail[0] = {x: this.x, y: this.y};
        }

        this.eat = function(food) {
            // ToDo grow depending on food type
            this.tail.push({x: this.x, y: this.y});
            updateScore(score += food.type.score);
            console.debug( `eat: ${this.tail.length}:`, this.tail);
        }

        this.stroke = function () {
            //console.debug(`snake.stroke x: ${this.x}, y: ${this.y}`);
            // ToDo: make snake "thinner" than cell width height .. 
/*             let w = cellWidth * 0.8
            let h = cellHeight * 0.8
            let offx = (cellHeight - h) / 2
            let offy = (cellWidth - w) / 2
 */            
            let len = this.tail.length;
            for (let i = 0; i < this.tail.length; i++) {
                ctx.save();
                ctx.translate(this.tail[i].x * cellWidth, this.tail[i].y * cellHeight);
                ctx.fillStyle = `rgb(${125*(i/(len-1))}, ${125*(i/(len-1))}, ${125*(i/(len-1))})`;
                ctx.fillRect(0, 0, cellWidth, cellHeight);
                ctx.restore();
            }
        }
    }

    function Food(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        console.log("new food:", this);

        var timer;
        this.cleanUp = function () {
            if (timer) {
                clearTimeout(timer);
            }
        }

        this.move = function(self) {
            let newPlace = this.randomFreeCell();
            console.debug("move food to new place ", newPlace);
            self.x = newPlace.x;
            self.y = newPlace.y;
            timer = setTimeout(self.move, MoveFoodInterval, self);
        }

        this.stroke = function () {
            //console.debug(`food.stroke x: ${this.x}, y: ${this.y}`);
            ctx.save();
            ctx.translate(this.x * cellWidth, this.y * cellHeight);
            ctx.beginPath();
            ctx.fillStyle = type.color;
            ctx.arc(cellWidth / 2, cellHeight / 2, Math.min(cellWidth, cellHeight) / 2, 0, 2*Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    this.randomFreeCell = function () {
        do {  // ToDo in theory this could be an enless loop 
            var cell ={x: Math.floor(Math.random() * nCols), y: Math.floor(Math.random() * nRows)};
        } while (
            snake.tail.some(elem => elem.x === cell.x && elem.y === cell.y) ||
            foods.some(f => f.x === cell.x && f.y === cell.y))
        
        return cell;
    }

    this.placeFood = function() {
        // Food must not be on/under snake
        let cell = this.randomFreeCell();
        let dice = Math.floor(Math.random() * 10);
        type = dice <= 5 ? FoodType.regular : dice <= 7 ? FoodType.moving : FoodType.disappear;

        let food = new Food(cell.x, cell.y, type);       
        if (food.type === FoodType.moving) {
            timer = setTimeout(food.move, MoveFoodInterval, food);
        } else if (food.type === FoodType.disappear) {  // ToDo cleanup timer if food is eaten before
            setTimeout(this.removeFood, DisappearFoodInterval, this, food);
        }
        return food;
    }

    this.removeFood = function (self, food) {
        console.debug("remove food ", food)
        foods = foods.filter(f => f.x != food.x && f.y != food.y);
    }

    function updateAll() {
        ctx.clearRect(0, 0, width, height);

        if (snake.canWalk()) {
            let foundFood = foods.find(f => f.x === snake.x && f.y === snake.y);
            if (foundFood) {
                snake.eat(foundFood);
                foundFood.cleanUp();
                foods = foods.filter(f => f.x != foundFood.x && f.y != foundFood.y);
            }
            snake.walk()
            let timer = setTimeout(updateAll, timeStepMs);
        } else {
            console.log('game over');
        }
        if (foods.length == 0) {
            foods.push(this.placeFood());
        }
        foods.forEach(f => f.stroke());
        snake.stroke();
    }

    this.speedUp = function () {
        if (timeStepMs > 100) {
            this.changeSpeed(timeStepMs - 100);
        }
    }

    this.speedDown = function () {
        if (timeStepMs < 1000) {
            this.changeSpeed(timeStepMs + 100);
        }
    }

    this.speedReset = function () {
        this.changeSpeed(timeStepMsDefault);
    }

    this.changeSpeed = function(val) {
        timeStepMs = val;
        document.getElementById("speed").innerHTML = timeStepMs;
        console.debug(`changed timeStep = ${timeStepMs}`);
    }

    this.onKeyDown = function (e) {
        console.log(`onKeyDown(${e.code})`)
        switch (e.code) {
            case 'ArrowUp':
                if (snake.dir == Direction.up) {
                    this.speedUp();
                } else if (snake.dir == Direction.down) {
                    this.speedDown()
                } else if (snake.dy !== 1) {
                    snake.dir = Direction.up;
                    this.speedReset();             
                }
                break;
            case 'ArrowDown':
                if (snake.dir == Direction.down) {
                    this.speedUp();
                } else if (snake.dir == Direction.up) {
                    this.speedDown()
                } else if (snake.dy !== -1) {                    
                    snake.dir = Direction.down;               
                    this.speedReset();             
                }
                break;
            case 'ArrowLeft':
                if (snake.dir == Direction.left) {
                    this.speedUp();
                } else if (snake.dir == Direction.right) {
                    this.speedDown()
                } else  if (snake.dx !== 1) {                    
                    snake.dir = Direction.left;               
                    this.speedReset();             
                }
                break;
            case 'ArrowRight':
                if (snake.dir == Direction.right) {
                    this.speedUp();
                } else if (snake.dir == Direction.left) {
                    this.speedDown()
                } else if (snake.dx !== -1) {                    
                    snake.dir = Direction.right;               
                    this.speedReset();             
                }
                break;
        }
    }

    window.addEventListener('keydown', this.onKeyDown);

    // Init snake
    var snake = new Snake(Math.floor(nCols/2), Math.floor(nRows/2));
    snake.dir = Direction.right;

    // Init first food
    foods.push(this.placeFood());

    // Do the first update
    updateAll();
}


function updateScore(score) {
    document.getElementById("score").innerHTML = score;
}

function startGame() {
    var canvas = document.getElementById("canvas");
    snakeGame(canvas);
}

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        console.debug('document ready')
        startGame()
    }
}