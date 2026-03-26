"use client"

import { useState } from 'react';
import { scryfallApi } from '../API/Scryfall';
import Link from "next/link";
import "./MenuTest.css";
import FourBox from '../components/CheckBox4';
import CheckSpread from '../components/CheckSpread';

export default function Home() {
  //this page exists to test pieces without implementing it into another page

  const [test, setTest] = useState("Unmarked");//test for the 4 state checkbox

  return (
    <div>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <CollapsibleMenu/>
      <FourBox value={test} onChange={setTest}/>
      <CardSearch/>
      <app/>
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

//Inventory will use a variant of this, once we get our database up
function CardSearch() {//be careful taking away from this part, for use with cardGrid
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState([]);

  const searchCards = async () => {
    const data = await scryfallApi.search(query);//calls to the api
    setCards(data.data || []);
  };

//the card search above should be easily converted for use with cardGrid, but ownership of the cards item must change 

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cards..."/>
      <button onClick={searchCards}>Search</button>
      <ul>
        {cards.map((card) => (//the mapping more or less lines up with the needs for cardGrid
          <li key={card.id}>
            {card.name}
            <br/>
            <Link href={`/CardInfo?id=${card.id}`}>
              <img
                src={card.image_uris?.small}//remember to return here to try displaying double faced cards
                alt={card.name}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [values, setValues] = useState([0, 1, 2, 3, 0]);

  const handleChange = (index, newValue) => {
    const updated = [...values];
    updated[index] = newValue;
    setValues(updated);
  };

  return (
    <div style={{ padding: 20 }}>
      <CheckSpread>
        {values.map((val, i) => (
          <FourBox
            key={i}
            value={val}
            color="lightgray"
            onChange={(newVal) => handleChange(i, newVal)}
          />
        ))}
      </CheckSpread>
    </div>
  );
}