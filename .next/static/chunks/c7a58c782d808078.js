(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,1811,t=>{"use strict";var e=t.i(43476),o=t.i(71645),r=t.i(32322);function i({farm:t,nearbyFarms:i=[]}){let n=(0,o.useRef)(null),a=(0,o.useRef)(null);return(0,o.useEffect)(()=>{if(!a.current||n.current)return;let e=r.default.map(a.current).setView([t.location.coordinates[1],t.location.coordinates[0]],12);r.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(e);let o=r.default.divIcon({className:"custom-div-icon",html:'<div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',iconSize:[30,30],iconAnchor:[15,15]});return r.default.marker([t.location.coordinates[1],t.location.coordinates[0]],{icon:o}).addTo(e).bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">🏠 ${t.farmName}</h3>
          <p style="margin: 4px 0; color: #059669; font-weight: 600;">Your Farm</p>
        </div>
      `),i.forEach(o=>{if(o._id===t._id)return;let i="#22c55e",n="🟩 Safe";"critical"===o.currentStatus?(i="#ef4444",n="🟥 Critical"):"warning"===o.currentStatus&&(i="#f59e0b",n="🟨 Warning");let a=r.default.divIcon({className:"custom-div-icon",html:`<div style="background-color: ${i}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,iconSize:[20,20],iconAnchor:[10,10]});r.default.marker([o.location.coordinates[1],o.location.coordinates[0]],{icon:a}).addTo(e).bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${o.farmName}</h3>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${n}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              ${o.distance?`Distance: ${o.distance} km`:""}
            </p>
          </div>
        `)}),n.current=e,()=>{n.current&&(n.current.remove(),n.current=null)}},[t,i]),(0,e.jsx)("div",{ref:a,className:"w-full h-full rounded-lg"})}t.s(["default",()=>i])},79427,t=>{t.n(t.i(1811))}]);