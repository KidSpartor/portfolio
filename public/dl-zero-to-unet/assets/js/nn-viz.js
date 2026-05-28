/* ========================================
   Neural Network Visualization Library
   For Deep Learning Course
   ======================================== */

class NetworkViz {
  constructor(container, options = {}) {
    this.container = container;
    this.width = options.width || 800;
    this.height = options.height || 400;
    this.neuronRadius = options.neuronRadius || 18;
    this.animating = false;
    this.dataFlowParticles = [];

    const { canvas, ctx } = DL.createCanvas(container, this.width, this.height);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  drawNetwork(layers, weights = null, activations = null) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const layerCount = layers.length;
    const xSpacing = this.width / (layerCount + 1);
    const layerPositions = [];

    // Calculate positions
    layers.forEach((count, li) => {
      const x = xSpacing * (li + 1);
      const ySpacing = Math.min(60, (this.height - 60) / (count + 1));
      const startY = (this.height - (count - 1) * ySpacing) / 2;
      const positions = [];
      for (let i = 0; i < count; i++) {
        positions.push({ x, y: startY + i * ySpacing });
      }
      layerPositions.push(positions);
    });

    // Draw connections
    for (let li = 0; li < layerCount - 1; li++) {
      const from = layerPositions[li];
      const to = layerPositions[li + 1];
      for (let i = 0; i < from.length; i++) {
        for (let j = 0; j < to.length; j++) {
          const w = weights ? weights[li]?.[i]?.[j] ?? DL.rand(-1, 1) : DL.rand(-0.5, 0.5);
          DL.drawConnection(ctx, from[i].x, from[i].y, to[j].x, to[j].y, w);
        }
      }
    }

    // Draw neurons
    for (let li = 0; li < layerCount; li++) {
      const positions = layerPositions[li];
      for (let i = 0; i < positions.length; i++) {
        const val = activations?.[li]?.[i] ?? 0;
        DL.drawNeuron(ctx, positions[i].x, positions[i].y, this.neuronRadius, val);
      }

      // Layer labels
      const labels = ['输入层', '隐藏层 1', '隐藏层 2', '输出层'];
      ctx.fillStyle = '#888';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[li] || `层 ${li}`, positions[0].x, this.height - 15);
    }

    return layerPositions;
  }

  // Animate data flowing through network
  animateForward(layers, weights, activations, duration = 2000) {
    if (this.animating) return;
    this.animating = true;

    const positions = this.drawNetwork(layers, weights, activations);
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);

      this.drawNetwork(layers, weights, activations);

      // Draw flowing particles
      const layerProgress = progress * (layers.length - 1);
      const currentLayer = Math.floor(layerProgress);
      const t = layerProgress - currentLayer;

      if (currentLayer < layers.length - 1) {
        const from = positions[currentLayer];
        const to = positions[currentLayer + 1];
        for (let i = 0; i < from.length; i++) {
          for (let j = 0; j < to.length; j++) {
            const px = from[i].x + (to[j].x - from[i].x) * t;
            const py = from[i].y + (to[j].y - from[i].y) * t;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(74, 108, 247, ${1 - t * 0.5})`;
            this.ctx.fill();
          }
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animating = false;
      }
    };

    requestAnimationFrame(animate);
  }

  // Interactive: let user adjust weights
  makeInteractive(layers, onChange) {
    let dragInfo = null;

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (this.width / rect.width);
      const my = (e.clientY - rect.top) * (this.height / rect.height);
      dragInfo = { startX: mx, startY: my };
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!dragInfo) return;
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (this.width / rect.width);
      const my = (e.clientY - rect.top) * (this.height / rect.height);
      const delta = (mx - dragInfo.startX) / 100;
      if (onChange) onChange(delta);
    });

    this.canvas.addEventListener('mouseup', () => { dragInfo = null; });
  }
}

// --- Simple Perceptron Interactive ---
class PerceptronViz {
  constructor(container, options = {}) {
    this.container = container;
    this.width = options.width || 700;
    this.height = options.height || 400;
    this.weights = [DL.rand(-1, 1), DL.rand(-1, 1)];
    this.bias = DL.rand(-1, 1);
    this.points = [];
    this.labels = [];
    this.animating = false;

    const { canvas, ctx } = DL.createCanvas(container, this.width, this.height);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  generateData(n = 50, type = 'linear') {
    this.points = [];
    this.labels = [];
    for (let i = 0; i < n; i++) {
      const x = DL.rand(-1, 1);
      const y = DL.rand(-1, 1);
      this.points.push([x, y]);
      if (type === 'linear') {
        this.labels.push(x + y > 0 ? 1 : 0);
      } else if (type === 'xor') {
        this.labels.push((x > 0) !== (y > 0) ? 1 : 0);
      } else if (type === 'circle') {
        this.labels.push(x * x + y * y < 0.5 ? 1 : 0);
      }
    }
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width, h = this.height;
    const margin = 50;
    const plotW = w - 2 * margin;
    const plotH = h - 2 * margin;

    ctx.clearRect(0, 0, w, h);

    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, h / 2);
    ctx.lineTo(w - margin, h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w / 2, margin);
    ctx.lineTo(w / 2, h - margin);
    ctx.stroke();

    // Draw decision boundary
    if (this.weights[1] !== 0) {
      ctx.strokeStyle = '#4a6cf7';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      for (let px = 0; px <= plotW; px++) {
        const x = (px / plotW) * 2 - 1;
        const y = -(this.weights[0] * x + this.bias) / this.weights[1];
        const canvasX = margin + px;
        const canvasY = h / 2 - y * (plotH / 2);
        if (px === 0) ctx.moveTo(canvasX, canvasY);
        else ctx.lineTo(canvasX, canvasY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points
    for (let i = 0; i < this.points.length; i++) {
      const [x, y] = this.points[i];
      const canvasX = margin + ((x + 1) / 2) * plotW;
      const canvasY = h / 2 - y * (plotH / 2);
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 6, 0, Math.PI * 2);
      ctx.fillStyle = this.labels[i] ? '#4a90d9' : '#e85d5d';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw labels
    ctx.fillStyle = '#888';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x₁', w - margin + 15, h / 2 + 5);
    ctx.fillText('x₂', w / 2, margin - 15);

    // Draw weight info
    ctx.fillStyle = '#555';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`w₁ = ${this.weights[0].toFixed(3)}`, margin, 25);
    ctx.fillText(`w₂ = ${this.weights[1].toFixed(3)}`, margin, 45);
    ctx.fillText(`b  = ${this.bias.toFixed(3)}`, margin, 65);
  }

  setWeights(w1, w2, bias) {
    this.weights = [w1, w2];
    this.bias = bias;
    this.draw();
  }

  // Train one step
  trainStep(lr = 0.1) {
    let totalError = 0;
    for (let i = 0; i < this.points.length; i++) {
      const [x, y] = this.points[i];
      const output = this.weights[0] * x + this.weights[1] * y + this.bias > 0 ? 1 : 0;
      const error = this.labels[i] - output;
      if (error !== 0) {
        this.weights[0] += lr * error * x;
        this.weights[1] += lr * error * y;
        this.bias += lr * error;
        totalError += Math.abs(error);
      }
    }
    this.draw();
    return totalError;
  }

  trainEpochs(epochs = 1, lr = 0.1) {
    const errors = [];
    for (let e = 0; e < epochs; e++) {
      errors.push(this.trainStep(lr));
    }
    return errors;
  }
}

// --- Convolution Visualization ---
class ConvViz {
  constructor(container, options = {}) {
    this.container = container;
    this.width = options.width || 700;
    this.height = options.height || 500;
    this.gridSize = options.gridSize || 8;
    this.kernelSize = options.kernelSize || 3;
    this.cellSize = options.cellSize || 30;
    this.kernelPos = { row: 0, col: 0 };
    this.inputGrid = [];
    this.kernel = [];
    this.outputGrid = [];
    this.animating = false;

    const { canvas, ctx } = DL.createCanvas(container, this.width, this.height);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  generateInput() {
    this.inputGrid = [];
    for (let i = 0; i < this.gridSize; i++) {
      const row = [];
      for (let j = 0; j < this.gridSize; j++) {
        row.push(Math.round(DL.rand(0, 1) * 10) / 10);
      }
      this.inputGrid.push(row);
    }
    this.computeOutput();
  }

  setKernel(kernel) {
    this.kernel = kernel;
    this.computeOutput();
  }

  generateKernel(type = 'edge') {
    if (type === 'edge') {
      this.kernel = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
    } else if (type === 'sharpen') {
      this.kernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
    } else if (type === 'blur') {
      this.kernel = [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]];
    } else {
      this.kernel = [];
      for (let i = 0; i < this.kernelSize; i++) {
        const row = [];
        for (let j = 0; j < this.kernelSize; j++) {
          row.push(Math.round(DL.rand(-1, 1) * 10) / 10);
        }
        this.kernel.push(row);
      }
    }
    this.computeOutput();
  }

  computeOutput() {
    if (!this.inputGrid.length || !this.kernel.length) return;
    const n = this.inputGrid.length;
    const k = this.kernel.length;
    const outSize = n - k + 1;
    this.outputGrid = [];
    for (let i = 0; i < outSize; i++) {
      const row = [];
      for (let j = 0; j < outSize; j++) {
        let sum = 0;
        for (let ki = 0; ki < k; ki++) {
          for (let kj = 0; kj < k; kj++) {
            sum += this.inputGrid[i + ki][j + kj] * this.kernel[ki][kj];
          }
        }
        row.push(Math.round(sum * 100) / 100);
      }
      this.outputGrid.push(row);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const cs = this.cellSize;
    const k = this.kernelSize;
    const n = this.gridSize;

    // Draw input grid
    const inputX = 30, inputY = 80;
    ctx.fillStyle = '#555';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('输入特征图', inputX + n * cs / 2, inputY - 20);

    DL.drawGrid(ctx, this.inputGrid, inputX, inputY, cs);

    // Highlight current kernel position
    const kr = this.kernelPos.row, kc = this.kernelPos.col;
    ctx.strokeStyle = '#4a6cf7';
    ctx.lineWidth = 3;
    ctx.strokeRect(inputX + kc * cs - 1, inputY + kr * cs - 1, k * cs + 1, k * cs + 1);

    // Draw kernel
    const kernelX = inputX + n * cs + 60;
    const kernelY = inputY + 20;
    ctx.fillStyle = '#555';
    ctx.fillText('卷积核', kernelX + k * cs / 2, kernelY - 20);

    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        const val = this.kernel[i][j];
        ctx.fillStyle = DL.valueToColor(val, -1, 1);
        ctx.fillRect(kernelX + j * cs, kernelY + i * cs, cs - 1, cs - 1);
        ctx.fillStyle = Math.abs(val) > 0.5 ? '#fff' : '#333';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val.toFixed(1), kernelX + j * cs + cs / 2, kernelY + i * cs + cs / 2);
      }
    }

    // Draw output
    if (this.outputGrid.length > 0) {
      const outX = kernelX + k * cs + 60;
      const outY = inputY + (n * cs - this.outputGrid.length * cs) / 2;
      ctx.fillStyle = '#555';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('输出特征图', outX + this.outputGrid.length * cs / 2, outY - 20);

      DL.drawGrid(ctx, this.outputGrid, outX, outY, cs);

      // Highlight output cell corresponding to kernel position
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(outX + kc * cs - 1, outY + kr * cs - 1, cs + 1, cs + 1);
    }

    // Draw multiplication detail
    if (kr < n - k + 1 && kc < n - k + 1) {
      const detailY = inputY + n * cs + 30;
      ctx.fillStyle = '#555';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('当前计算:', 30, detailY);

      let calcStr = '';
      let sum = 0;
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          const iv = this.inputGrid[kr + i][kc + j];
          const kv = this.kernel[i][j];
          if (i + j > 0) calcStr += ' + ';
          calcStr += `${iv.toFixed(1)}×${kv.toFixed(1)}`;
          sum += iv * kv;
        }
      }
      ctx.font = '12px monospace';
      ctx.fillText(`${calcStr} = ${sum.toFixed(2)}`, 30, detailY + 25);
    }
  }

  setKernelPos(row, col) {
    this.kernelPos = { row, col };
    this.computeOutput();
    this.draw();
  }

  animate(stepDelay = 150) {
    if (this.animating) return;
    this.animating = true;
    const outSize = this.outputGrid.length;
    let row = 0, col = 0;

    const step = () => {
      this.setKernelPos(row, col);
      col++;
      if (col >= outSize) { col = 0; row++; }
      if (row >= outSize) {
        this.animating = false;
        return;
      }
      setTimeout(step, stepDelay);
    };
    step();
  }
}
