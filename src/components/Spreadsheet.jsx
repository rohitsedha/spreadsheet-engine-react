import React, { useState, useEffect } from "react";
import Cell from "./Cell";
import {
  createInitialState,
  extractDependencies,
  computeCell,
  hasCycle
} from "../utils/logic";

const ROWS = 10;
const COLS = 10;

const toolbarStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "12px"
};

const btnStyle = {
  padding: "6px 14px",
  fontSize: "14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer"
};

const disabledBtn = {
  opacity: 0.5,
  cursor: "not-allowed"
};

const Spreadsheet = () => {
  // Regex to match valid cell IDs (e.g., A1 to J10)
  const CELL_REGEX = new RegExp(
    `[A-${String.fromCharCode(64 + COLS)}](?:${ROWS}|[1-${ROWS - 1}])`,
    "g"
  );

  // State for Undo/Redo functionality (Past, Present, Future stacks)
  const [history, setHistory] = useState(() => ({
    past: [],
    present: createInitialState(ROWS, COLS),
    future: []
  }));
  const [activeCellId, setActiveCellId] = useState(null);
  const cells = history.present;

  // Generate headers: ["A", "B", ...] and row numbers: [1, 2, ...]
  const columns = Array.from({ length: COLS }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const rows = Array.from({ length: ROWS }, (_, i) => i + 1);

  /* ================= Undo / Redo ================= */

  // Move current state to future, restore last past state
  const undo = () => {
    setHistory(h => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future]
      };
    });
  };

  // Move current state to past, restore first future state
  const redo = () => {
    setHistory(h => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1)
      };
    });
  };

  // Keyboard shortcuts: Ctrl+Z (Undo) and Ctrl+Y (Redo)
  useEffect(() => {
    const handler = e => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ================= Update Cell ================= */

  const updateCell = (id, raw) => {
    // Deep clone state to ensure immutability
    const newCells = structuredClone(cells);
    const cell = newCells[id];

    // Clean up old dependency links (remove this cell from others' 'usedBy')
    cell.dependsOn.forEach(dep => {
      newCells[dep].usedBy =
        newCells[dep].usedBy.filter(c => c !== id);
    });

    // Update raw value and parse new dependencies
    cell.raw = raw;
    cell.dependsOn = extractDependencies(raw, CELL_REGEX);

    // Add new dependency links (add this cell to others' 'usedBy')
    cell.dependsOn.forEach(dep => {
      if (!newCells[dep].usedBy.includes(id)) {
        newCells[dep].usedBy.push(id);
      }
    });

    // BFS to recompute this cell and all cascading dependents
    const queue = [id];
    const visited = new Set();

    while (queue.length) {
      const curr = queue.shift();
      if (visited.has(curr)) continue;
      visited.add(curr);

      const c = newCells[curr];
      
      // Check for circular dependency before computing
      if (c.dependsOn.some(d => hasCycle(curr, d, newCells))) {
        c.value = "#CIRCULAR";
        c.error = "Circular Reference";
      } else {
        const res = computeCell(c, newCells, CELL_REGEX);
        c.value = res.value;
        c.error = res.error;
      }

      // Add dependent cells to queue for re-evaluation
      queue.push(...c.usedBy);
    }

    // SINGLE, ATOMIC HISTORY UPDATE
    // Push old 'present' to 'past', set new 'present', clear 'future'
    setHistory(h => ({
      past: [...h.past, h.present],
      present: newCells,
      future: []
    }));
  };

  // Calculate next active cell based on arrow key direction
  const navigateCell = (cellId, direction) => {
  const col = cellId.charCodeAt(0) - 65;
  const row = parseInt(cellId.slice(1), 10) - 1;

  let nextRow = row;
  let nextCol = col;

  switch (direction) {
    case "UP": nextRow--; break;
    case "DOWN": nextRow++; break;
    case "LEFT": nextCol--; break;
    case "RIGHT": nextCol++; break;
    default: return;
  }

  // Boundary checks
  if (
    nextRow < 0 || nextRow >= ROWS ||
    nextCol < 0 || nextCol >= COLS
  ) return;

  const nextId = `${String.fromCharCode(65 + nextCol)}${nextRow + 1}`;
  setActiveCellId(nextId);
};


  /* ================= Render ================= */

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h3>React Spreadsheet</h3>

      {/* Toolbar with Undo/Redo controls */}
      <div style={toolbarStyle}>
        <button
          style={{ ...btnStyle, ...(history.past.length === 0 ? disabledBtn : {}) }}
          onClick={undo}
          disabled={history.past.length === 0}
        >
          ↶ Undo
        </button>

        <button
          style={{ ...btnStyle, ...(history.future.length === 0 ? disabledBtn : {}) }}
          onClick={redo}
          disabled={history.future.length === 0}
        >
          ↷ Redo
        </button>
      </div>

      {/* Main Grid Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "50px repeat(10, 80px)",
          gap: "1px",
          backgroundColor: "#ccc",
          border: "1px solid #999"
        }}
      >
        {/* Empty top-left corner */}
        <div />
        
        {/* Render Column Headers (A, B, C...) */}
        {columns.map(c => (
          <div key={c} style={{ background: "#f0f0f0", textAlign: "center", fontWeight: "bold" }}>
            {c}
          </div>
        ))}

        {/* Render Rows */}
        {rows.map(r => (
          <React.Fragment key={r}>
            {/* Row Number Header */}
            <div style={{ background: "#f0f0f0", textAlign: "center", fontWeight: "bold" }}>
              {r}
            </div>
            
            {/* Cells for this row */}
            {columns.map(c => {
              const id = `${c}${r}`;
              return (
                <div data-cell-id={id}>
                <Cell
                key={id}
                cellData={cells[id]}
                onCommit={updateCell}
                onNavigate={navigateCell}
                isActive={activeCellId === id}
                setActive={setActiveCellId}
                />

                </div>

              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Spreadsheet;