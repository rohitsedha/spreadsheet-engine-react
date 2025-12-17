import Spreadsheet from "./components/Spreadsheet";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Spreadsheet Engine with Formula Evaluation</h1>
        <p>
          A React-based spreadsheet supporting formulas, dependency resolution,
          circular reference detection, and undo/redo — built fully client-side.
        </p>
      </header>

      <main className="app-content">
        <Spreadsheet />
      </main>
    </div>
  );
}

export default App;
