"use client";
//import styles from "./page.module.css";
import './App.css';
import {useState} from 'react';
import Navbar from './components/Navbar';
import CardGrid from './components/CardGrid';

export default function Home() {
  return (
    <div>
      <Navbar />
      <CardGrid />
    </div>
  );
}
