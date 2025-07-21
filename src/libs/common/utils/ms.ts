const units: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  y: 31_557_600_000,
};

function msToNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value; // если уже число — возвращаем как есть
  }

  const regex = /^(-?(?:\d+)?\.?\d+)\s*(ms|s|m|h|d|y)?$/i;
  const match = regex.exec(value.trim());

  if (!match) {
    throw new Error(`Invalid time format: ${value}`);
  }

  const num = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();

  return Math.round(num * (units[unit] ?? 1));
}

export default msToNumber
