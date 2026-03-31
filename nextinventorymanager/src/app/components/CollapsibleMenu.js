"use client";

import { useState, useEffect } from "react";
import { scryfallApi } from "../API/Scryfall";
import "./Menu.css";

export default function CollapsibleMenu({ setCards }) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [power, setPower] = useState({ op: "=", value: "" });
  const [toughness, setToughness] = useState({ op: "=", value: "" });
  const [mana, setMana] = useState({ op: "=", value: "" });
  const [setCode, setSetCode] = useState("");
  //add set and color
  //color should be made up of checkboxes

  const buildQuery = () => {
    const parts = [];
    if (query) parts.push(query);
    if (type) parts.push(`type:${type}`);
    if (subtype) parts.push(`type:${subtype}`);
    if (power.value) parts.push(`pow${power.op}${power.value}`);
    if (toughness.value) parts.push(`tou${toughness.op}${toughness.value}`);
    if (mana.value) parts.push(`cmc${mana.op}${mana.value}`);
    if (setCode) parts.push(`set:${setCode}`)
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
  }, [type, subtype, power, toughness, mana, setCode]);

  return (
    <div className="menu" style={{width: open ? "320px" : "50px", transition: "width 0.3s",}}>
      <button className="toggleBtn" onClick={() => setOpen(!open)}>
        {open ? "–" : "+"}
      </button>

      {open && (
        <div className="content">
          <div className="searchContainer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                CardSearch();
              }}>
              <input
                type="text"
                placeholder="Search cards..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>
          <Row
            itemA={<CardTypeBox value={type} onChange={setType} />}
            itemB={<TypeSearch value={subtype} onChange={setSubtype} placeholder={"Subtype..."}/>}
          />
          <Row /*need to fix the widths*/
            itemA={<NumberFilter label="Power" filter={power} setFilter={setPower} />}
            itemB={<NumberFilter label="Toughness" filter={toughness} setFilter={setToughness} />}
          />
          <Row
            itemA={<NumberFilter label="Mana Value" filter={mana} setFilter={setMana} />}
            itemB={<div/>} 
          />
          <Row
            itemA={<TypeSearch value={setCode} onChange={setSetCode}placeholder={"Set code (e.g. khm, neo)..."}/>}
            itemB={<div />}
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
      <div style={{ display: "flex", gap: "5px" }}>
        <select
          value={filter.op}
          onChange={(e) => setFilter({ ...filter, op: e.target.value })}
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
        />
      </div>
    </div>
  );
}

//use to nest menu items side by side
  //need to implement changes for P/T to be equal widths
export function Row({ itemA, itemB }) {
  return (
    <div className="row">
      <div className="itemA">{itemA}</div>
      <div className="itemB">{itemB}</div>
    </div>
  );
}


/**
 * This function will take utilize the FourBox and CheckSpread components to provide an inteface
 * for filtering colors. 
 */
function ColorSearch() {

}