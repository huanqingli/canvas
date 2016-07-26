function pal(id) {
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext('2d');
    var pxratio, mouse = {},
        box = [];
    //高清屏优化
    if (window.devicePixelRatio > 1) {
        pxratio = window.devicePixelRatio;
    } else {
        pxratio = 1;
    }
    var w = canvas.width = canvas.offsetWidth * pxratio,
        h = canvas.height = canvas.offsetHeight * pxratio;
    //获取鼠标位置
    canvas.addEventListener("mousemove", function(e) {
        mouse.x = (e.offsetX || e.clientX) * pxratio;
        mouse.y = (e.offsetY || e.clientY) * pxratio;
    });
    //创建颗粒
    for (var i = 0; i < 150; i++) {
        box[i] = {};
        box[i].x = Math.random() * w;
        box[i].vx = Math.random() - 0.5;
        box[i].y = Math.random() * h;
        box[i].vy = Math.random() - 0.5;
        box[i].o = Math.random();
        box[i].r = Math.random() * pxratio * 5;
    }
    //连接两点
    function link(a, b, max, o) {
        var dist = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        if (dist < max) {
            var opacity = o * (max - dist) / max;
            ctx.strokeStyle = 'rgba(255 , 255 , 255 ,' + opacity + ')';
            ctx.lineWidth = 2
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.closePath();
        }
    };
    //每一帧动画
    function move() {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < 150; i++) {
            box[i].x += box[i].vx * 3;
            box[i].y += box[i].vy * 3;
            if (box[i].x - box[i].r > w) {
                box[i].x = -box[i].r;
            } else if (box[i].x < -box[i].r) {
                box[i].x = w + box[i].r;
            }
            if (box[i].y - box[i].r > h) {
                box[i].y = -box[i].r;
            } else if (box[i].y < -box[i].r) {
                box[i].y = h + box[i].r;
            }
            for (var j = i; j < 150; j++) {
                link(box[i], box[j], 250, 0.6);
            }
            link(box[i], mouse, 350, 1);
            ctx.fillStyle = 'rgba(255 , 255 , 255 ,' + box[i].o + ')';
            ctx.beginPath();
            ctx.arc(box[i].x, box[i].y, box[i].r, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
        }
        requestAnimationFrame(move);
    };
    move();
}
pal("canvas");
