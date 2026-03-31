"use client";

import { useState, useEffect } from "react";
import { scryfallApi } from "../API/Scryfall";
import "./Menu.css";
import FourBox from "./CheckBox4";
import { STATES } from './CheckBox4';
import CheckSpread from "./CheckSpread";

//I need to adjust the colors for the color search



export default function CollapsibleMenu({ setCards }) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [power, setPower] = useState({ op: "=", value: "" });
  const [toughness, setToughness] = useState({ op: "=", value: "" });
  const [mana, setMana] = useState({ op: "=", value: "" });
  const [setCode, setSetCode] = useState("");

  const [colors, setColors] = useState({//tracks the states of the color boxes
    white: STATES.UNMARKED,
    blue: STATES.UNMARKED,
    black: STATES.UNMARKED,
    red: STATES.UNMARKED,
    green: STATES.UNMARKED,
  });
  const COLOR_CODES = {//converts the colorname into a one letter code
    white: "w",
    blue: "u",
    black: "b",
    red: "r",
    green: "g",
  };

  const handleColorChange = (colorName, newState) => {
    setColors(prev => ({ ...prev, [colorName]: newState }));
  };

  const buildQuery = () => {
    const parts = [];
    if (query) parts.push(query);
    if (type) parts.push(`type:${type}`);
    if (subtype) parts.push(`type:${subtype}`);
    if (power.value) parts.push(`pow${power.op}${power.value}`);
    if (toughness.value) parts.push(`tou${toughness.op}${toughness.value}`);
    if (mana.value) parts.push(`cmc${mana.op}${mana.value}`);
    if (setCode) parts.push(`set:${setCode}`);


    //Groups colors by state, id needs to be worked a bit
      //all included colors should be within the id as well
    const included = [];
    const ids = [];
    const excluded = [];

    Object.entries(colors).forEach(([colorName, state]) => {//handles the color boxes
      const code = COLOR_CODES[colorName];
      if (!code) return;

      switch (state) {
        case STATES.INCLUDE:
          included.push(code);
          break;
        case STATES.ID:
          ids.push(code);
          break;
        case STATES.EXCLUDE:
          excluded.push(code);
          break;
        default:
          break; // UNMARKED / DISABLED
      }
    });

    //builds the strings for the color boxes
    if (included.length) parts.push(`c:${included.join("")}`);
    if (ids.length) parts.push(`id:${ids.join("")}`);
    if (excluded.length) parts.push(`-c:${excluded.join("")}`);

    return parts.join(" ");
  };

  const CardSearch = async () => {
    const searchQuery = buildQuery();
    const data = await scryfallApi.search(searchQuery);
    setCards(data.data || []);
  };


  useEffect(() => {
    const timeout = setTimeout(() => {
      CardSearch();
    }, 300);

    return () => clearTimeout(timeout);
  }, [type, subtype, power, toughness, mana, setCode, colors]);

  return (
    <div
      className="menu"
      style={{
        width: open ? "320px" : "50px",
        padding: open ? "10px" : "4px",
        transition: "width 0.3s, padding 0.3s",
      }}
    >

  {/* Toggle */}
  <button className="toggleBtn" onClick={() => setOpen(!open)}>
    {open ? "–" : "+"}
  </button>

  {open && (
    <div className="content">

      {/* Search */}
      <div className="row full-width">
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && CardSearch()}
        />
      </div>

      {/* Type / Subtype */}
      <div className="row">
        <div className="itemA">
          <CardTypeBox value={type} onChange={setType} />
        </div>
        <div className="itemB">
          <TypeSearch value={subtype} onChange={setSubtype} placeholder="Subtype..." />
        </div>
      </div>

      {/* Power / Toughness / Mana Value Row */}
      <div className="row">
        <div className="itemA">
          <NumberFilter label="Power" filter={power} setFilter={setPower} />
        </div>
        <div className="itemB">
          <NumberFilter label="Toughness" filter={toughness} setFilter={setToughness} />
        </div>
        <div className="itemC">
          <NumberFilter label="Mana Value" filter={mana} setFilter={setMana} />
        </div>
      </div>
      {/* Set Code + Color Filters */}
      <Row
        itemA={
          <TypeSearch
            value={setCode}
            onChange={setSetCode}
            placeholder="Set code..."
          />
        }
        itemB={ 
          <CheckSpread>
            <FourBox color="#dcc05c" onChange={(v) => handleColorChange("white", v)} />
            <FourBox color="#4268ba" onChange={(v) => handleColorChange("blue", v)} />
            <FourBox color="rgb(102, 0, 102)" onChange={(v) => handleColorChange("black", v)} />
            <FourBox color="#ff1919" onChange={(v) => handleColorChange("red", v)} />
            <FourBox color="#267e09" onChange={(v) => handleColorChange("green", v)} />
          </CheckSpread>
        }
      />
    </div>
  )}
</div>
  );
}

function CardTypeBox({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Card Type</option>
      <option value="artifact">Artifact</option>
      <option value="battle">Battle</option>
      <option value="creature">Creature</option>
      <option value="enchantment">Enchantment</option>
      <option value="instant">Instant</option>
      <option value="kindred">Kindred</option>
      <option value="planeswalker">Planeswalker</option>
      <option value="sorcery">Sorcery</option>
    </select>
  );
}
//use for any filter that takes text
function TypeSearch({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

//filter direction for any numeric filters
function NumberFilter({ label, filter, setFilter }) {
  return (
    <div className="numberFilter">
      <label>{label}</label>
      <div className="numberFilterRow">
        <select
          value={filter.op}
          onChange={(e) => setFilter({ ...filter, op: e.target.value })}
          className="operatorSelect"
        >
          <option value="=">=</option>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
        </select>
        <input
          type="number"
          min="0"
          value={filter.value}
          onChange={(e) => setFilter({ ...filter, value: e.target.value })}
          className="numberInput"
        />
      </div>
    </div>
  );
}

//use to nest menu items side by side
export function Row({ itemA, itemB }) {
  return (
    <div className="row">
      <div className="itemA">{itemA}</div>
      <div className="itemB">{itemB}</div>
    </div>
  );
}