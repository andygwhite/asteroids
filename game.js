// Instantiate canvas and context
const canvas = document.querySelector("canvas");
const scoreEl = document.getElementById("scoreEl");
const startGameBtn = document.getElementById("startGameBtn");
const modalEl = document.getElementById("modalEl");
const bigScoreEl = document.getElementById("bigScoreEL");
canvas.width = innerWidth;
canvas.height = innerHeight;
const ctx = canvas.getContext('2d');
// Get overall constants for the center of the screen
const centerx = canvas.width / 2;
const centery = canvas.height / 2;
// Create player class
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}
const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

// Array to contain all projectiles
let projectiles = [];
let particles = [];
let enemies = [];

// Create and draw player
let player = new Player(centerx, centery, 20, 'rgba(255,255,255,1)');

function init() {
    player = new Player(centerx, centery, 20, 'rgba(255,255,255,1)');
    projectiles = [];
    particles = [];
    enemies = [];
    score = 0;
    scoreEl.innerHTML = 0;
}

player.draw();
let animationId;
let score=0;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    player.draw();
    projectiles.forEach((proj, index) => {
        proj.update();
        if(proj.x + proj.radius < 0 || 
            proj.x - proj.radius > canvas.width ||
            proj.y + proj.radius < 0 ||
            proj.y - proj.radius > canvas.height) {
            setTimeout( () => {
                projectiles.splice(index, 1);
                console.log("Projectile deleted");
            }, 0);
        }
    });

    particles.forEach((particle, particleIndex) => {
        if(particle.alpha <= 0) {
            setTimeout( () => {
                particles.splice(particleIndex, 1);
            }, 0);
        } else {        particle.update();}
    });
    enemies.forEach((enemy,index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist - enemy.radius - player.radius < 1) {
           cancelAnimationFrame(animationId);
           modalEl.style.display = 'flex';
           bigScoreEl.innerHTML = score;
        }
        // Projectiles hit enemy
        projectiles.forEach((projectile,projIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            // Enemy is hit!
            if(dist - enemy.radius - projectile.radius < 1) {
                
                for(let i = 0; i < enemy.radius*2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, 
                        Math.random() * 2, 
                        enemy.color, 
                        {x: (Math.random()*6)*(Math.random() - 0.5), 
                            y: (Math.random()*6)*(Math.random() - 0.5)}));
                }

                if(enemy.radius-10 > 5) {
                    gsap.to(enemy, {radius: enemy.radius - 10});
                    score += 100;
                    scoreEl.innerHTML = score;
                    setTimeout( () => {
                        projectiles.splice(projIndex, 1);
                    }, 0);
                } else {
                    score += 250;
                    scoreEl.innerHTML = score;
                    setTimeout( () => {
                        enemies.splice(index, 1);
                        projectiles.splice(projIndex, 1);
                    }, 0);
                }
            }
        });
    });
}
function spawnEnemies() {
    setInterval(() => {
        const radius = 20 + Math.random() * 30;
        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0-radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0-radius : canvas.height + radius;
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(centery-y, centerx-x);
        const velocity = {
        x: Math.cos(angle) * 1.5,
        y: Math.sin(angle) * 1.5
    }
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000 );
}
addEventListener("click", (e) => {
    const angle = Math.atan2(e.clientY - centery, e.clientX - centerx);
    const multiplier = 7;
    const velocity = {
        x: Math.cos(angle) * multiplier,
        y: Math.sin(angle) * multiplier
    }
      projectiles.push(new Projectile(centerx, centery, 5, 'white', velocity));
});
startGameBtn.addEventListener("click", (e) => {
    modalEl.style.display = 'none';
    init();
    animate();
    spawnEnemies();
});