//import logo from './logo.svg';
import './App.css';
import {useState} from 'react';
import Navbar from './components/Navbar';
import CardGrid from './components/CardGrid';

export default function App() {
  return (
    <div>
      <Navbar />
      <CardGrid />
    </div>
  )
}
