const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 1024;
canvas.height = 768;

// Game state
const gameState = {
    player: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 40,
        height: 60,
        speed: 5,
        health: 100,
        ammo: 30,
        maxAmmo: 30,
        isReloading: false,
        reloadTime: 1000,
        reloadStartTime: 0,
        rotation: 0,
        score: 0,
        color: '#4444FF',
        // Animation states
        isMoving: false,
        animationFrame: 0,
        lastAnimationUpdate: 0,
        animationSpeed: 100 // ms per frame
    },
    bullets: [],
    monsters: [],
    keys: {
        w: false,
        s: false,
        a: false,
        d: false
    },
    mouse: {
        x: 0,
        y: 0,
        isDown: false
    },
    gameTime: 0,
    monsterSpawnRate: 3000, // Spawn a monster every 3 seconds
    difficulty: 'easy'
};

class Monster {
    constructor() {
        this.width = 40;
        this.height = 40;
        // Spawn monsters from outside the screen
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0: // top
                this.x = Math.random() * canvas.width;
                this.y = -this.height;
                break;
            case 1: // right
                this.x = canvas.width + this.width;
                this.y = Math.random() * canvas.height;
                break;
            case 2: // bottom
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + this.height;
                break;
            case 3: // left
                this.x = -this.width;
                this.y = Math.random() * canvas.height;
                break;
        }
        this.speed = 2;
        this.health = 100;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`; // Random monster color
    }

    update() {
        // Move towards player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        // Check collision with bullets
        gameState.bullets.forEach((bullet, bulletIndex) => {
            const bulletDistance = Math.sqrt(
                Math.pow(bullet.x - (this.x + this.width/2), 2) +
                Math.pow(bullet.y - (this.y + this.height/2), 2)
            );
            
            if (bulletDistance < this.width/2) {
                this.health -= 25;
                gameState.bullets.splice(bulletIndex, 1);
                if (this.health <= 0) {
                    gameState.player.score += 100;
                    return true; // Monster died
                }
            }
        });

        // Check collision with player
        const playerDistance = Math.sqrt(
            Math.pow(gameState.player.x - this.x, 2) +
            Math.pow(gameState.player.y - this.y, 2)
        );
        
        if (playerDistance < (this.width + gameState.player.width)/2) {
            gameState.player.health -= 0.5; // Damage player on contact
        }

        return this.health <= 0;
    }

    draw() {
        drawMonster(this);
    }
}

// Bullet class
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.angle = angle;
        this.radius = 3;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }

    draw() {
        drawBullet(this);
    }
}

// Handle keyboard input
window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': gameState.keys.w = true; break;
        case 's': gameState.keys.s = true; break;
        case 'a': gameState.keys.a = true; break;
        case 'd': gameState.keys.d = true; break;
        case 'r': startReload(); break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': gameState.keys.w = false; break;
        case 's': gameState.keys.s = false; break;
        case 'a': gameState.keys.a = false; break;
        case 'd': gameState.keys.d = false; break;
    }
});

// Handle mouse input
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    gameState.mouse.x = e.clientX - rect.left;
    gameState.mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
    gameState.mouse.isDown = true;
});

canvas.addEventListener('mouseup', () => {
    gameState.mouse.isDown = false;
});

// Reload function
function startReload() {
    if (!gameState.player.isReloading && gameState.player.ammo < gameState.player.maxAmmo) {
        gameState.player.isReloading = true;
        gameState.player.reloadStartTime = Date.now();
    }
}

function updateReload() {
    if (gameState.player.isReloading) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - gameState.player.reloadStartTime;
        
        if (elapsedTime >= gameState.player.reloadTime) {
            gameState.player.ammo = gameState.player.maxAmmo;
            gameState.player.isReloading = false;
        }
    }
}

// Shooting function
function shoot() {
    if (gameState.player.ammo > 0 && !gameState.player.isReloading) {
        const playerCenterX = gameState.player.x + gameState.player.width/2;
        const playerCenterY = gameState.player.y + gameState.player.height/2;
        const angle = Math.atan2(
            gameState.mouse.y - playerCenterY,
            gameState.mouse.x - playerCenterX
        );
        gameState.bullets.push(new Bullet(playerCenterX, playerCenterY, angle));
        gameState.player.ammo--;
    }
}

// Update player position
function updatePlayer() {
    // Update movement
    const wasMoving = gameState.player.isMoving;
    gameState.player.isMoving = false;

    if (gameState.keys.w) {
        gameState.player.y -= gameState.player.speed;
        gameState.player.isMoving = true;
    }
    if (gameState.keys.s) {
        gameState.player.y += gameState.player.speed;
        gameState.player.isMoving = true;
    }
    if (gameState.keys.a) {
        gameState.player.x -= gameState.player.speed;
        gameState.player.isMoving = true;
    }
    if (gameState.keys.d) {
        gameState.player.x += gameState.player.speed;
        gameState.player.isMoving = true;
    }

    // Update animation
    if (gameState.player.isMoving) {
        const now = Date.now();
        if (now - gameState.player.lastAnimationUpdate > gameState.player.animationSpeed) {
            gameState.player.animationFrame++;
            gameState.player.lastAnimationUpdate = now;
        }
    } else {
        gameState.player.animationFrame = 0;
    }

    // Update player rotation to face mouse
    const playerCenterX = gameState.player.x + gameState.player.width/2;
    const playerCenterY = gameState.player.y + gameState.player.height/2;
    gameState.player.rotation = Math.atan2(
        gameState.mouse.y - playerCenterY,
        gameState.mouse.x - playerCenterX
    );

    // Keep player in bounds
    gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.width, gameState.player.x));
    gameState.player.y = Math.max(0, Math.min(canvas.height - gameState.player.height, gameState.player.y));

    // Handle shooting
    if (gameState.mouse.isDown) {
        shoot();
    }
}

function updateBullets() {
    gameState.bullets = gameState.bullets.filter(bullet => !bullet.update());
}

function updateMonsters() {
    // Spawn new monsters
    if (Date.now() - gameState.gameTime > gameState.monsterSpawnRate) {
        gameState.monsters.push(new Monster());
        gameState.gameTime = Date.now();
    }

    // Update existing monsters
    gameState.monsters = gameState.monsters.filter(monster => !monster.update());
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw monsters
    gameState.monsters.forEach(monster => monster.draw());

    // Draw player
    drawPlayer();

    // Draw bullets
    gameState.bullets.forEach(bullet => bullet.draw());

    // Draw UI
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`HP: ${Math.max(0, Math.floor(gameState.player.health))}/100`, 10, 30);
    ctx.fillText(`Score: ${gameState.player.score}`, 10, 60);
    
    // Show difficulty
    ctx.fillText(`Difficulty: ${gameState.difficulty.toUpperCase()}`, 10, 90);
    
    // Show ammo and reload status
    if (gameState.player.isReloading) {
        const reloadProgress = Math.min(100, ((Date.now() - gameState.player.reloadStartTime) / gameState.player.reloadTime) * 100);
        ctx.fillText(`Reloading... ${Math.floor(reloadProgress)}%`, canvas.width - 250, 30);
    } else {
        ctx.fillText(`Ammo: ${gameState.player.ammo}/${gameState.player.maxAmmo}`, canvas.width - 150, 30);
    }

    // Game Over
    if (gameState.player.health <= 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF0000';
        ctx.font = '48px Arial';
        ctx.fillText('GAME OVER', canvas.width/2 - 120, canvas.height/2);
        ctx.fillText(`Final Score: ${gameState.player.score}`, canvas.width/2 - 140, canvas.height/2 + 60);
        gameOver();
    }
}

function gameOver() {
    // Add game over logic here
}

function drawPlayer() {
    ctx.save();
    ctx.translate(
        gameState.player.x + gameState.player.width/2,
        gameState.player.y + gameState.player.height/2
    );
    ctx.rotate(gameState.player.rotation);

    // 3D-like player body
    const p = gameState.player;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, p.height/2 + 10, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (with 3D effect)
    const gradient = ctx.createLinearGradient(-p.width/2, -p.height/2, p.width/2, p.height/2);
    gradient.addColorStop(0, '#2233ff');
    gradient.addColorStop(1, '#4466ff');
    ctx.fillStyle = gradient;
    
    // Main body
    ctx.beginPath();
    ctx.moveTo(-p.width/2, -p.height/2);
    ctx.lineTo(p.width/2, -p.height/2);
    ctx.lineTo(p.width/2 + 10, -p.height/2 + 10);
    ctx.lineTo(p.width/2 + 10, p.height/2 + 10);
    ctx.lineTo(-p.width/2 + 10, p.height/2 + 10);
    ctx.lineTo(-p.width/2, p.height/2);
    ctx.closePath();
    ctx.fill();
    
    // Side panel (3D effect)
    ctx.fillStyle = '#3355ff';
    ctx.beginPath();
    ctx.moveTo(p.width/2, -p.height/2);
    ctx.lineTo(p.width/2 + 10, -p.height/2 + 10);
    ctx.lineTo(p.width/2 + 10, p.height/2 + 10);
    ctx.lineTo(p.width/2, p.height/2);
    ctx.closePath();
    ctx.fill();
    
    // Head with helmet
    const helmetGradient = ctx.createLinearGradient(0, -p.height/2 - 25, 0, -p.height/2);
    helmetGradient.addColorStop(0, '#FFD700');
    helmetGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = helmetGradient;
    
    // Helmet base
    ctx.beginPath();
    ctx.moveTo(-15, -p.height/2 - 5);
    ctx.lineTo(15, -p.height/2 - 5);
    ctx.lineTo(20, -p.height/2 - 15);
    ctx.lineTo(15, -p.height/2 - 25);
    ctx.lineTo(-15, -p.height/2 - 25);
    ctx.lineTo(-20, -p.height/2 - 15);
    ctx.closePath();
    ctx.fill();
    
    // Visor
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(-12, -p.height/2 - 20);
    ctx.lineTo(12, -p.height/2 - 20);
    ctx.lineTo(15, -p.height/2 - 15);
    ctx.lineTo(-15, -p.height/2 - 15);
    ctx.closePath();
    ctx.fill();
    
    // Glowing effects
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-p.width/2, -p.height/4);
    ctx.lineTo(p.width/2, -p.height/4);
    ctx.stroke();
    
    // Gun with 3D effect
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(30, -5);
    ctx.lineTo(35, 0);
    ctx.lineTo(30, 5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    
    // Gun highlights
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, -3);
    ctx.lineTo(25, -3);
    ctx.stroke();
    
    ctx.restore();
}

function drawMonster(monster) {
    ctx.save();
    ctx.translate(monster.x, monster.y);
    
    // Calculate angle to player
    const dx = gameState.player.x - monster.x;
    const dy = gameState.player.y - monster.y;
    const angle = Math.atan2(dy, dx);
    ctx.rotate(angle);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 25, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Monster body with 3D effect
    const gradient = ctx.createLinearGradient(-20, -20, 20, 20);
    gradient.addColorStop(0, '#ff2222');
    gradient.addColorStop(1, '#ff6666');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-20, -20);
    ctx.lineTo(20, 0);
    ctx.lineTo(-20, 20);
    ctx.lineTo(-25, 0);
    ctx.closePath();
    ctx.fill();
    
    // Glowing eyes
    const eyeGlow = ctx.createRadialGradient(5, -5, 0, 5, -5, 8);
    eyeGlow.addColorStop(0, '#ffff00');
    eyeGlow.addColorStop(1, 'rgba(255, 255, 0, 0)');
    
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(5, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(5, 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Core energy
    const coreGlow = ctx.createRadialGradient(-10, 0, 0, -10, 0, 15);
    coreGlow.addColorStop(0, '#ff0000');
    coreGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(-10, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawBullet(bullet) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    
    // Bullet trail
    const gradient = ctx.createLinearGradient(-15, 0, 0, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(1, '#00ffff');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-15, -2);
    ctx.lineTo(0, -4);
    ctx.lineTo(5, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(-15, 2);
    ctx.closePath();
    ctx.fill();
    
    // Glowing core
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 5);
    glow.addColorStop(0, '#ffffff');
    glow.addColorStop(0.5, '#00ffff');
    glow.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Game loop
function gameLoop() {
    if (gameState.player.health > 0) {
        updatePlayer();
        updateBullets();
        updateReload();
        updateMonsters();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameState.gameTime = Date.now();
gameLoop();
