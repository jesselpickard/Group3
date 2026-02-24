import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function HelloWorld(){
  return (
    <header className="hello-header">
      <h1 className="Temp">Hello World!</h1> 
      <img className="Logo" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhx6IhMhWfkt9yhDxV4fGskiJDUoqQrfbp8w&s"></img>
    </header>
  )
}



const root = ReactDOM.createRoot(document.getElementById('root'));//runs the HelloWorld function
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();