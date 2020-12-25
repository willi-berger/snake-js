/**
 * snake game
 */
// TODO 'use strict'
const Direction = {left: 0, up: 1, right: 2, down: 3};

const FoodType = {
    regular: {color: 'red', score: 1},      // regular
    moving: {color: 'yellow', score: 5},    // moves
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
    const MOVE_FOOD_MS = 4000;
    const DISAPPEAR_FOOD_MS =8000;
    
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
        this.colorMode = 1;

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
            let nextx = this.x + this.dx;
            let nexty = this.y + this.dy;
            if (nextx < 0 || nextx > nCols-1 ||
                nexty < 0 || nexty > nRows-1) {
                return false;
            }
            if (this.tail.some((e, i) => i > 2 && e.x == nextx && e.y == nexty)) {
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
            console.debug( `eat: ${this.tail.length}:`, this.tail);
        }
        
        const w = cellWidth * 0.9;
        const h = cellHeight * 0.9;
        const offx = (cellHeight - h) / 2
        const offy = (cellWidth - w) / 2


        this.strokeEnd = function () {
            this.colorMode = 0;
            this.stroke();
        }

        this.stroke = function () {
            //console.debug(`snake.stroke x: ${this.x}, y: ${this.y} - ${this.colorMode}`);             
            let len = this.tail.length;
            let tail = this.tail;
            for (let i = 0; i < this.tail.length; i++) {
                ctx.save();
                ctx.translate(this.tail[i].x * cellWidth, this.tail[i].y * cellHeight);
                ctx.fillStyle = this.colorMode ? 
                    `rgb(${125*(i/(len-1))}, ${125*(i/(len-1))}, ${125*(i/(len-1))})` : 
                    `rgb(255, ${200*(i/(len-1))}, ${200*(i/(len-1))})`;
                ctx.fillRect(offx, offy, w, h);
                if (i > 0) {
                    //ctx.fillStyle = 'red'
                    if (tail[i-1].x > tail[i].x && tail[i-1].y == tail[i].y) {
                        ctx.fillRect(cellWidth - offx, offy, offx, h);  // right
                    } else if (tail[i-1].x < tail[i].x && tail[i-1].y == tail[i].y) {
                        ctx.fillRect(0, offy, offx, h);  // left
                    } else if (tail[i-1].x == tail[i].x && tail[i-1].y < tail[i].y) {
                        ctx.fillRect(offx, 0, w, offy);  // above
                    } else if (tail[i-1].x == tail[i].x && tail[i-1].y > tail[i].y) {
                        ctx.fillRect(offx, cellHeight - offx, w, offy);  // below
                    }
                }

                if (i < this.tail.length -1) {
                    //ctx.fillStyle = 'green'
                    if (tail[i].x > tail[i+1].x && tail[i].y == tail[i+1].y) {
                        ctx.fillRect(0, offy, offx, h);  // left
                    } else if (tail[i].x < tail[i+1].x && tail[i].y == tail[i+1].y) {
                        ctx.fillRect(cellWidth - offx, offy, offx, h);  // right
                    } else if (tail[i].x == tail[i+1].x && tail[i].y < tail[i+1].y) {
                        ctx.fillRect(offx, cellHeight - offx, w, offy);  // below
                    } else if (tail[i].x == tail[i+1].x && tail[i].y > tail[i+1].y) {
                        ctx.fillRect(offx, 0, w, offy);  // above
                    }

                }

                ctx.restore();
            }
        }
    }

    function Food(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.timer = 0;
        this.moves = 0;
        console.debug("new food:", this);

        this.stroke = function () {
            //console.debug(`food.stroke x: ${this.x}, y: ${this.y}`);
            ctx.save();
            ctx.translate(this.x * cellWidth, this.y * cellHeight);
            ctx.beginPath();
            ctx.fillStyle = type.color;
            ctx.arc(cellWidth / 2, cellHeight / 2, Math.min(cellWidth, cellHeight) * 0.45, 0, 2*Math.PI);
            ctx.fill();
            /* Todo ... ctx.fillStyle = 'black';
            ctx.font = `${cellHeight*0.8}px serif`;
            ctx.fillText("1", cellWidth, cellHeight); */
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

    this.placeFood = function(type) {
        // Food must not be on/under snake
        let cell = this.randomFreeCell();
        if (undefined == type) {
            let dice = Math.floor(Math.random() * 10);
            type = dice <= 5 ? FoodType.regular : dice <= 6 ? FoodType.moving : FoodType.disappear;
        }
        let food = new Food(cell.x, cell.y, type);       
        if (food.type === FoodType.moving) {
            food.timer = setTimeout(this.moveFood, MOVE_FOOD_MS, this, food);
        } else if (food.type === FoodType.disappear) {
            food.timer = setTimeout(this.removeFood, DISAPPEAR_FOOD_MS, this, food);
        }
        return food;
    }

    this.moveFood = function(self, food) {
        if (food.moves++ < 4) {
            let newPlace = self.randomFreeCell();
            console.debug("move food to new place ", newPlace);
            food.x = newPlace.x;
            food.y = newPlace.y;
            timer = setTimeout(self.moveFood, MOVE_FOOD_MS, self, food);
        } else {
            console.debug('missed ', food.type)
            updateScore(score -= food.type.score);
            self.removeFood(self, food);
        }
    }

    this.removeFood = function (self, food) {
        console.debug("remove food ", food.type)
        foods = foods.filter(f => f.x != food.x ||  f.y != food.y);
    }

    /**
     * updateAll: game main loop
     */
    function updateAll() {
        console.debug("update all")
        ctx.clearRect(0, 0, width, height);
        snake.canWalk();
        let canWalk = snake.canWalk()
        if (canWalk) {
            let foundFood = foods.find(f => f.x === snake.x && f.y === snake.y);
            if (foundFood) {
                snake.eat(foundFood);
                if (foundFood.timer) {
                    clearTimeout(foundFood.timer);
                }
                if (FoodType.disappear === foundFood.type) {
                    for (let i = 0; i < 10; i++) {
                        foods.push(this.placeFood(FoodType.regular));
                    }
                }
                updateScore(score += foundFood.type.score);
                // ToDo refactor use removeFood()
                foods = foods.filter(f => f.x != foundFood.x || f.y != foundFood.y);
            }
            snake.walk()
            let timer = setTimeout(updateAll, timeStepMs);
        }
        if (canWalk){
            if (foods.length == 0) {
                foods.push(this.placeFood());
            }
            foods.forEach(f => f.stroke());
            snake.stroke();
        } else {
            console.info('game over');
            snake.strokeEnd();
        }
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
        console.debug(`changed timeStep = ${timeStepMs}`);
        let sVal = 11 - (timeStepMs/100);
        $("#speed").html(timeStepMs);
        for (i = 1; i <= 10; i++) {
            if (i <= sVal) {
                $("#s"+(i-1)).addClass('speed-set')
            } else {
                $("#s"+(i-1)).removeClass('speed-set')
            }
        }

    }

    this.onKeyDown = function (e) {
        //console.debug(`onKeyDown(${e.code}) `, this);
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

    this.onMouseClicked = function(e) {
        let x = (e.x - canvas.offsetLeft) / cellWidth;
        let y = (e.y - canvas.offsetTop) / cellHeight;
        console.debug(`onMausClicked ${x} ${y}`); 

        if (snake.dx != 0) {
            if (y > snake.y) {
                snake.dir = Direction.down
            } else {
                snake.dir = Direction.up;
            }
        } else if (snake.dy != 0) {
            if (x > snake.x) {
                snake.dir = Direction.right
            } else {
                snake.dir = Direction.left;
            }
        }

    }

    // setup event listeners
    window.addEventListener('keydown', this.onKeyDown);
    canvas.addEventListener('click', this.onMouseClicked);

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
    console.info("Start new game");
    var canvas = document.getElementById("canvas");
    updateScore(0);
    snakeGame(canvas);
}

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        console.debug('document ready')
        startGame()
    }
}
