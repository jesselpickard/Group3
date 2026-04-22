import CommanderSelector from "./commander/commanderSelect";
import CommanderDisplay from "./commander/commanderDisplay";
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
  currentFormatId
}) {
  return (
    <div className="summary-container">
      
      {/* Deck title */}
      <div className="summary-left">
        <h1 className="deck-title">
            {deckName ?? "Untitled Deck"}
        </h1>
      </div>
      <div className="summary-content">

        {/* LEFT: Commander */}
        <div className="summary-left">
          <CommanderDisplay deckId={deckId} />
          <CommanderSelector deckId={deckId} currentCommander={currentCommander}/>
        </div>

        {/* RIGHT: Everything else */}
        <div className="summary-right">
          {/* You’ll plug stats/components in here later */}
          <p>Format: {currentFormatId ?? "None"}</p>
          {/* future:
              mana curve
              color pips
              totals
          */}
        </div>

      </div>
    </div>
  );
}