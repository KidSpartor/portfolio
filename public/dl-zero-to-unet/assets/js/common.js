/* ========================================
   Common Utilities for Deep Learning Course
   ======================================== */

const DL = {
  // --- Canvas Utilities ---
  createCanvas(container, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.maxWidth = '100%';
    container.appendChild(canvas);
    return { canvas, ctx: canvas.getContext('2d') };
  },

  // --- Color Utilities ---
  lerpColor(a, b, t) {
    const ah = parseInt(a.replace('#', ''), 16);
    const bh = parseInt(b.replace('#', ''), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = ar + (br - ar) * t;
    const rg = ag + (bg - ag) * t;
    const rb = ab + (bb - ab) * t;
    return `rgb(${Math.round(rr)},${Math.round(rg)},${Math.round(rb)})`;
  },

  valueToColor(val, min = -1, max = 1) {
    const t = (val - min) / (max - min);
    if (t < 0.5) return this.lerpColor('#e85d5d', '#f8f8f8', t * 2);
    return this.lerpColor('#f8f8f8', '#4a90d9', (t - 0.5) * 2);
  },

  // --- Math Utilities ---
  sigmoid(x) { return 1 / (1 + Math.exp(-x)); },
  relu(x) { return Math.max(0, x); },
  tanh(x) { return Math.tanh(x); },
  softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  },

  // Random number in range
  rand(min = -1, max = 1) { return min + Math.random() * (max - min); },
  randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  },

  // Matrix operations
  matMul(A, B) {
    const m = A.length, n = B[0].length, p = B.length;
    const C = Array.from({ length: m }, () => new Float32Array(n));
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < p; k++)
          C[i][j] += A[i][k] * B[k][j];
    return C;
  },

  // --- Drawing Utilities ---
  drawArrow(ctx, x1, y1, x2, y2, color = '#999', width = 1.5) {
    const headLen = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.fill();
  },

  drawNeuron(ctx, x, y, radius, value, showValue = true) {
    const color = this.valueToColor(value);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (showValue) {
      ctx.fillStyle = Math.abs(value) > 0.5 ? '#fff' : '#333';
      ctx.font = `${Math.max(10, radius * 0.7)}px ${getComputedStyle(document.body).getPropertyValue('--font-mono') || 'monospace'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toFixed(2), x, y);
    }
  },

  drawConnection(ctx, x1, y1, x2, y2, weight, maxWeight = 2) {
    const absW = Math.abs(weight);
    const alpha = Math.min(1, absW / maxWeight * 0.8 + 0.1);
    const color = weight >= 0
      ? `rgba(74, 144, 217, ${alpha})`
      : `rgba(232, 93, 93, ${alpha})`;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, absW / maxWeight * 4);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  // --- Text Utilities ---
  drawLabel(ctx, text, x, y, fontSize = 13, color = '#555') {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${getComputedStyle(document.body).getPropertyValue('--font-sans') || 'sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  },

  // --- Animation Utilities ---
  easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },

  // --- Grid/Matrix Drawing ---
  drawGrid(ctx, data, x, y, cellSize, colormap = null) {
    const rows = data.length, cols = data[0].length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = data[i][j];
        ctx.fillStyle = colormap ? colormap(val) : this.valueToColor(val, 0, 1);
        ctx.fillRect(x + j * cellSize, y + i * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  },

  // --- Tab System ---
  initTabs(container) {
    const tabs = container.querySelectorAll('[data-tab]');
    const contents = container.querySelectorAll('[data-tab-content]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.style.display = 'none');
        tab.classList.add('active');
        const target = container.querySelector(`[data-tab-content="${tab.dataset.tab}"]`);
        if (target) target.style.display = 'block';
      });
    });
    if (tabs.length > 0) tabs[0].click();
  },

  // --- Chapter Progress ---
  saveProgress(chapterNum) {
    const progress = JSON.parse(localStorage.getItem('dl-course-progress') || '{}');
    progress[`ch${chapterNum}`] = true;
    localStorage.setItem('dl-course-progress', JSON.stringify(progress));
  },

  getProgress() {
    return JSON.parse(localStorage.getItem('dl-course-progress') || '{}');
  },

  getCompletedCount() {
    return Object.keys(this.getProgress()).length;
  }
};

// Auto-save progress on chapter pages
document.addEventListener('DOMContentLoaded', () => {
  const match = window.location.pathname.match(/ch(\d+)/);
  if (match) DL.saveProgress(parseInt(match[1]));
});
