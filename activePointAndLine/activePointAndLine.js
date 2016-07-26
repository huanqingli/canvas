function Pal(id) {
    var canvas_el = document.getElementById(id);
    this.pal = {
        canvas: {
            el: canvas_el,
            w: canvas_el.offsetWidth,
            h: canvas_el.offsetHeight
        },
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#ffffff"
            },
            opacity: {
                value: 0.5,
                random: true
            },
            size: {
                value: 5,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                speed: 6,
                direction: "none", //none,stop,bottom available
                out_mode: "bounce" //bounce,none available
            },
            array: []
        },
        interactivity: {
            onhover: {
                enable: true,
                mode: 'repulse' //grab,bubble,repulse available
            },
            modes: {
                grab: {
                    distance: 200,
                    opacity: 1
                },
                bubble: {
                    distance: 100,
                    size: 80
                },
                repulse: {
                    distance: 150
                }
            },
            mouse: {}
        },
        fn: {
            interact: {},
            vendors: {},
            modes: {}
        },
        tmp: {}
    }
    var pal = this.pal;
    //高清屏优化
    pal.fn.retinaInit = function() {
        if (window.devicePixelRatio > 1) {
            pal.canvas.pxratio = window.devicePixelRatio;
            pal.tmp.retina = true;
        } else {
            pal.canvas.pxratio = 1;
            pal.tmp.retina = false;
        }
        pal.canvas.el.width = pal.canvas.w *= pal.canvas.pxratio;
        pal.canvas.el.height = pal.canvas.h *= pal.canvas.pxratio;
        pal.particles.size.value *= pal.canvas.pxratio;
        pal.particles.move.speed *= pal.canvas.pxratio;
        pal.particles.line_linked.distance *= pal.canvas.pxratio;
        pal.particles.line_linked.width *= pal.canvas.pxratio;
        pal.interactivity.modes.grab.distance *= pal.canvas.pxratio;
        pal.interactivity.modes.bubble.distance *= pal.canvas.pxratio;
        pal.interactivity.modes.bubble.size *= pal.canvas.pxratio;
        pal.interactivity.modes.repulse.distance *= pal.canvas.pxratio;
    };
    //获取画布对象
    pal.fn.canvasInit = function() {
        pal.canvas.ctx = pal.canvas.el.getContext('2d');
    };
    //颗粒构造函数
    pal.fn.particle = function() {
        //point size
        this.radius = (pal.particles.size.random ? Math.random() : 1) * pal.particles.size.value;
        //point position
        this.x = Math.random() * pal.canvas.w;
        this.y = Math.random() * pal.canvas.h;
        //point color (rgb)
        this.color = hexToRgb(pal.particles.color.value);
        //point opacity
        this.opacity = (pal.particles.opacity.random ? Math.random() : 1) * pal.particles.opacity.value;
        //move
        switch (pal.particles.move.direction) {
            case 'bottom':
                this.vx = 0;
                this.vy = 1;
                break;
            case 'stop':
                this.vx = 0;
                this.vy = 0;
                break;
            default:
                this.vx = Math.random() - 0.5;
                this.vy = Math.random() - 0.5;
                break;
        }
    };
    //更新所有点的位置
    pal.fn.particlesUpdate = function() {
        for (var i = 0; i < pal.particles.array.length; i++) {
            /* the particle */
            var p = pal.particles.array[i];
            var ms = pal.particles.move.speed / 2;
            p.x += p.vx * ms;
            p.y += p.vy * ms;
            if (pal.particles.move.out_mode == 'bounce') {
                var new_pos = {
                    x_left: p.radius,
                    x_right: pal.canvas.w,
                    y_top: p.radius,
                    y_bottom: pal.canvas.h
                }
            } else {
                var new_pos = {
                    x_left: -p.radius,
                    x_right: pal.canvas.w + p.radius,
                    y_top: -p.radius,
                    y_bottom: pal.canvas.h + p.radius
                }
            }
            if (p.x - p.radius > pal.canvas.w) {
                p.x = new_pos.x_left;
                p.y = Math.random() * pal.canvas.h;
            } else if (p.x + p.radius < 0) {
                p.x = new_pos.x_right;
                p.y = Math.random() * pal.canvas.h;
            }
            if (p.y - p.radius > pal.canvas.h) {
                p.y = new_pos.y_top;
                p.x = Math.random() * pal.canvas.w;
            } else if (p.y + p.radius < 0) {
                p.y = new_pos.y_bottom;
                p.x = Math.random() * pal.canvas.w;
            }
            if (pal.particles.move.out_mode == 'bounce') {
                if (p.x + p.radius > pal.canvas.w) p.vx = -p.vx;
                else if (p.x - p.radius < 0) p.vx = -p.vx;
                if (p.y + p.radius > pal.canvas.h) p.vy = -p.vy;
                else if (p.y - p.radius < 0) p.vy = -p.vy;
            }
            if (pal.interactivity.onhover.mode == 'grab') {
                pal.fn.modes.grabParticle(p);
            }
            if (pal.interactivity.onhover.mode == 'bubble') {
                pal.fn.modes.bubbleParticle(p);
            }
            if (pal.interactivity.onhover.mode == 'repulse') {
                pal.fn.modes.repulseParticle(p);
            }
            if (pal.particles.line_linked.enable) {
                for (var j = i + 1; j < pal.particles.array.length; j++) {
                    var p2 = pal.particles.array[j];
                    // link particles
                    pal.fn.interact.linkParticles(p, p2, pal.particles.line_linked.opacity, pal.particles.line_linked.distance);
                }
            }
            if (p.radius_bubble != undefined) {
                var radius = p.radius_bubble;
            } else {
                var radius = p.radius;
            }
            var opacity = p.opacity;
            pal.canvas.ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + opacity + ')';
            pal.canvas.ctx.beginPath();
            pal.canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
            pal.canvas.ctx.closePath();
            pal.canvas.ctx.fill();
        }
    };
    //填充圆点(已融入颗粒更新方法)
    // pal.fn.particleFill = function() {
    //     for (var i = 0; i < pal.particles.array.length; i++) {
    //         var p = pal.particles.array[i];
    //         if (p.radius_bubble != undefined) {
    //             var radius = p.radius_bubble;
    //         } else {
    //             var radius = p.radius;
    //         }
    //         var opacity = p.opacity;
    //         pal.canvas.ctx.fillStyle = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + opacity + ')';
    //         pal.canvas.ctx.beginPath();
    //         pal.canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
    //         pal.canvas.ctx.closePath();
    //         pal.canvas.ctx.fill();
    //     }
    // };
    //创建颗粒
    pal.fn.particlesCreate = function() {
        for (var i = 0; i < pal.particles.number.value; i++) {
            pal.particles.array.push(new pal.fn.particle());
        }
    };
    //动起来
    pal.fn.particlesDraw = function() {
        pal.canvas.ctx.clearRect(0, 0, pal.canvas.w, pal.canvas.h);
        pal.fn.particlesUpdate();
        //pal.fn.particleFill();
    };
    //连接两点
    pal.fn.interact.linkParticles = function(p1, p2, opacity, distance) {
        var dx = p1.x - p2.x,
            dy = p1.y - p2.y,
            dist = Math.sqrt(dx * dx + dy * dy);
        //联接小于某固定距离的两点
        if (dist <= distance) {
            var opacity_line = opacity * (distance - dist) / distance;
            /* style */
            var color_line = hexToRgb(pal.particles.line_linked.color);
            pal.canvas.ctx.strokeStyle = 'rgba(' + color_line.r + ',' + color_line.g + ',' + color_line.b + ',' + opacity_line + ')';
            pal.canvas.ctx.lineWidth = pal.particles.line_linked.width;
            /* path */
            pal.canvas.ctx.beginPath();
            pal.canvas.ctx.moveTo(p1.x, p1.y);
            pal.canvas.ctx.lineTo(p2.x, p2.y);
            pal.canvas.ctx.stroke();
            pal.canvas.ctx.closePath();
        }
    };
    pal.fn.modes.pushParticles = function(nb) {
        for (var i = 0; i < nb; i++) {
            pal.particles.array.push(new pal.fn.particle())
        }
    };
    pal.fn.modes.removeParticles = function(nb) {
        pal.particles.array.splice(0, nb);
        if (pal.particles.move.direction == "stop") {
            pal.fn.particlesDraw();
        }
    };
    pal.fn.modes.bubbleParticle = function(p) {
        var dx_mouse = p.x - pal.interactivity.mouse.pos_x,
            dy_mouse = p.y - pal.interactivity.mouse.pos_y,
            dist_mouse = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse),
            ratio = (pal.interactivity.modes.bubble.distance - dist_mouse) / pal.interactivity.modes.bubble.distance;
        /* mousemove - check ratio */
        if (dist_mouse <= pal.interactivity.modes.bubble.distance) {
            if (pal.interactivity.status == 'mousemove') {
                /* size */
                var size = p.radius + (pal.interactivity.modes.bubble.size * ratio);
                if (size >= 0) {
                    p.radius_bubble = size;
                }
            }
        } else {
            p.radius_bubble = p.radius;
        }
        /* mouseleave */
        if (pal.interactivity.status == 'mouseleave') {
            p.radius_bubble = p.radius;
        }
    };
    pal.fn.modes.repulseParticle = function(p) {
        if (pal.interactivity.status == 'mousemove') {
            var dx_mouse = p.x - pal.interactivity.mouse.pos_x,
                dy_mouse = p.y - pal.interactivity.mouse.pos_y,
                dist_mouse = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
            var normVec = {
                    x: dx_mouse / dist_mouse,
                    y: dy_mouse / dist_mouse
                },
                repulseRadius = pal.interactivity.modes.repulse.distance,
                velocity = 100,
                repulseFactor = Math.min(Math.max((-1 * Math.pow(dist_mouse / repulseRadius, 2) + 1) * velocity, 0), 50);
            var pos = {
                x: p.x + normVec.x * repulseFactor,
                y: p.y + normVec.y * repulseFactor
            }
            if (pal.particles.move.out_mode == 'bounce') {
                if (pos.x - p.radius > 0 && pos.x + p.radius < pal.canvas.w) p.x = pos.x;
                if (pos.y - p.radius > 0 && pos.y + p.radius < pal.canvas.h) p.y = pos.y;
            } else {
                p.x = pos.x;
                p.y = pos.y;
            }
        }
    };
    pal.fn.modes.grabParticle = function(p) {
        if (pal.interactivity.status == 'mousemove') {
            var p2 = {
                x: pal.interactivity.mouse.pos_x,
                y: pal.interactivity.mouse.pos_y
            };
            pal.fn.interact.linkParticles(p, p2, pal.interactivity.modes.grab.opacity, pal.interactivity.modes.grab.distance);
        }
    };
    // mouse move event and window resize event
    pal.fn.vendors.eventsListeners = function() {
        if (pal.interactivity.onhover.enable) {
            pal.canvas.el.addEventListener('mousemove', function(e) {
                pal.interactivity.mouse.pos_x = e.offsetX || e.clientX;
                pal.interactivity.mouse.pos_y = e.offsetY || e.clientY;
                if (pal.tmp.retina) {
                    pal.interactivity.mouse.pos_x *= pal.canvas.pxratio;
                    pal.interactivity.mouse.pos_y *= pal.canvas.pxratio;
                }
                pal.interactivity.status = 'mousemove';
            });
            pal.canvas.el.addEventListener('mouseleave', function(e) {
                pal.interactivity.mouse.pos_x = null;
                pal.interactivity.mouse.pos_y = null;
                pal.interactivity.status = 'mouseleave';
            });
        }
        window.addEventListener('resize', function() {
            pal.canvas.w = pal.canvas.el.offsetWidth;
            pal.canvas.h = pal.canvas.el.offsetHeight;
            /* resize canvas */
            if (pal.tmp.retina) {
                pal.canvas.w *= pal.canvas.pxratio;
                pal.canvas.h *= pal.canvas.pxratio;
            }
            pal.canvas.el.width = pal.canvas.w;
            pal.canvas.el.height = pal.canvas.h;
            /* density particles enabled */
            pal.fn.vendors.densityAutoParticles();
        });
    };
    pal.fn.vendors.densityAutoParticles = function() {
        if (pal.particles.number.density.enable) {
            /* calc area */
            var area = pal.canvas.el.width * pal.canvas.el.height / 1000;
            if (pal.tmp.retina) {
                area = area / (pal.canvas.pxratio * 2);
            }
            /* calc number of particles based on density area */
            var nb_particles = area * pal.particles.number.value / pal.particles.number.density.value_area;
            /* add or remove X particles */
            var missing_particles = pal.particles.array.length - nb_particles;
            if (missing_particles < 0) pal.fn.modes.pushParticles(Math.abs(missing_particles));
            else pal.fn.modes.removeParticles(missing_particles);
        }
    };
    pal.fn.vendors.draw = function() {
        pal.fn.particlesDraw();
        pal.fn.drawAnimFrame = requestAnimationFrame(pal.fn.vendors.draw);
    };
    pal.fn.vendors.init = function() {
        /* init canvas + particles */
        pal.fn.retinaInit();
        pal.fn.canvasInit();
        pal.fn.particlesCreate();
        pal.fn.vendors.densityAutoParticles();
    };
    pal.fn.vendors.eventsListeners();
    pal.fn.vendors.init();
    pal.fn.vendors.draw();
};
//color translate
function hexToRgb(hex) {
    // By Tim Down - http://stackoverflow.com/a/5624139/3493650
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

var background = new Pal("canvas");
var background2 = new Pal("canvas2");
background.pal.interactivity.onhover.mode = "grab";
