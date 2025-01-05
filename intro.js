class IntroAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.duration = 5000; // 5 seconds intro
        this.isPlaying = false;
        this.onComplete = null;
        this.particles = [];
        this.gridPoints = [];
        
        // Create grid points
        for(let x = 0; x < canvas.width; x += 40) {
            for(let y = 0; y < canvas.height; y += 40) {
                this.gridPoints.push({
                    x: x,
                    y: y,
                    baseY: y,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }

    play(onComplete) {
        this.isPlaying = true;
        this.time = 0;
        this.onComplete = onComplete;
        this.animate();
    }

    createParticle(x, y) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: `hsl(${180 + Math.random() * 60}, 100%, 50%)`
        };
    }

    animate() {
        if (!this.isPlaying) return;

        this.time += 16; // Approximately 60fps
        
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid effect
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
        this.ctx.lineWidth = 1;
        
        this.gridPoints.forEach(point => {
            point.y = point.baseY + Math.sin(point.phase + this.time * 0.002) * 10;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
            this.ctx.stroke();
        });

        if (this.time < 1000) {
            // Grid phase
            this.drawGrid();
        } 
        else if (this.time < 2000) {
            // Title phase
            this.drawGrid();
            this.drawTitle(this.time - 1000);
            
            // Add particles
            if (Math.random() < 0.3) {
                this.particles.push(this.createParticle(
                    this.canvas.width/2 + (Math.random() - 0.5) * 200,
                    this.canvas.height/2 + (Math.random() - 0.5) * 200
                ));
            }
        }
        else if (this.time < 3000) {
            // Player phase
            this.drawGrid();
            this.drawTitle(1000);
            this.drawPlayer(this.time - 2000);
        }
        else if (this.time < 4000) {
            // Monster phase
            this.drawGrid();
            this.drawTitle(1000);
            this.drawPlayer(1000);
            this.drawMonster(this.time - 3000);
        }
        else if (this.time < 5000) {
            // Final phase
            this.drawGrid();
            this.drawTitle(1000);
            this.drawPlayer(1000);
            this.drawMonster(1000);
            
            const alpha = Math.min(1, (this.time - 4000) / 1000);
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = '24px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press any key to start', this.canvas.width/2, this.canvas.height - 100);
            this.ctx.globalAlpha = 1;
        }
        else {
            // End animation
            this.isPlaying = false;
            if (this.onComplete) this.onComplete();
            return;
        }

        // Update and draw particles
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
                return;
            }
            
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });

        requestAnimationFrame(() => this.animate());
    }

    drawGrid() {
        const gridSize = 40;
        const time = this.time * 0.001;
        
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for(let x = 0; x < this.canvas.width; x += gridSize) {
            const offset = Math.sin(x * 0.01 + time) * 5;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for(let y = 0; y < this.canvas.height; y += gridSize) {
            const offset = Math.cos(y * 0.01 + time) * 5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawTitle(time) {
        const progress = Math.min(1, time / 1000);
        
        // Glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ff88';
        
        // Main title
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = `${60 * progress}px Orbitron`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('QUANTUM', this.canvas.width/2, 100);
        
        // Strike with different color and effect
        this.ctx.fillStyle = '#ff0000';
        this.ctx.shadowColor = '#ff0000';
        this.ctx.fillText('STRIKE', this.canvas.width/2, 170);
        
        // Subtitle
        if (progress === 1) {
            this.ctx.fillStyle = '#00ff88';
            this.ctx.shadowColor = '#00ff88';
            this.ctx.font = '20px Orbitron';
            this.ctx.fillText('DEFEND THE QUANTUM REALM', this.canvas.width/2, 220);
        }
        
        this.ctx.shadowBlur = 0;
    }

    drawPlayer(time) {
        const progress = Math.min(1, time / 1000);
        const x = this.canvas.width * 3/4;
        const y = this.canvas.height/2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Player body
        this.ctx.fillStyle = '#4444FF';
        this.ctx.fillRect(-20 * progress, -30 * progress, 40 * progress, 60 * progress);
        
        if (progress === 1) {
            // Head
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(0, -40, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eyes
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(4, -42, 4, 0, Math.PI * 2);
            this.ctx.arc(4, -38, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Gun
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(20, -5, 20, 10);
        }
        
        this.ctx.restore();
    }

    drawMonster(time) {
        const progress = Math.min(1, time / 1000);
        const x = this.canvas.width/4;
        const y = this.canvas.height/2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Monster body
        this.ctx.fillStyle = '#FF4444';
        this.ctx.beginPath();
        this.ctx.moveTo(-20 * progress, -20 * progress);
        this.ctx.lineTo(20 * progress, 0);
        this.ctx.lineTo(-20 * progress, 20 * progress);
        this.ctx.closePath();
        this.ctx.fill();
        
        if (progress === 1) {
            // Monster eyes
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(5, -5, 5, 0, Math.PI * 2);
            this.ctx.arc(5, 5, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(7, -5, 2, 0, Math.PI * 2);
            this.ctx.arc(7, 5, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    stop() {
        this.isPlaying = false;
    }
}
