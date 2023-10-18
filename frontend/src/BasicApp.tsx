
// import * as React from 'react';
import logo from './logo.svg';
import './App.css';

function MyButton({ title }: { title: string }) {
  return (
    <button>{title}</button>
  );
}

export default function BasicApp() {
  return (

    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div>
        <h1>Welcome to my app</h1>
        <MyButton title="I'm a button" />
      </div>
    </div>

  );
}
