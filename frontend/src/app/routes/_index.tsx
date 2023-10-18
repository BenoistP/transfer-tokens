
import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import stylesUrl from "~/styles/global.css";

import { Navbar } from "~/ui/Navbar";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function Index() {

  
  return (
    <>
      <p>_index.tsx</p>

      <Navbar />

      <nav>
        <Link className="text-primary-content" to="/moveTokens2">{"# moveTokens2"}</Link>{" "}
        {/* <Link to="/account">Account</Link>{" "}
        <Link to="/about">about</Link> */}
      </nav>


      <nav>
        <Link target="_blank" className="text-primary-content" to="/api/RealT-Token-List/tokens.json">{"# Json"}</Link>{" "}
        {/* <Link to="/account">Account</Link>{" "}
        <Link to="/about">about</Link> */}
      </nav>
    </>
  );
}
