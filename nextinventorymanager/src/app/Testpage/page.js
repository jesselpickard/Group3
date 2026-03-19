"use client"

import { useState } from 'react';
import { scryfallApi } from '../API/Scryfall';
import "./MenuTest.css";

export default function Home() {
  //this page exists to test pieces without implementing it into another page
  return (
    <div>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <CollapsibleMenu/>
      <CardSearch/>
    </div>
  );
}
//to improve upon this, I should make components for the rows and stack them within
function CollapsibleMenu(){
  const [open, setOpen] = useState(true);

  return (
    <div className="container">
      <div className={`menu ${open ? "open" : "closed"}`}>
        <button onClick={() => setOpen(!open)}>
          {open ? "-" : "+"}
        </button>

        {open && (
          <>
            <div className = "searchContainer">
              <input type="text" placeholder="Filter:..."></input>
            </div>
            <CardTypeBox/>
            <SubtypeSearch/>
            <Row itemA={<CardTypeBox/>} itemB={<SubtypeSearch/>}/>
          </>
        )}
      </div>

      <div className="content">
        <p>Hello world! 2</p>
      </div>
    </div>
  );
}
function CardTypeBox(){
  return(
    <select>
      <option>Card type</option>
      <option value="artifact">Artifact</option>
      <option value="battle">Battle</option>
      <option value="creature">Creature</option>
      <option value="enchantment">Enchantment</option>
      <option value="instant">Instant</option>
      <option value="kindred">Kindred</option>
      <option value="planeswalker">Planeswalker</option>
      <option value="sorcery">Sorcery</option>
    </select>
  )
}
function SubtypeSearch(){
  return(
    <div className="subtypeSearch">
      <input type="text" className="subtypeSearch.input" placeHolder="Subtype..."></input>
    </div>
  )
}

function Row({itemA,itemB}){
  return(
    <div className="row">
      <div className="itemA">
        {itemA}
      </div>
      <div className="itemB">
        {itemB}
      </div>
    </div>
  )
}

function CardSearch() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState([]);

  const searchCards = async () => {
    const data = await scryfallApi.search(query);//calls to the api
    setCards(data.data || []);
  };

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cards..."/>
      <button onClick={searchCards}>Search</button>

      <ul>
        {cards.map((card) => (
          <li key={card.id}>
            {card.name}
            <br/>
            <a href={card.scryfall_uri}>
              <img
                src={card.image_uris?.small||card.card_faces?.[0]?.image_uris?.small}
                alt={card.name}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}