import { evaluate } from "mathjs";

// Initialize grid state with empty cell objects
export const createInitialState = (rows, cols) => {
  const cells = {};
  // Generate column letters (A, B, C...)
  const columns = Array.from({ length: cols }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Populate map with default cell structure
  for (let r = 1; r <= rows; r++) {
    columns.forEach((c) => {
      const id = `${c}${r}`;
      cells[id] = {
        id,
        raw: "",       // Input text
        value: "",     // Computed result
        error: null,   // Error state
        dependsOn: [], // Cells this cell needs
        usedBy: []     // Cells that need this cell
      };
    });
  }
  return cells;
};

// Parse formula string to find referenced cell IDs (e.g., =A1+B2 returns ['A1', 'B2'])
export const extractDependencies = (raw, regex) => {
  if (!raw || !raw.startsWith("=")) return [];
  return raw.substring(1).match(regex) || [];
};

// Recursive DFS to detect circular dependencies (e.g., A1 -> B1 -> A1)
export const hasCycle = (start, current, cells, visited = new Set()) => {
  if (start === current) return true; // Cycle detected
  if (visited.has(current)) return false; // Already checked branch
  visited.add(current);

  for (let dep of cells[current]?.dependsOn || []) {
    if (hasCycle(start, dep, cells, visited)) return true;
  }
  return false;
};

// Calculate cell value based on raw input or formula
export const computeCell = (cell, cells, regex) => {
  const raw = cell.raw;

  // Handle empty input
  if (!raw || raw === "=") return { value: "", error: null };

  // Handle simple text or number (non-formula)
  if (!raw.startsWith("=")) {
    const num = parseFloat(raw);
    return { value: isNaN(num) ? raw : num, error: null };
  }

  try {
    // Parse formula: replace cell refs (A1) with their values
    let expr = raw.substring(1).toUpperCase();

    expr = expr.replace(regex, (ref) => {
      const refVal = parseFloat(cells[ref]?.value);
      return isNaN(refVal) ? 0 : refVal; // Default to 0 if ref is empty/text
    });

    // Evaluate math expression safely
    const result = evaluate(expr);
    if (!isFinite(result)) throw new Error("Math Error");

    return { value: result, error: null };
  } catch {
    return { value: "#ERROR", error: "Invalid Formula" };
  }
};