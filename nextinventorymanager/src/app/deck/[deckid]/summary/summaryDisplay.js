import CommanderSelector from "./commander/commanderSelect";
import CommanderDisplay from "./commander/commanderDisplay";
import FormatSelector from "./format/formatSelection";
import "./summary.css";

/**
 * Summary display component
 */

export default function Display({
  deckId,
  deckName,
  currentCommander,
  currentFormatId,
  summary
}) {


  const manaCurveEntries = summary?.manaCurve
    ? Object.entries(summary.manaCurve)
    : [];

  const maxValue = Math.max(
    ...manaCurveEntries.map(([_, value]) => value),
    1
  );

  return (
    <div className="summary-container">

      {/* Deck title */}
      <h1 className="deck-title">
        {deckName ?? "Untitled Deck"}
      </h1>

      <div className="summary-content">

        {/* LEFT */}
        <div className="summary-left">
          <CommanderDisplay deckId={deckId} />
          <CommanderSelector
            deckId={deckId}
            currentCommander={currentCommander}
          />
        </div>

        {/* CENTER */}
        <div className="summary-center">

          <div className="stat-block stat-curve">
            <h4>Mana Curve</h4>

            <div className="curve">
              {manaCurveEntries.map(([key, value]) => {
                const heightPercent = (value / maxValue) * 100;

                return (
                  <div key={key} className="curve-bar">
                    <div
                      className="curve-fill"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="curve-value">{value}</span>
                    <small>{key}</small>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="summary-right">

          <div className="stat-block stat-format">
            <h4>Format</h4>
            <p>{currentFormatId ?? "None"}</p>

            <FormatSelector
              deckId={deckId}
              currentFormatId={currentFormatId}
            />
          </div>

          <div className="stat-block stat-cardCount">
            <h4>Total Cards</h4>
            <p>{summary?.totalCards ?? 0}</p>
          </div>

        </div>
      </div>
    </div>
  );
}