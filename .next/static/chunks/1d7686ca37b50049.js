(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,38936,t=>{"use strict";var e=t.i(43476),i=t.i(71645),o=t.i(32322);function r({farms:t,onEmergencyAlert:r,onViewDetails:a}){let n=(0,i.useRef)(null),d=(0,i.useRef)(null);return(0,i.useEffect)(()=>{if(!d.current)return;n.current&&(n.current.remove(),n.current=null);let e=o.default.map(d.current).setView([23.5,87.5],7);o.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(e),t.forEach(t=>{let i="#22c55e",r="🟩 Safe",a="#dcfce7";"critical"===t.currentStatus?(i="#ef4444",r="� Critical",a="#fee2e2"):"warning"===t.currentStatus&&(i="#f59e0b",r="� Warning",a="#fef3c7");let n="critical"===t.currentStatus?`<div style="position: relative;">
             <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${i}; opacity: 0.3; animation: pulse 2s infinite; top: -6px; left: -6px;"></div>
             <svg width="24" height="34" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 0C5.4 0 0 5.4 0 12c0 8.1 12 22 12 22s12-13.9 12-22c0-6.6-5.4-12-12-12z" fill="${i}" stroke="white" stroke-width="2"/>
               <circle cx="12" cy="12" r="5" fill="white"/>
             </svg>
           </div>`:`<svg width="24" height="34" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 0C5.4 0 0 5.4 0 12c0 8.1 12 22 12 22s12-13.9 12-22c0-6.6-5.4-12-12-12z" fill="${i}" stroke="white" stroke-width="2"/>
             <circle cx="12" cy="12" r="5" fill="white"/>
           </svg>`,d=o.default.divIcon({className:"custom-farm-pin",html:n,iconSize:[24,34],iconAnchor:[12,34],popupAnchor:[0,-34]}),s=t.ownerName||"Unknown Owner",p=t.phone||"N/A",l=t.poultryFarmId||t._id.slice(-8).toUpperCase(),c=t.farmType||"Broiler",g=t.aadhaarNumber?`XXXX XXXX ${t.aadhaarNumber.slice(-4)}`:"N/A",x=`
        <div style="min-width: 280px; padding: 8px; font-family: system-ui;">
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.1); opacity: 0.1; }
            }
            .popup-btn {
              padding: 6px 12px;
              border-radius: 6px;
              border: none;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              margin-right: 4px;
              margin-top: 4px;
            }
            .popup-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
          </style>
          
          <!-- Status Badge -->
          <div style="background: ${a}; padding: 8px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${i};">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">${t.farmName}</div>
            <div style="font-size: 14px; font-weight: 600; color: ${i};">${r}</div>
          </div>
          
          <!-- Owner Details -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 6px;">FARM OWNER</div>
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">👤 ${s}</div>
            <div style="font-size: 13px; margin-bottom: 2px;">📧 ${t.email||"N/A"}</div>
            <div style="font-size: 13px; margin-bottom: 2px;">📞 ${p}</div>
          </div>
          
          <!-- Farm Details -->
          <div style="margin-bottom: 12px; padding: 8px; background: #f9fafb; border-radius: 6px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">FARM DETAILS</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px;">
              <div><strong>ID:</strong> ${l}</div>
              <div><strong>Type:</strong> ${c}</div>
              <div><strong>District:</strong> ${t.district||"N/A"}</div>
              <div><strong>Aadhaar:</strong> ${g}</div>
            </div>
          </div>
          
          <!-- Location Coordinates -->
          <div style="font-size: 11px; color: #999; margin-bottom: 8px;">
            📍 ${t.location.coordinates[1].toFixed(5)}, ${t.location.coordinates[0].toFixed(5)}
          </div>
          
          <!-- Action Buttons -->
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <button 
              class="popup-btn" 
              onclick="window.parent.postMessage({type: 'call', farmId: '${t._id}', phone: '${p}'}, '*')"
              style="background: #10b981; color: white; flex: 1;">
              📞 Call
            </button>
            <button 
              class="popup-btn" 
              onclick="window.parent.postMessage({type: 'alert', farmId: '${t._id}'}, '*')"
              style="background: #ef4444; color: white; flex: 1;">
              🚨 Alert
            </button>
            <button 
              class="popup-btn" 
              onclick="window.parent.postMessage({type: 'view', farmId: '${t._id}'}, '*')"
              style="background: #3b82f6; color: white; width: 100%;">
              📊 View Details
            </button>
          </div>
        </div>
      `;o.default.marker([t.location.coordinates[1],t.location.coordinates[0]],{icon:d}).addTo(e).bindPopup(x,{maxWidth:300})});let i=t=>{"call"===t.data.type&&"N/A"!==t.data.phone?window.open(`tel:${t.data.phone}`,"_blank"):"alert"===t.data.type&&r?r(t.data.farmId):"view"===t.data.type&&a&&a(t.data.farmId)};window.addEventListener("message",i);let s=new o.default.Control({position:"bottomright"});return s.onAdd=function(){let e=o.default.DomUtil.create("div","info legend");return e.innerHTML=`
        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
          <h4 style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">Farm Status Legend</h4>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 18px; height: 18px; background: #22c55e; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            <span style="font-size: 13px;">Safe (${t.filter(t=>"safe"===t.currentStatus).length})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 18px; height: 18px; background: #f59e0b; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            <span style="font-size: 13px;">Warning (${t.filter(t=>"warning"===t.currentStatus).length})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 18px; height: 18px; background: #ef4444; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
            <span style="font-size: 13px;">Critical (${t.filter(t=>"critical"===t.currentStatus).length})</span>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
            Total Farms: <strong>${t.length}</strong>
          </div>
        </div>
      `,e},s.addTo(e),n.current=e,()=>{window.removeEventListener("message",i),n.current&&(n.current.remove(),n.current=null)}},[t,r,a]),(0,e.jsx)("div",{ref:d,className:"w-full h-full rounded-lg"})}t.s(["default",()=>r])},92841,t=>{t.n(t.i(38936))}]);