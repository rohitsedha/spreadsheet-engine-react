import React, { useState, useEffect } from "react";

// Individual grid cell component handling display, editing, and navigation
const Cell = ({ cellData, onCommit, onNavigate, isActive, setActive }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(cellData.raw);

  // Sync local state when external data changes (e.g., Undo/Redo)
  useEffect(() => {
    setLocalValue(cellData.raw);
  }, [cellData.raw]);

  // Auto-switch to edit mode when cell gains focus
  useEffect(() => {
    if (isActive) {
      setIsEditing(true);
    }
  }, [isActive]);

  // Save changes and optionally navigate to adjacent cell
  const finishEdit = (direction = null) => {
    setIsEditing(false);

    if (localValue !== cellData.raw) {
      onCommit(cellData.id, localValue);
    }

    if (direction) {
      onNavigate(cellData.id, direction);
    }
  };

  // Map specific keys (Enter, Tab, Arrows) to navigation directions
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishEdit(e.shiftKey ? "UP" : "DOWN");
    } else if (e.key === "Tab") {
      e.preventDefault();
      finishEdit(e.shiftKey ? "LEFT" : "RIGHT");
    } else if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
      finishEdit(e.key.replace("Arrow", "").toUpperCase());
    }
  };

  // Detect formula errors (e.g., #CIRCULAR, #ERROR)
  const isError =
    typeof cellData.value === "string" &&
    cellData.value.startsWith("#");

  // CELL STYLE (active border here)
  // Dynamic styling: highlights active cell and flags errors
  const cellStyle = {
    border: isActive ? "2px solid #1976d2" : "1px solid #ccc",
    minWidth: "80px",
    height: "30px",
    textAlign: "center",
    fontSize: isError ? "12px" : "14px",
    color: cellData.error ? "#d32f2f" : "#000",
    backgroundColor: cellData.error ? "#ffebee" : "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "text",
    boxSizing: "border-box"
  };

  return (
    <div
      style={cellStyle}
      // Click triggers activation and edit mode
      onClick={() => {
        setActive(cellData.id);
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        // Editing view
        <input
          autoFocus
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => finishEdit()}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            textAlign: "center",
            fontSize: "inherit"
          }}
        />
      ) : (
        // Read-only view
        <span>{cellData.value}</span>
      )}
    </div>
  );
};

export default Cell;