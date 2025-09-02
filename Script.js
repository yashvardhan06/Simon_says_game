class SimonGame {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.buttons = document.querySelectorAll('.button');
        this.startBtn = document.getElementById('startBtn');
        this.levelDisplay = document.getElementById('level');
        this.statusDisplay = document.getElementById('status');
        this.currentScoreDisplay = document.getElementById('currentScore');
        this.highScoreDisplay = document.getElementById('highScore');
        this.isPlaying = false;
        this.canClick = false;
        this.sequenceDelay = 300;
        this.buttonActiveTime = 300;

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => this.handleButtonClick(btn));
        });
        this.highScoreDisplay.textContent = this.highScore;
    }

    startGame() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 0;
        this.isPlaying = true;
        
        // Remove game over classes
        document.querySelector('.game-controls').classList.remove('game-over');
        this.startBtn.classList.remove('game-over');
        document.querySelector('.level').classList.remove('game-over');
        
        // Hide start button and show level
        this.startBtn.style.display = 'none';
        this.startBtn.style.display = 'none';  // Hide start button
        document.querySelector('.level').style.display = 'block';  // Show level
        this.nextRound();
    }

    async nextRound() {
        this.level++;
        this.levelDisplay.textContent = this.level;
        this.currentScoreDisplay.textContent = this.level - 1;
        this.playerSequence = [];
        this.sequence.push(this.getRandomColor());
        
        // Animate level display
        const levelOverlay = document.querySelector('.level-overlay');
        const levelNumber = document.querySelector('.level-number');
        const levelInControls = document.querySelector('.level');
        
        // Set up the big level number
        levelNumber.textContent = this.level;
        
        // Show the overlay with animation
        levelOverlay.classList.add('show');
        await this.wait(100);
        levelNumber.classList.add('show');
        
        // Wait and then shrink the number
        await this.wait(1000);
        levelNumber.classList.add('shrink');
        
        // Pop effect on the control level
        levelInControls.classList.add('pop-in');
        await this.wait(300);
        levelInControls.classList.remove('pop-in');
        
        // Hide the overlay
        await this.wait(200);
        levelOverlay.classList.remove('show');
        levelNumber.classList.remove('show', 'shrink');
        
        // Continue with the game
        this.statusDisplay.textContent = 'Watch the sequence...';
        await this.wait(500);
        
        this.playSequence();
    }

    async playSequence() {
        this.canClick = false;
        for (let color of this.sequence) {
            await this.activateButton(color);
            await this.wait(this.sequenceDelay);
        }
        this.statusDisplay.textContent = 'Your turn!';
        this.canClick = true;
    }

    async activateButton(color) {
        const button = document.querySelector(`[data-color="${color}"]`);
        button.classList.add('active');
        await this.playSound(color);
        await this.wait(this.buttonActiveTime);
        button.classList.remove('active');
    }

    handleButtonClick(button) {
        if (!this.isPlaying || !this.canClick) return;

        const color = button.dataset.color;
        this.playerSequence.push(color);
        this.activateButton(color);

        if (this.playerSequence[this.playerSequence.length - 1] !== this.sequence[this.playerSequence.length - 1]) {
            this.gameOver();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            if (this.level > this.highScore) {
                this.highScore = this.level;
                this.highScoreDisplay.textContent = this.highScore;
                localStorage.setItem('highScore', this.highScore);
            }
            this.canClick = false;
            this.statusDisplay.textContent = 'Well done! Get ready for next level...';
            setTimeout(() => this.nextRound(), 1200); // Increased delay between levels
        }
    }

    async gameOver() {
        this.isPlaying = false;
        
        // Get elements for animation
        const levelOverlay = document.querySelector('.level-overlay');
        const levelNumber = document.querySelector('.level-number');
        const levelElement = document.querySelector('.level');
        const gameControls = document.querySelector('.game-controls');
        
        // Set up game over display
        levelNumber.textContent = 'GAME OVER';
        levelOverlay.classList.add('game-over');
        levelNumber.classList.add('game-over');
        
        // Show the overlay with animation
        levelOverlay.classList.add('show');
        await this.wait(100);
        levelNumber.classList.add('show');
        
        // Add shake animation
        await this.wait(200);
        levelNumber.classList.add('shake');
        
        // Play game over sound
        this.playGameOverSound();
        
        // Wait for animations
        await this.wait(1500);
        
        // Hide the overlay with fade out
        levelNumber.classList.remove('show', 'shake');
        levelOverlay.classList.remove('show');
        await this.wait(300);
        
        // Reset classes
        levelOverlay.classList.remove('game-over');
        levelNumber.classList.remove('game-over');
        
        // Show final game over state with animations
        // Show final game over state
        this.startBtn.style.display = 'block';
        levelElement.style.display = 'block';
        levelElement.classList.add('game-over');  // Add game-over class for left positioning
        this.levelDisplay.textContent = this.level;  // Show final level
        this.statusDisplay.textContent = 'Game Over! Press START to play again';
    }

    getRandomColor() {
        const colors = ['green', 'red', 'blue', 'yellow'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    async playSound(color) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect the nodes
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Pleasant musical frequencies
        const frequencies = {
            green: 261.63,   // C4
            red: 329.63,     // E4
            blue: 392.00,    // G4
            yellow: 523.25   // C5
        };

        // Set up oscillators for smooth, pleasant tone
        oscillator1.type = 'sine';  // Pure, smooth base tone
        oscillator2.type = 'sine';  // Pure, clean harmony

        // Set frequencies with slight detune for richness
        oscillator1.frequency.value = frequencies[color];
        oscillator2.frequency.value = frequencies[color] * 2;  // Octave up for depth
        oscillator2.detune.value = 2;  // Slight detune for richness

        // Gentle envelope for smooth, pleasant sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

        oscillator1.start();
        oscillator2.start();
        await this.wait(500);
        oscillator1.stop();
        oscillator2.stop();
    }

    async playGameOverSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect the nodes
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set up oscillators
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';

        // Pleasant descending melody
        const startFreq = 523.25;  // C5
        const endFreq = 261.63;    // C4

        oscillator1.frequency.setValueAtTime(startFreq, audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + 1);
        
        oscillator2.frequency.setValueAtTime(startFreq * 1.5, audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(endFreq * 1.5, audioContext.currentTime + 1);

        // Gentle envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.8);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);

        oscillator1.start();
        oscillator2.start();
        await this.wait(1000);
        oscillator1.stop();
        oscillator2.stop();
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new SimonGame();
}); 
