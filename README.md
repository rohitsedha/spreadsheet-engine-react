# Spreadsheet Engine with Formula Evaluation

A React-based spreadsheet engine built as part of a technical assignment.  
The application supports formulas, dependency resolution, circular reference
detection, undo/redo functionality, and keyboard navigation — all implemented
fully on the client side.

## Features

- Excel-like grid with editable cells
- Formula evaluation using cell references (e.g. `=A1 + B1`)
- Dependency tracking with efficient recalculation
- Circular reference detection (`#CIRCULAR`)
- Undo / Redo support (buttons + keyboard shortcuts)
- Keyboard navigation (Enter, Tab, Arrow keys)
- Responsive and performant updates
- Fully client-side (no backend)

## Tech Stack

- React (Vite)
- JavaScript (ES6+)
- CSS
- mathjs (formula evaluation)

## Installation & Running Locally

```bash
npm install
npm run dev
```
Then run:
```bash
http://localhost:5173
```

## Keyboard Controls

| Action              | Key        |
| ------------------- | ---------- |
| Edit cell           | Click      |
| Commit & move down  | Enter      |
| Commit & move right | Tab        |
| Navigate            | Arrow keys |


## Example Test Scenarios

### Formula Evaluation
```bash
A1 = 5
A2 = 10
A3 = =A1 + A2
Result: A3 → 15
```
<img width="772" height="440" alt="image" src="https://github.com/user-attachments/assets/f12af457-7d8b-464a-bf40-63bd5586695e" />

### Dependency Update
```bash
Initial:
A1 = 5
A2 = 10
A3 = =A1 + A2
A3 → 15

After update:
Change A1 to 20
A3 updates automatically → 30
```
<img width="764" height="432" alt="image" src="https://github.com/user-attachments/assets/042fe2ec-5624-4a1e-90b5-351601fcbd45" />

### Circular Reference Detection
```bash
B1 = =C1
C1 = =B1
Result:
B1 → #CIRCULAR
C1 → #CIRCULAR
```
<img width="782" height="382" alt="image" src="https://github.com/user-attachments/assets/71e0fae0-5cf5-4edf-99a2-b067f997b43d" />

### Incomplete Formula Handling
```bash
A1 = 5
A2 = =A1+
Result:
A2 → #ERROR
```
<img width="456" height="398" alt="image" src="https://github.com/user-attachments/assets/2ff79ca1-f803-410d-a134-17e99d15a6af" />

### Division by Zero Handling
```bash
A1 = 10
A2 = 0
A3 = =A1/A2
Result:
A3 → #ERROR
```
<img width="646" height="406" alt="image" src="https://github.com/user-attachments/assets/0b71c619-44df-45d5-8ad9-4c177e84eeaa" />

### Invalid Formula Syntax
```bash
A1 = =+
Result:
A1 → #ERROR
```
<img width="636" height="334" alt="image" src="https://github.com/user-attachments/assets/61a6f4e6-6f47-43e1-8ec6-676c7fe1ee69" />

### Undo / Redo Functionality
```bash
A1 = 5
A1 changed to 10
Undo → A1 = 5
Redo → A1 = 10
```
<p>
  <img width="490" height="352" alt="image" src="https://github.com/user-attachments/assets/1640928c-a87f-4729-bb87-9cf3a1ed93c3" />
</p>

<p><em>After Undo:</em></p>

<p>
  <img width="496" height="390" alt="image" src="https://github.com/user-attachments/assets/276f088e-9656-4b81-b805-a18eed3c78d9" />
</p>

<p><em>After Redo:</em></p>

<p>
  <img width="482" height="380" alt="image" src="https://github.com/user-attachments/assets/114a0116-a5e8-4d6a-b34c-017ee36af76d" />
</p>


### Keyboard Navigation
```bash
Enter  → Commit value and move down
Tab    → Commit value and move right
Arrow keys → Navigate between cells
```


