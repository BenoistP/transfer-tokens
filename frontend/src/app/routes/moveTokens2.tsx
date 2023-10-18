import { Outlet } from "@remix-run/react";

import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function MoveTokens2() {
  return (
    <>
      {/* <div className="w-screen pt-0 pr-4 px-2"> */}
      {/* <div className="w-full max-h-max pt-1 px-2"> */}
      <main>
        {/* <div className="flex flex-col w-full h-screen pt-1 px-2 bg-base-100"> */}
        <div className="flex flex-col w-full h-screen pt-0 bg-base-100">
        <Outlet />
        </div>
      </main>
    </>
  );
}