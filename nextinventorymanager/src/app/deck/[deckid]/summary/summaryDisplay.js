import CommanderSelector from "./commander/commanderSelect";
import CommanderDisplay from "./commander/commanderDisplay";
import FormatSelector from "./format/formatSelection";
import "./summary.css";

/**
 * This file takes the deck's summary data and creates a visual representation of it.
 * The purpose of this is to clean up the page.js file to reduce clutter. I have yet to decide
 * whether I want the summary above or below the card stacks so this component will make it easy
 * to maneuver.
 */

export default function Display({
  deckId,
  deckName,
  currentCommander,
  currentFormatId,
  summary
}) {
  return (
    <div className="summary-container">
      
      {/* Deck title */}
      <h1 className="title">
        {deckName ?? "Untitled Deck"}
      </h1>

      <div className="summary-content">

        {/* LEFT: Commander */}
        <div className="summary-left">
          <CommanderDisplay deckId={deckId} />
          <CommanderSelector deckId={deckId} currentCommander={currentCommander}/>
        </div>
        <div className="summary-center">
          {/* MANA CURVE */}
            <div className="stat-block stat-curve">
                <h4>Mana Curve</h4>
                <div className="curve">
                {summary?.manaCurve &&
                    Object.entries(summary.manaCurve).map(([key, value]) => (
                    <div key={key} className="curve-bar">
                        <span>{value}</span>
                        <div
                        className="curve-fill"
                        style={{ height: `${value * 6}px` }}
                        />
                        <small>{key}</small>
                    </div>
                    ))}
                </div>
            </div>
        </div>
        {/* RIGHT: Everything else */}
        <div className="summary-right">

            {/* FORMAT */}
            <div className="stat-block stat-format">
                <h4 className="title">Deck Format: {currentFormatId ?? "Unselected"}</h4>

                <FormatSelector
                deckId={deckId}
                currentFormatId={currentFormatId}
                />
            </div>

            {/* CARD COUNT */}
            <div className="stat-block stat-cardCount">
                <h4>Total Cards</h4>
                <p>{summary?.totalCards ?? 0}</p>
            </div>
        </div>
      </div>
    </div>
  );
}