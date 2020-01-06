
const Direction = {left: 0, up: 1, right: 2, down: 3};

const snakeGame = function (canvas) {
    var ctx = canvas.getContext('2d')

    const nRows = 15;
    const nCols = 20;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const cellWidth = width/nCols;
    const cellHeight = height/nRows;

    
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

        this.eat = function() {
            this.tail.push({x: this.x, y: this.y});
            console.debug( `eat: ${this.tail.length}:`, this.tail);
        }

        this.stroke = function () {
            //console.debug(`snake.stroke x: ${this.x}, y: ${this.y}`);
            for (let i = 0; i < this.tail.length; i++) {
                ctx.save();
                ctx.translate(this.tail[i].x * cellWidth, this.tail[i].y * cellHeight);
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, cellWidth, cellHeight);
                ctx.restore();
            }
        }
    }

    function Food(x, y) {
        this.x = x;
        this.y = y;
        console.log("new food:", this)

        this.stroke = function () {
            //console.debug(`food.stroke x: ${this.x}, y: ${this.y}`);
            ctx.save();
            ctx.translate(this.x * cellWidth, this.y * cellHeight);
            ctx.beginPath();
            ctx.fillStyle = 'red';
            ctx.arc(cellWidth / 2, cellHeight / 2, Math.min(cellWidth, cellHeight) / 2, 0, 2*Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    this.placeFood = function() {
        // ToDo Food must not be on/under snake
        return new Food(Math.floor(Math.random() * nCols), Math.floor(Math.random() * nRows));
    }

    function updateAll() {
        ctx.clearRect(0, 0, width, height);

        if (snake.canWalk()) {
            if (snake.x === food.x && snake.y === food.y) {
                snake.eat();
                food = this.placeFood();
                food.stroke();
            }
            snake.walk()
            setTimeout(updateAll, timeStepMs);
        } else {
            console.log('game over');
        }
        food.stroke();
        snake.stroke();
    }

    this.onKeyDown = function (e) {
        console.log(`onKeyDown(${e.code})`)
        switch (e.code) {
            case 'ArrowUp':
                if (snake.dy !== 1) {
                    snake.dir = Direction.up;               
                }
                break;
            case 'ArrowDown':
                if (snake.dy !== -1) {                    
                    snake.dir = Direction.down;               
                }
                break;
            case 'ArrowLeft':
                if (snake.dx !== 1) {                    
                    snake.dir = Direction.left;               
                }
                break;
            case 'ArrowRight':
                if (snake.dx !== -1) {                    
                    snake.dir = Direction.right;               
                }
                break;
        }
    }

    window.addEventListener('keydown', this.onKeyDown);

    // Init snake
    var snake = new Snake(Math.floor(nCols/2), Math.floor(nRows/2));
    snake.dir = Direction.right;

    // Init food
    var food = this.placeFood();
    // food = new Food(19,14)

    // Do the first update
    updateAll();
}


$(document).ready(function () {
    console.log('document ready')
    var canvas = $("#canvas")[0]
    snakeGame(canvas);
})