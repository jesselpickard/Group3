import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function HelloWorld(){
  return(
    <header className='Header'>
      <h1 className='Temp'>Hello World!</h1>
      <img className='Wiz' src='https://cards.scryfall.io/large/front/1/5/151b332e-164b-4646-8f52-741984cd71ad.jpg?1562900074'></img>
    </header>
  )
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelloWorld />
  </React.StrictMode>
);
