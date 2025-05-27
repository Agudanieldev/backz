const canvas = document.getElementById('stockChart');
const ctx = canvas.getContext('2d');

const dataPoints = [
  1_200_000,
  1_350_000,
  1_800_000,
  1_650_000,
  2_000_000,
  2_000_000,
  2_600_000,
  3_200_000,
  3_000_000,
  3_000_000,
  3_500_000,
  3_800_000
];

const labels = [
  'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5',
  'Stage 6', 'Stage 7', 'Stage 8', 'Stage 9',
];

const width = canvas.width;
const height = canvas.height;

const margin = 50;
const chartWidth = width - margin * 2;
const chartHeight = height - margin * 2;

const maxValue = Math.max(...dataPoints);
const minValue = Math.min(...dataPoints);
const range = maxValue - minValue;

// Draw grid
ctx.strokeStyle = '#444';
ctx.beginPath();
for (let i = 0; i <= 5; i++) {
  const y = margin + (chartHeight / 5) * i;
  ctx.moveTo(margin, y);
  ctx.lineTo(width - margin, y);

  const val = maxValue - (range / 5) * i;
  ctx.fillStyle = '#888';
  ctx.fillText(`$${(val / 1_000_000).toFixed(1)}M`, 10, y + 4);
}
ctx.stroke();

// Draw line
ctx.beginPath();
ctx.moveTo(
  margin,
  height - margin - ((dataPoints[0] - minValue) / range) * chartHeight
);

for (let i = 1; i < dataPoints.length; i++) {
  const x = margin + (chartWidth / (dataPoints.length - 1)) * i;
  const y = height - margin - ((dataPoints[i] - minValue) / range) * chartHeight;
  ctx.lineTo(x, y);
}

ctx.strokeStyle = '#00ff99';
ctx.lineWidth = 2;
ctx.stroke();

// Draw points
ctx.fillStyle = '#00ff99';
for (let i = 0; i < dataPoints.length; i++) {
  const x = margin + (chartWidth / (dataPoints.length - 1)) * i;
  const y = height - margin - ((dataPoints[i] - minValue) / range) * chartHeight;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// Draw labels
ctx.fillStyle = '#aaa';
ctx.font = "12px Arial";
labels.forEach((label, i) => {
  const x = margin + (chartWidth / (labels.length - 1)) * i;
  ctx.fillText(label, x - 20, height - 10);
});
