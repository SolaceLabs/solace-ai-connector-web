import{r as s,j as e}from"./index-DOqvKUId.js";import{u as g,g as k}from"./ConfigProvider-BKYrVbJF.js";import{o as p}from"./index-Cx_IO0gb.js";function N(){const[o]=p(),[h,m]=s.useState(null),[c,n]=s.useState(null),[t,x]=s.useState(!1),{configServerUrl:u}=g();s.useEffect(()=>{const i=document.documentElement.classList.contains("dark")||localStorage.getItem("theme")==="dark"||!localStorage.getItem("theme")&&window.matchMedia("(prefers-color-scheme: dark)").matches;x(i)},[]),s.useEffect(()=>{(async()=>{const l=o.get("temp_code");if(!l){n("No temporary code provided");return}try{const a=await k(),d=await fetch(`${u}/exchange-temp-code`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":a??""},body:JSON.stringify({temp_code:l})}),r=await d.json();if(!d.ok)throw new Error(r.error||"Failed to exchange code");localStorage.setItem("access_token",r.access_token),localStorage.setItem("refresh_token",r.refresh_token),m(r.access_token)}catch(a){n(a.message)}})()},[o]);const f=()=>c?e.jsxs("div",{className:"text-red-500",children:[e.jsx("h2",{className:t?"text-white":"text-black",children:"Error"}),e.jsx("p",{className:t?"text-red-400":"text-red-500",children:c})]}):h?e.jsxs("div",{className:"space-y-4",children:[e.jsx("h2",{className:`text-2xl ${t?"text-white":"text-black"}`,children:"Successfully Authenticated!"}),e.jsx("button",{onClick:()=>window.location.href="/",className:"bg-solace-green text-white px-6 py-2 rounded shadow hover:bg-solace-dark-green",children:"Go to Chat"})]}):e.jsx("div",{className:t?"text-white":"text-black",children:"Processing authentication..."});return e.jsx("div",{className:`min-h-screen flex items-center justify-center ${t?"bg-gray-900":"bg-white"}`,children:e.jsx("div",{className:"text-center p-8 max-w-lg",children:f()})})}export{N as default};
