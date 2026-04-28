// --- Navigation Logic ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li a');
const header = document.querySelector('header');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Scroll Animation Logic ---
const fadeElements = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

fadeElements.forEach(el => {
    appearOnScroll.observe(el);
});

// --- Typing Effect Logic ---
const typingText = document.querySelector('.typing-text');
const phrases = ["Développeur Web", "Passionné de Tech", "Créateur de Solutions"];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        typingText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000; // Pause at the end
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause before typing new phrase
    }

    setTimeout(typeEffect, typeSpeed);
}

// Start typing effect
setTimeout(typeEffect, 1000);

// --- Snake Game Logic ---
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');

// Game settings
const gridSize = 20;
let tileCountX, tileCountY;
let gameInterval;
let gameSpeed = 120; // ms per frame
let isPlaying = false;

// Snake state
let snake = [];
let snakeLength = 3;
let dx = 0;
let dy = -1; // initially moving up
let headX, headY;

// Food (Tech) state
let appleX, appleY;
let score = 0;
const techStack = [
    { text: "JS", color: "#F7DF1E" },
    { text: "CSS", color: "#1572B6" },
    { text: "HTML", color: "#E34F26" },
    { text: "PHP", color: "#777BB4" },
    { text: "SQL", color: "#F29111" },
    { text: "Py", color: "#3776AB" },
    { text: "React", color: "#61DAFB" }
];
let currentTech = techStack[0];
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

// Mobile controls
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

function initGame() {
    // Adapt canvas size for smaller screens if necessary, though CSS handles scaling,
    // actual canvas internal resolution is fixed (400x400), so 20x20 grid is 20px tiles.
    tileCountX = canvas.width / gridSize;
    tileCountY = canvas.height / gridSize;

    headX = Math.floor(tileCountX / 2);
    headY = Math.floor(tileCountY / 2);

    snake = [];
    for(let i=0; i<snakeLength; i++){
        snake.push({x: headX, y: headY + i});
    }

    dx = 0;
    dy = -1;
    score = 0;
    scoreElement.textContent = score;

    spawnApple();
    
    if(gameInterval) clearInterval(gameInterval);
    isPlaying = true;
    startBtn.innerHTML = '<i class="fas fa-redo"></i> Recommencer';
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    moveSnake();
    if(checkCollision()){
        gameOver();
        return;
    }
    checkApple();
    drawGame();
}

function moveSnake() {
    headX += dx;
    headY += dy;

    snake.unshift({x: headX, y: headY});

    if(snake.length > snakeLength) {
        snake.pop();
    }
}

function checkCollision() {
    // Wall collision
    if(headX < 0 || headX >= tileCountX || headY < 0 || headY >= tileCountY) {
        return true;
    }
    
    // Self collision
    for(let i=1; i<snake.length; i++){
        if(snake[i].x === headX && snake[i].y === headY){
            return true;
        }
    }
    return false;
}

function checkApple() {
    if(headX === appleX && headY === appleY) {
        score += 10;
        scoreElement.textContent = score;
        snakeLength++;
        
        // Increase speed slightly
        if(gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }

        spawnApple();
    }
}

function spawnApple() {
    appleX = Math.floor(Math.random() * tileCountX);
    appleY = Math.floor(Math.random() * tileCountY);

    // Verify apple doesn't spawn on snake
    for(let part of snake) {
        if(part.x === appleX && part.y === appleY) {
            spawnApple();
            return;
        }
    }
    
    // Choose a random tech
    currentTech = techStack[Math.floor(Math.random() * techStack.length)];
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for(let i=0; i<snake.length; i++){
        ctx.fillStyle = i === 0 ? '#38bdf8' : '#818cf8'; // Head is primary, body is secondary
        
        // Add a small gap between segments for cool effect
        ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    // Draw tech (food)
    ctx.fillStyle = currentTech.color;
    ctx.font = 'bold 9px Arial'; // Un peu plus petit pour rentrer dans la case de 20px
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentTech.text, appleX * gridSize + gridSize / 2, appleY * gridSize + gridSize / 2);
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameInterval);
    
    // Update high score
    if(score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }

    // Draw Game Over text
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.font = '20px Outfit';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Score final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Controls
function changeDirection(newDx, newDy) {
    if(!isPlaying) return;
    
    // Prevent reverse
    if((dx === 1 && newDx === -1) || (dx === -1 && newDx === 1) || 
       (dy === 1 && newDy === -1) || (dy === -1 && newDy === 1)) {
        return;
    }
    
    dx = newDx;
    dy = newDy;
}

window.addEventListener('keydown', (e) => {
    // Prevent default scrolling for arrow keys
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    switch(e.key) {
        case 'ArrowUp': changeDirection(0, -1); break;
        case 'ArrowDown': changeDirection(0, 1); break;
        case 'ArrowLeft': changeDirection(-1, 0); break;
        case 'ArrowRight': changeDirection(1, 0); break;
    }
});

startBtn.addEventListener('click', initGame);

// Mobile control events
upBtn.addEventListener('click', () => changeDirection(0, -1));
downBtn.addEventListener('click', () => changeDirection(0, 1));
leftBtn.addEventListener('click', () => changeDirection(-1, 0));
rightBtn.addEventListener('click', () => changeDirection(1, 0));

// Initial render to show empty board
drawGame();
