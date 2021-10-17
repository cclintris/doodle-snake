/** 
 * 線段類
*/
function Line(ctx, o) {
    this.x = 0; // x座標
    this.y = 0; // y座標
    this.start_X = 0; // 起始x位置
    this.start_Y = 0; // 起始y位置
    this.end_X = 0; // 結束x位置
    this.end_Y = 0; // 結束y位置
    this.thin = false; // 粗細係數
    this.ctx = ctx; 

    this.init(o);
}

Line.prototype.init = function(o) {
    for(let key in o) {
        this[key] = o[key];
    }
}

Line.prototype.render = function() {
    function innerRender(obj) {
        let ctx = obj.ctx;
        ctx.save()
        ctx.beginPath();
        ctx.translate(obj.x, obj.y);

        if(obj.thin){
            ctx.translate(0.5, 0.5);
        }

        if(obj.lineWidth){
            ctx.lineWidth = obj.lineWidth;
        }
    
        if(obj.strokeStyle){
            ctx.strokeStyle = obj.strokeStyle;
        }
        
        ctx.moveTo(obj.startX, obj.startY);
        ctx.lineTo(obj.endX, obj.endY);
        ctx.stroke();
        ctx.restore();
    }

    innerRender(this);
}

/**
 * 球類
 */
function Ball(o) {
    this.x = 0; // 圓心x座標
    this.y = 0; // 圓心y座標
    this.r = 0; // 圓半徑
    this.startAngle = 0; // 開始角度
    this.endAngle = 0; // 結束角度
    this.anticlockwise = false; // 指定順(逆)時針
    this.stroke = false; // 是否描邊
    this.fill = false; // 是否填充
    this.scale_X = 1; // 縮放x比例
    this.scale_Y = 1; // 縮放y比例

    this.init(o);
}

Ball.prototype.init = function(o) {
    for(let key in o) {
        this[key] = o[key];
    }
}

Ball.prototype.render = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale_X, this.scale_Y);
    ctx.arc(0, 0, this.r, this.startAngle, this.endAngle, this.anticlockwise);

    if(this.lineWidth) {
        ctx.lineWidth=this.lineWidth;
    }

    if(this.fill) {
        this.fillStyle ? (ctx.fillStyle = this.fillStyle) : null;
        ctx.fill();
    }

    if(this.stroke) {
        this.strokeStyle ? (ctx.strokeStyle = this.strokeStyle) : null;
        ctx.stroke();
    }	
    ctx.restore();
}


/** 
 * 貪食蛇遊戲代理類
*/
function snakeProxy() {
    this.renderArr = []; // 渲染對象數組
    this.snakeDir = 4; // 蛇行走方向
    this.snakeArr = []; // 存蛇頭，蛇身，蛇尾數組
    this.snakeArrPos = []; // 存蛇頭，蛇身，蛇尾分別對應位置數組
    this.score = 0; // 分數
    this.time = 0; // 時間
    this.moveCount = 1; // 計時器
}

snakeProxy.prototype.init = function(el, score, time) {
    if(!el) {
        return;
    }
    this.el = el;
    this.score_el = score;
    this.time_el = time;

    let canvas = document.createElement('canvas');
    canvas.style.cssText="background:darkgrey; border:1px solid grey; border-radius:10px;";
    let width = canvas.width = 800; // 遊戲畫布長度(x)
    let height = canvas.height = 440; // 遊戲畫布寬度(y)

    el.appendChild(canvas);

    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.max_X = 40; // x方向格子數
    this.max_Y = 22; // y方向格子數
    this.cnt_X = 20; // 每個格子x方向大小
    this.cnt_Y = 20; // 每個格子y方向大小

    this.control();
    this.draw();
}

// 繪製總函數
snakeProxy.prototype.draw = function() {
    this.createMap();
    this.createEgg();
    this.createHead();
    this.createTail();
    this.render();
}

// 繪製遊戲地圖
snakeProxy.prototype.createMap = function() {
    let renderArr = this.renderArr;
    let cnt_X = this.cnt_X;
    let cnt_Y = this.cnt_Y;
    let max_X = this.max_X;
    let max_Y = this.max_Y;
    let W = this.width;
    let H = this.height;

    for (let i = 1; i < max_Y; i++) { // 22行
        let row = new Line(this.ctx, {
            x: 0,
            y: 0,
            startX: 0,
            startY: i*cnt_Y,
            endX: W,
            endY: i*cnt_Y,
            thin: true,
            strokeStyle: 'white',
            lineWidth: 0.2
        })
        renderArr.push(row);
    }

    for(let i = 1; i < max_X; i++) { // 40列
        let col = new Line(this.ctx, {
            x: 0,
            y: 0,
            startX: i*cnt_X,
            startY: 0,
            endX: i*cnt_X,
            endY: H,
            thin: true,
            strokeStyle: 'white',
            lineWidth: 0.2
        })
        renderArr.push(col)
    }
}

// 繪製蛇頭
snakeProxy.prototype.createHead = function() {
    let renderArr = this.renderArr;
    let snakeArr = this.snakeArr;
    let snakeArrPos = this.snakeArrPos;
    let cnt_X = this.cnt_X;
    let cnt_Y = this.cnt_Y;
    let x = 1, y = 0;

    let snakeHead = new Ball({
        x: x*cnt_X + cnt_X/2,
        y: y*cnt_Y + cnt_Y/2,
        r: cnt_X/2 - 2,
        startAngle: 0,
        endAngle: 2*Math.PI,
        fill: true,
        fillStyle: '#F5DC10',
		lineWidth: 1.2
    });
    renderArr.push(snakeHead);
    snakeArr.push(snakeHead);
    snakeArrPos.push({x: x, y: y});
}

// 繪製蛇身
snakeProxy.prototype.createBody = function() {
    let renderArr = this.renderArr;
    let snakeArr = this.snakeArr;
    let cnt_X = this.cnt_X;
    let cnt_Y = this.cnt_Y;
    let x = 1, y = 0;

    let snakeBody = new Ball({
        x: x*cnt_X + cnt_X/2,
        y: y*cnt_Y + cnt_Y/2,
        r: cnt_X/3,
        startAngle: 0,
        endAngle: 2*Math.PI,
        fill: true,
        fillStyle: '#F5DC10',
		lineWidth: 1.2
    });
    renderArr.push(snakeBody);
    snakeArr.splice(1, 0, snakeBody); // 添加於蛇頭後
}

// 繪製蛇尾
snakeProxy.prototype.createTail = function() {
    let renderArr = this.renderArr;
    let snakeArr = this.snakeArr;
    let snakeArrPos = this.snakeArrPos;
    let cnt_X = this.cnt_X;
    let cnt_Y = this.cnt_Y;
    let x = 0, y = 0;

    let snakeTail = new Ball({
        x: x*cnt_X + cnt_X/2,
        y: y*cnt_Y + cnt_Y/2,
        r: cnt_X/4,
        startAngle: 0,
        endAngle: 2*Math.PI,
        fill: true,
        fillStyle: '#F5DC10',
		lineWidth: 1.2
    });
    renderArr.push(snakeTail);
    snakeArr.push(snakeTail); // 添加於蛇身後
    snakeArrPos.push({x: x, y: y});
}

// 繪製食物(蛋)
snakeProxy.prototype.createEgg = function() {
    let renderArr = this.renderArr;
    let cnt_X = this.cnt_X;
    let cnt_Y = this.cnt_Y;

    function getRandom(upper, lower) {
        return Math.floor(Math.random() * (upper-lower+1)) + lower;
    }
    let x = getRandom(1, 40);
    let y = getRandom(1, 22);

    let egg = new Ball({
        x: x*cnt_X + cnt_X/2,
        y: y*cnt_Y + cnt_Y/2,
        r: cnt_X/2 - 2,
        startAngle: 0,
        endAngle: 2*Math.PI,
        scale_X: 0.8,
        fill: true,
        fillStyle: '#FCF6DB',
		lineWidth: 1.2
    });
    renderArr.push(egg);

    this.egg = egg;
    this.eggPos = {x: x, y: y};

    let that = this;
    egg.update = function() {
        let x = getRandom(1, 40);
        let y = getRandom(1, 22);
        this.x = x*cnt_X + cnt_X/2;
        this.y = y*cnt_Y + cnt_Y/2;
        that.eggPos = {x: x, y: y};
    };
}

snakeProxy.prototype.control = function() {
    let that = this;

    let dirEnum = {
        up: 1,
        down: 2,
        left: 3,
        right: 4
    }
    let UP = dirEnum.up, DOWN = dirEnum.down, LEFT = dirEnum.left, RIGHT = dirEnum.right;

    window.addEventListener('keydown', function(e){
        switch (e.keyCode){
            case 38: //上
                if(that.snakeDir == UP || that.snakeDir == DOWN) {
                    break;
                }
                that.snakeDir = UP;
                break;
            case 40: //下
                if(that.snakeDir == UP || that.snakeDir == DOWN) {
                    break;
                }
                that.snakeDir = DOWN; 
                break;
            case 37: //左
                if(that.snakeDir == LEFT || that.snakeDir == RIGHT) {
                    break;
                }
                that.snakeDir = LEFT; 
                break;
            case 39: //右
                if(that.snakeDir == LEFT || that.snakeDir == RIGHT) {
                    break;
                }
                that.snakeDir = RIGHT; 
                break;
        
        }
        console.log("snakeDir:", that.snakeDir)
    });
}

snakeProxy.prototype.update = function() {
    let snakeArrPos = this.snakeArrPos, pos;
    let cnt_X = this.cnt_X, cnt_Y = this.cnt_Y;
    
    each(this.snakeArr, function(k, v) {
        pos = snakeArrPos[v];
        k.x = pos.x*cnt_X + cnt_X/2;
        k.y = pos.y*cnt_Y + cnt_Y/2;
    })
}

snakeProxy.prototype.computeNext = function(obj) {
    let x = obj.x, y = obj.y;
    switch (this.snakeDir) {
        case 1:
            y = obj.y - 1;
            break;
        case 2:
            y = obj.y + 1;
            break;
        case 3:
            x = obj.x - 1;
            break;
        case 4:
            x = obj.x + 1;
            break;
    }
    return {x: x, y: y};
}

snakeProxy.prototype.eat = function(snakeHead) {
    let eggPos = this.eggPos;
    if(snakeHead.x == eggPos.x && snakeHead.y == eggPos.y) {
        this.egg.update();
        this.createBody();
        this.calculateScore();
        return true;
    }
    return false;
}

snakeProxy.prototype.eatSelf = function(snakeHead) {
    let snakeArrPos = this.snakeArrPos;
    for(let i = 1; i < snakeArrPos.length; i++) {
        let part = snakeArrPos[i];
        if(snakeHead.x == part.x && snakeHead.y == part.y) {
            return true;
        }
    }
    return false;
}

snakeProxy.prototype.end = function(nextsnakeHead, snakeHead) {
    if(nextsnakeHead.x >= this.max_X || nextsnakeHead.x < 0 || nextsnakeHead.y >= this.max_Y || nextsnakeHead.y < 0) {
        alert('Game over! Out of bounds!');
        return true;
    }
    if(this.eatSelf(snakeHead)) {
        alert('Game over! You ate yourself!');
        return true;
    }
    return false;
}

snakeProxy.prototype.calculateScore = function() {
    this.score += 100;
    this.score_el.innerText = 'score : ' + this.score;
}

snakeProxy.prototype.calculateTime = function() {
    if(this.moveCount % 4 == 0) {
        this.time++;
        this.time_el.innerText = 'time : ' + this.time;
    }
    this.moveCount++;
}

snakeProxy.prototype.restart = function() {
    this.renderArr = [];
    this.snakeDir = 4;
    this.snakeArr = [];
    this.snakeArrPos = [];
    this.score = 0;
    this.time = 0;
    this.moveCount = 1;

    this.clearCanvas();
    this.draw();
}

snakeProxy.prototype.clearCanvas = function() {
    this.ctx.clearRect(0, 0, parseInt(this.width), parseInt(this.height));
}

snakeProxy.prototype.render = function() {
    let context = this.ctx;

    this.clearCanvas();
    each(this.renderArr, function(item) {
        item && item.render(context);
    });
}

snakeProxy.prototype.move = function() {
    this.calculateTime();
    
    let snakeHeadPos = this.snakeArrPos[0];

    let eatFlag = this.eat(snakeHeadPos);

    let nextPos = this.computeNext(snakeHeadPos);

    let endFlag = this.end(nextPos, snakeHeadPos);

    if(endFlag) {
        this.stop();
        this.hasEnd = true;
        return;
    }
    if(!eatFlag) {
        this.snakeArrPos.pop();
    }
    this.snakeArrPos.unshift(nextPos);

    this.update();

    this.render();
}

snakeProxy.prototype.start = function() {
    if(this.timer) {
        return;
    }
    if(this.hasEnd) {
        this.restart();
    }
    this.hasEnd = false;
    this.timer = setInterval(this.move.bind(this), 250); // 0.25s
}

snakeProxy.prototype.stop = function() {
    if(!this.timer) {
        return;
    }
    clearInterval(this.timer);
    this.timer = null;
}

/**
 * utils
 */
function each(target, fn) {
    for(let i = 0; i < target.length; i++) {
        fn(target[i], i);
    }
}
