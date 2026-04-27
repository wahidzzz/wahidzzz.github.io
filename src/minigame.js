export function initMiniGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let animationId;
  let gameRunning = false;

  // Responsive canvas size
  function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 400; // Fixed height
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Game state
  let paddle = { x: canvas.width / 2 - 50, y: canvas.height - 20, w: 100, h: 10, dx: 8 };
  let ball = { x: canvas.width / 2, y: canvas.height - 40, r: 5, dx: 4, dy: -4 };
  let bricks = [];
  const brickRowCount = 5;
  const brickColumnCount = Math.floor(canvas.width / 80);
  const brickWidth = 70;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 50;
  const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2 + 5;

  let score = 0;
  let isGameOver = false;

  function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }
  initBricks();

  // Input
  let rightPressed = false;
  let leftPressed = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
  });

  // Mouse/Touch control for paddle
  canvas.addEventListener('mousemove', (e) => {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.w / 2;
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Stop page scroll while playing
    const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.w / 2;
    }
  }, { passive: false });

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = '#ff2d55';
    ctx.fill();
    ctx.closePath();
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = r % 2 === 0 ? '#ff2d55' : 'rgba(255, 45, 85, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#050507';
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  }

  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
            ball.dy = -ball.dy;
            b.status = 0;
            score++;
            if (score === brickRowCount * brickColumnCount) {
              // Win condition
              isGameOver = true;
            }
          }
        }
      }
    }
  }

  function drawText(text, x, y, size = '20px') {
    ctx.font = `${size} "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#ff2d55';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  }

  function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke(); }

    if (isGameOver) {
      const win = score === brickRowCount * brickColumnCount;
      const titleSize = canvas.width < 500 ? '16px' : '30px';
      const subSize = canvas.width < 500 ? '12px' : '16px';
      drawText(win ? "CONGRATULATIONS! ALL NODES DESTROYED." : "ACCESS DENIED [GAME OVER]", canvas.width/2, canvas.height/2, titleSize);
      drawText("Tap to Reboot", canvas.width/2, canvas.height/2 + 40, subSize);
      return;
    }

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    
    ctx.textAlign = 'left';
    ctx.font = `14px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#ff2d55';
    ctx.fillText(`NODES DESTROYED: ${score}`, 20, 30);

    // Bounce off walls
    if (ball.x + ball.dx > canvas.width - ball.r || ball.x + ball.dx < ball.r) ball.dx = -ball.dx;
    if (ball.y + ball.dy < ball.r) ball.dy = -ball.dy;
    else if (ball.y + ball.dy > canvas.height - ball.r) {
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        ball.dy = -ball.dy;
        // Add a bit of english (spin) depending on where it hits the paddle
        ball.dx = ball.dx + ((ball.x - (paddle.x + paddle.w/2)) * 0.1);
      } else {
        isGameOver = true;
      }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (rightPressed && paddle.x < canvas.width - paddle.w) paddle.x += paddle.dx;
    else if (leftPressed && paddle.x > 0) paddle.x -= paddle.dx;

    animationId = requestAnimationFrame(draw);
  }

  // Interaction to start/reboot
  canvas.addEventListener('click', () => {
    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.style.display = 'none';

    if (!gameRunning || isGameOver) {
      // Reset state
      paddle.x = canvas.width / 2 - 50;
      ball.x = canvas.width / 2;
      ball.y = canvas.height - 40;
      ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = -4;
      score = 0;
      isGameOver = false;
      initBricks();
      gameRunning = true;
      draw();
    }
  });

  // Start screen clears canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
