import { useState, useMemo, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import TopBar from "./components/global/nav.topBar";
import FlowchartView from "./pages/FlowchartView.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import { ALL_CATALOG_ITEMS } from "./lib/catalog";
import { LOCODES } from "./lib/cores/locations";
import { VENDOR_MAP } from "./lib/cores/vendors";
import { getRoleColorMap, getRoleDotMap } from "./lib/roles";
import { INIT_PROJECTS, INIT_TICKETS, mkD } from "./lib/dummyData/mockDataCenter";
import { USERS } from "./lib/dummyData/demoUsers";
import { CATALOG_GROUP_LABEL, D, getCatalogGroupColorMap } from "./lib/cores/inventory";
import { CATS, getCategoryColorMap } from "./lib/cores/inventory/consumables";
import { getStatusChipStyles, STATS } from "./components/statusStyles";
import { PALETTE_COLOURS } from "./components/global/palleteColours";

const ticketQrValue=(t)=>t?.qrPayload||`pickit://ticket/${t?.id||""}`;

const parseCatalogUsd=(s)=>{if(!s||typeof s!=="string")return null;const n=Number.parseFloat(s.replace(/[$,\s]/g,""));return Number.isFinite(n)?n:null;};

const SC=getStatusChipStyles(D);

const CC=getCategoryColorMap(D);
const ROLE_COLOR=getRoleColorMap(D);
const ROLE_DOT=getRoleDotMap(D);

const PARTS_CATALOG=(()=>{
  const seen=new Set();
  const groups={};
  for(const it of ALL_CATALOG_ITEMS){
    const pn=(it.partNumber||"").trim();
    if(!pn)continue;
    const key=pn.toUpperCase();
    if(seen.has(key))continue;
    seen.add(key);
    const group=CATALOG_GROUP_LABEL[it.category]||"Other";
    const desc=((it.description||it.model||"").trim())||pn;
    const price=parseCatalogUsd(it.estimatedCost)??0;
    (groups[group]||=[]).push({pn,desc,price,mfr:it.manufacturer||""});
  }
  for(const g of Object.values(groups)){
    g.sort((a,b)=>a.pn.localeCompare(b.pn,"en",{numeric:true,sensitivity:"base"}));
  }
  return groups;
})();
const PARTS_CATALOG_FLAT=Object.entries(PARTS_CATALOG).flatMap(([cat,items])=>items.map(i=>({...i,cat})));

const CATALOG_PRICE_BY_PN=(()=>{const m=new Map();for(const it of ALL_CATALOG_ITEMS){const p=parseCatalogUsd(it.estimatedCost);const k=(it.partNumber||"").trim().toUpperCase();if(k&&p!=null&&!m.has(k))m.set(k,p);}return m;})();
const bomUnitPrice=(item)=>{const k=(item.partNumber||"").trim().toUpperCase();if(k&&CATALOG_PRICE_BY_PN.has(k))return CATALOG_PRICE_BY_PN.get(k);return item.unitPrice||0;};

const tod=()=>new Date().toISOString().split("T")[0];

const inpS={fontSize:12,padding:"7px 10px",borderRadius:8,border:`0.5px solid ${D.border}`,background:D.bg2,color:D.t1,outline:"none",boxSizing:"border-box",width:"100%"};
const selS={...inpS,cursor:"pointer"};
const btnS={fontSize:12,padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:500};

function csvExport(rows,name){const cols=Object.keys(rows[0]);const txt=[cols.join(","),...rows.map(r=>cols.map(c=>`"${String(r[c]??'').replace(/"/g,'""')}"`).join(","))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"text/csv"}));a.download=name;a.click();}

// ── UI primitives ────────────────────────────────────────────────────────────
const Badge=({s})=>{const c=SC[s]||SC["Open / Submitted"];return <span style={{fontSize:10,fontWeight:500,padding:"3px 10px",borderRadius:20,background:c.bg,color:c.tx,border:`0.5px solid ${c.bd}`,whiteSpace:"nowrap"}}>{s}</span>;};
const Av=({name,bg=D.blueB,fg=D.blueT})=><div style={{width:26,height:26,borderRadius:"50%",background:bg,color:fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500,flexShrink:0}}>{name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()}</div>;
const Hr=()=><div style={{height:"0.5px",background:D.border,margin:"12px 0"}}/>;
const Bar=({v,m,c})=><div style={{flex:1,height:6,background:D.bg3,borderRadius:3,overflow:"hidden"}}><div style={{width:`${m>0?Math.round((v/m)*100):0}%`,height:"100%",background:c,borderRadius:3}}/></div>;

// ── PartSearch: searchable grouped part picker ───────────────────────────────
function PartSearch({value, onChange}){
  const [query,setQuery]=useState("");
  const [open,setOpen]=useState(false);
  const inputRef=useRef(null);
  const containerRef=useRef(null);

  const filtered=useMemo(()=>{
    const q=query.toLowerCase().trim();
    if(!q)return PARTS_CATALOG;
    const result={};
    Object.entries(PARTS_CATALOG).forEach(([cat,items])=>{
      const matches=items.filter(i=>i.pn.toLowerCase().includes(q)||i.desc.toLowerCase().includes(q));
      if(matches.length)result[cat]=matches;
    });
    return result;
  },[query]);

  const totalResults=Object.values(filtered).reduce((s,a)=>s+a.length,0);
  const vendorLabel=value&&VENDOR_MAP[value]?` · ${VENDOR_MAP[value]}`:"";
  const displayValue=value?`${value}${vendorLabel}`:"";

  function select(pn){setQuery("");onChange(pn);setOpen(false);}

  const handleBlur=(e)=>{
    if(!containerRef.current?.contains(e.relatedTarget)){setOpen(false);setQuery("");}
  };

  const catColor=getCatalogGroupColorMap(D);

  return(
    <div ref={containerRef} style={{position:"relative"}} onBlur={handleBlur}>
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <input
          ref={inputRef}
          value={open?query:displayValue}
          onChange={e=>{setQuery(e.target.value);setOpen(true);}}
          onFocus={()=>{setOpen(true);setQuery("");}}
          placeholder="Search parts…"
          style={{...inpS,paddingRight:28,cursor:"text"}}
        />
        {value&&!open&&(
          <button onClick={(e)=>{e.preventDefault();e.stopPropagation();onChange("");setQuery("");}} tabIndex={-1}
            style={{position:"absolute",right:6,background:"transparent",border:"none",color:D.t3,cursor:"pointer",fontSize:14,lineHeight:1,padding:2}}
          >×</button>
        )}
        {!value&&(
          <div style={{position:"absolute",right:8,color:D.t3,fontSize:10,pointerEvents:"none"}}>▾</div>
        )}
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:D.bg1,border:`0.5px solid ${D.borderH}`,borderRadius:8,zIndex:500,maxHeight:280,overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          {totalResults===0?(
            <div style={{padding:"12px 12px",fontSize:12,color:D.t3,textAlign:"center"}}>No parts found for "{query}"</div>
          ):Object.entries(filtered).map(([cat,items])=>(
            <div key={cat}>
              <div style={{padding:"6px 12px 4px",fontSize:10,fontWeight:600,color:catColor[cat]||D.t3,textTransform:"uppercase",letterSpacing:".06em",background:D.bg2,borderBottom:`0.5px solid ${D.border}`,position:"sticky",top:0}}>
                {cat} <span style={{fontWeight:400,color:D.t3}}>({items.length})</span>
              </div>
              {items.map(item=>{
                const vendor=VENDOR_MAP[item.pn]||item.mfr||"—";
                return(
                  <div key={item.pn} onMouseDown={e=>{e.preventDefault();select(item.pn);}}
                    style={{padding:"7px 12px",cursor:"pointer",display:"flex",alignItems:"baseline",gap:10,borderBottom:`0.5px solid ${D.border}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=D.bg3}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  >
                    <span style={{fontSize:12,fontWeight:500,color:D.t1,flex:1,fontFamily:"ui-monospace,SFMono-Regular,Menlo,monospace"}}>{item.pn}</span>
                    <span style={{fontSize:11,color:catColor[cat]||D.t3,whiteSpace:"nowrap",flexShrink:0,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}} title={vendor}>{vendor}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ProjectSelector: link-or-create an NSIM project for a ticket ─────────────
function ProjectSelector({ticketId, currentProjectId, onLink, projects, allSites, setProjects}){
  const [creating,setCreating]=useState(false);
  const [cf,setCf]=useState({name:"",site:"",dataHall:"",subsidiary:"",description:""});

  if(creating){return(
    <div style={{background:D.bg3,border:`0.5px solid ${D.blue}`,borderRadius:8,padding:14,marginTop:8}}>
      <div style={{fontSize:12,fontWeight:500,color:D.blueT,marginBottom:10}}>Create new project</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <div style={{gridColumn:"1/-1"}}><div style={{fontSize:10,color:D.t3,marginBottom:3}}>Project name *</div><input value={cf.name} onChange={e=>setCf(f=>({...f,name:e.target.value}))} placeholder="e.g. OBG01 DH2 Optics & Cables" style={inpS}/></div>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:3}}>Site *</div>
          <select value={cf.site} onChange={e=>setCf(f=>({...f,site:e.target.value}))} style={selS}>
            <option value="">Select…</option>
            {allSites.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:3}}>Data hall</div><input value={cf.dataHall} onChange={e=>setCf(f=>({...f,dataHall:e.target.value}))} placeholder="DH2" style={inpS}/></div>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:3}}>Subsidiary</div><input value={cf.subsidiary} onChange={e=>setCf(f=>({...f,subsidiary:e.target.value}))} placeholder="CoreWeave, Inc" style={inpS}/></div>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:3}}>Description</div><input value={cf.description} onChange={e=>setCf(f=>({...f,description:e.target.value}))} placeholder="Optional" style={inpS}/></div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={()=>setCreating(false)} style={{...btnS,background:"transparent",color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400,fontSize:11}}>Cancel</button>
        <button onClick={()=>{
          if(!cf.name||!cf.site)return;
          const p={id:`proj-${Date.now()}`,name:cf.name,code:cf.site,dataHall:cf.dataHall,subsidiary:cf.subsidiary,description:cf.description,createdAt:tod(),items:[]};
          setProjects(prev=>[...prev,p]);
          setCreating(false);
          if(onLink)onLink(p.id,p.name);
        }} style={{...btnS,background:D.blue,color:"#fff",fontSize:11}}>Create & link</button>
      </div>
    </div>
  );}

  const selectable=projects.filter(p=>!p.woNumber);
  return(
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <select defaultValue="" onChange={e=>{if(e.target.value&&onLink)onLink(e.target.value,selectable.find(p=>p.id===e.target.value)?.name);}} style={{...selS,flex:1,maxWidth:320,fontSize:12}}>
        <option value="">Select a project…</option>
        {selectable.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <button onClick={()=>setCreating(true)} style={{...btnS,background:D.bg3,color:D.blueT,border:`0.5px solid ${D.blue}`,fontSize:11,padding:"6px 12px",whiteSpace:"nowrap"}}>+ Create project</button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function PickItApp({initialUser,onLogout}){
  const [tickets,setTickets]=useState(INIT_TICKETS);
  const [projects,setProjects]=useState(INIT_PROJECTS);
  const [view,setView]=useState("board");
  const [aTab,setATab]=useState("overview");
  const [selId,setSelId]=useState(null);
  const [user,setUser]=useState(initialUser);
  const [showForm,setShowForm]=useState(false);
  const [showUserMenu,setShowUserMenu]=useState(false);
  const [fSite,setFSite]=useState("");
  const [fStat,setFStat]=useState("");
  const [form,setForm]=useState({site:"",dataHall:"",rack:"",ru:"",ics:"",dcm:"",taskLink:"",lines:[{id:1,part:"",qty:""}]});
  const [comment,setComment]=useState("");
  const [showExcess,setShowExcess]=useState(false);
  const [exF,setExF]=useState([]);
  const [nsToast,setNsToast]=useState(null);
  const [icsToast,setIcsToast]=useState(null);
  const [aFrom,setAFrom]=useState(mkD(30));
  const [aTo,setATo]=useState(mkD(0));
  const [aSite,setASite]=useState("");
  const [aPart,setAPart]=useState("");
  const [activePrj,setActivePrj]=useState("proj-1");
  const [prjSiteFilter,setPrjSiteFilter]=useState("");
  const [showNewPrj,setShowNewPrj]=useState(false);
  const [showItemForm,setShowItemForm]=useState(false);
  const [showWO,setShowWO]=useState(false);
  const [woProject,setWoProject]=useState(null);
  const [woStatus,setWoStatus]=useState(null);
  const [woMemo,setWoMemo]=useState("");
  const [editItem,setEditItem]=useState(null);
  const [pForm,setPForm]=useState({name:"",site:"",dataHall:"",subsidiary:"",description:""});
  const [iForm,setIForm]=useState({partNumber:"",description:"",category:"Optics",unit:"ea",qtyPlanned:"",qtyIns:"",qtyRet:"",unitPrice:""});

  const tcRef=useRef(42);
  const btcRef=useRef(11);
  const gid=()=>{tcRef.current++;return`PICK-00${tcRef.current}`;};
  const gbt=()=>{btcRef.current++;return`BT${String(btcRef.current).padStart(4,"0")}`;};

  const selT=selId?tickets.find(t=>t.id===selId):null;
  const canApprove=user.role==="DCM / Tiger Team";
  const canClose=user.role==="ICS";
  const now=()=>new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});
  const entry=(action,detail="")=>({ts:now(),who:user.name,role:user.role,action,detail});

  const filtered=tickets.filter(t=>(!fSite||t.code.startsWith(fSite))&&(!fStat||t.status===fStat));
  const mx={open:tickets.filter(t=>t.status!=="Resolved / Closed").length,pend:tickets.filter(t=>t.status==="Pending Approval").length,inp:tickets.filter(t=>t.status==="In Progress – Work Underway").length,excess:tickets.filter(t=>t.status==="Excess Return Pending").length,res:tickets.filter(t=>t.status==="Resolved / Closed").length};

  const released=useMemo(()=>tickets.filter(t=>{const ok=["In Progress – Work Underway","Excess Return Pending","Resolved / Closed"].includes(t.status);return ok&&(!aFrom||t.date>=aFrom)&&(!aTo||t.date<=aTo)&&(!aSite||t.code.startsWith(aSite))&&(!aPart||t.part===aPart);}),[tickets,aFrom,aTo,aSite,aPart]);
  const allParts=[...new Set(tickets.map(t=>t.part))].sort();
  const allSites=[...new Set(tickets.map(t=>t.code))].sort();
  const bySite=useMemo(()=>{const m={};released.forEach(t=>{const s=t.code;if(!m[s])m[s]={label:s,parts:{},total:0};if(!m[s].parts[t.part])m[s].parts[t.part]=0;m[s].parts[t.part]+=(t.qtyIns??t.qtyReq);m[s].total+=(t.qtyIns??t.qtyReq);});return Object.entries(m).sort((a,b)=>b[1].total-a[1].total);},[released]);
  const byPart=useMemo(()=>{const m={};released.forEach(t=>{if(!m[t.part])m[t.part]=0;m[t.part]+=(t.qtyIns??t.qtyReq);});return Object.entries(m).sort((a,b)=>b[1]-a[1]);},[released]);
  const grand=useMemo(()=>released.reduce((s,t)=>s+(t.qtyIns??t.qtyReq),0),[released]);
  const maxS=bySite.length?bySite[0][1].total:1;
  const maxP=byPart.length?byPart[0][1]:1;
  const prj=projects.find(p=>p.id===activePrj);
  const prjStats=prj?(()=>{const tot=prj.items.reduce((s,i)=>s+i.qtyPlanned,0);const ins=prj.items.reduce((s,i)=>s+i.qtyIns,0);const ret=prj.items.reduce((s,i)=>s+i.qtyRet,0);return{tot,ins,ret};})():null;

  function fireNS(t,dir="Stored → In Process",qty=null){
    const btNum=gbt();
    const lines=t.lines&&t.lines.length>1?t.lines:null;
    const xferQty=qty??(lines?lines.reduce((s,l)=>s+l.qtyReq,0):t.qtyReq);
    const siteCode=t.code;
    console.log("[NetSuite] Bin transfer:",{ref:btNum,ticket:t.id,lines:lines||[{part:t.part,qty:xferQty}],from:dir.split(" → ")[0],to:dir.split(" → ")[1],site:siteCode});
    setNsToast({btNum,id:t.id,lines:lines||[{part:t.lines?t.lines[0].part:t.part,qtyReq:xferQty}],site:siteCode,siteFull:t.code,dir});
    setTimeout(()=>setNsToast(null),8000);
    return btNum;
  }

  function submitTicket(){
    const validLines=form.lines.filter(l=>l.part.trim()&&parseInt(l.qty)>0);
    if(!form.site||!form.dataHall||!form.rack||!form.ics||validLines.length===0)return;
    const id=gid();
    const lines=validLines.map(l=>({part:l.part.trim(),qtyReq:parseInt(l.qty),qtyIns:null,qtyRet:null}));
    const loc=[form.dataHall,form.rack,form.ru].filter(Boolean).join(" · ");const detail=lines.map(l=>`${l.part} × ${l.qtyReq}`).join(", ")+" – "+loc;
    const qrPayload=`pickit://ticket/${id}?ts=${Date.now()}`;
    const autoApprove=user.role==="DCM / Tiger Team";
    const baseLog=[{ts:now(),who:user.name,role:user.role,action:"Ticket submitted",detail},{ts:now(),who:user.name,role:user.role,action:"QR tag assigned",detail:qrPayload}];
    if(autoApprove)baseLog.push({ts:now(),who:user.name,role:user.role,action:"Ticket approved",detail:"Auto-approved — submitted by DCM / Tiger Team Lead"});
    const t={id,code:form.site,lines,location:loc,qtyReq:lines.reduce((s,l)=>s+l.qtyReq,0),qtyIns:null,qtyRet:null,req:user.name,ics:form.ics,dcm:form.dcm||null,taskLink:form.taskLink||"",projectId:null,status:autoApprove?"Approved – Pending Transfer":"Pending Approval",date:tod(),comments:[],asana:"",qrPayload,log:baseLog};
    setTickets(p=>[t,...p]);
    setForm({site:"",dataHall:"",rack:"",ru:"",ics:"",dcm:"",taskLink:"",lines:[{id:1,part:"",qty:""}]});
    setShowForm(false);
    setSelId(t.id);setView("detail");
    if(autoApprove){
      setIcsToast({id:t.id,ics:t.ics,site:t.code,siteFull:t.code,location:loc,lines,by:user.name});
      setTimeout(()=>setIcsToast(null),9000);
    }
  }

  function advance(id){
    setTickets(p=>p.map(t=>{
      if(t.id!==id)return t;
      const i=STATS.indexOf(t.status);
      if(i>=STATS.length-1)return t;
      const next=STATS[i+1];
      const aMap={"Pending Approval":"Ticket approved","Approved – Pending Transfer":"Picked / Staged","Picked / Staged":"Materials received & work begun","In Progress – Work Underway":"Excess return flagged"};
      const action=aMap[t.status]||`Status → ${next}`;
      let detail="";
      if(t.status==="Approved – Pending Transfer"){detail="Materials staged — DCT notified";}
      else if(t.status==="Picked / Staged"){
        const bt=fireNS(t);
        if(t.projectId){
          const ticketLines=t.lines&&t.lines.length?t.lines:[{part:t.part,qtyReq:t.qtyReq}];
          setProjects(prev=>prev.map(p=>{
            if(p.id!==t.projectId)return p;
            let items=[...p.items];
            ticketLines.forEach(l=>{
              const idx=items.findIndex(i=>i.partNumber===l.part);
              if(idx>=0){items[idx]={...items[idx],qtyPlanned:items[idx].qtyPlanned+(l.qtyReq||0),qtyIns:items[idx].qtyIns+(l.qtyReq||0)};}
              else{const _ci=PARTS_CATALOG_FLAT.find(x=>x.pn===l.part);items.push({id:`i${Date.now()}-${l.part}`,partNumber:l.part,description:_ci?.desc||l.part,category:_ci?.cat||"Other",unit:"ea",qtyPlanned:l.qtyReq,qtyIns:l.qtyReq,qtyRet:0,unitPrice:_ci?.price||0});}
            });
            return{...p,items};
          }));
        }
        const partsSummary=(t.lines&&t.lines.length>1?t.lines.map(l=>`${l.qtyReq}× ${l.part}`).join(", "):`${t.qtyReq}× ${t.lines?t.lines[0].part:t.part}`);
        detail=`NetSuite ${bt} fired — ${t.code} — ${partsSummary} Stored → In Process`;
      }
      return{...t,status:next,log:[...(t.log||[]),{ts:now(),who:user.name,role:user.role,action,detail}]};
    }));
  }

  function closeT(id){setTickets(p=>p.map(t=>t.id===id?{...t,status:"Resolved / Closed",log:[...(t.log||[]),entry("Ticket closed","Resolved / Closed")]}:t));}

  function addComment(){
    if(!comment.trim()||!selT)return;
    const c={who:`${user.name} (${user.role})`,text:comment};
    setTickets(p=>p.map(t=>t.id===selT.id?{...t,comments:[...t.comments,c],log:[...(t.log||[]),entry("Comment added",comment)]}:t));
    setComment("");
  }

  function submitExcess(){
    if(!selT||!exF.length)return;
    const totalRet=exF.reduce((s,l)=>s+(parseInt(l.qtyRet)||0),0);
    const totalIns=exF.reduce((s,l)=>s+(parseInt(l.qtyIns)||0),0);
    const tForNS={...selT,lines:exF.map(l=>({part:l.part,qtyReq:parseInt(l.qtyRet)||0}))};
    const btNum=fireNS(tForNS,"In Process → Stored",totalRet);
    const linesSummary=exF.map(l=>`${l.part}: used ${l.qtyIns??0} / returned ${l.qtyRet??0}`).join(" | ");
    const note={who:`${user.name} (${user.role})`,text:`Excess flagged — ${linesSummary} | NetSuite ${btNum}: ${totalRet} unit(s) In Process → Stored`};
    if(selT.projectId&&totalRet>0){
      setProjects(prev=>prev.map(p=>{
        if(p.id!==selT.projectId)return p;
        let items=[...p.items];
        exF.forEach(l=>{
          const ret=parseInt(l.qtyRet)||0;
          if(!ret)return;
          const idx=items.findIndex(i=>i.partNumber===l.part);
          if(idx>=0){items[idx]={...items[idx],qtyIns:Math.max(0,items[idx].qtyIns-ret),qtyRet:items[idx].qtyRet+ret};}
        });
        return{...p,items};
      }));
    }
    const updatedLines=selT.lines?selT.lines.map(l=>{
      const ex=exF.find(e=>e.part===l.part);
      return ex?{...l,qtyIns:parseInt(ex.qtyIns)||0,qtyRet:parseInt(ex.qtyRet)||0}:l;
    }):selT.lines;
    setTickets(p=>p.map(t=>t.id===selT.id?{...t,status:"Excess Return Pending",qtyIns:totalIns,qtyRet:totalRet,lines:updatedLines,comments:[...t.comments,note],log:[...(t.log||[]),entry("Excess return flagged",`${linesSummary} | NetSuite ${btNum}: ${totalRet} unit(s) In Process → Stored`)]}:t));
    setExF([]);setShowExcess(false);
  }

  function createPrj(){
    if(!pForm.name||!pForm.site)return;
    const p={id:`proj-${Date.now()}`,name:pForm.name,code:pForm.site,dataHall:pForm.dataHall,subsidiary:pForm.subsidiary,description:pForm.description,createdAt:tod(),items:[]};
    setProjects(prev=>[...prev,p]);setActivePrj(p.id);setPForm({name:"",site:"",dataHall:"",subsidiary:"",description:""});setShowNewPrj(false);
  }

  function saveItem(){
    if(!iForm.partNumber||!iForm.qtyPlanned)return;
    const item={id:editItem||`i${Date.now()}`,partNumber:iForm.partNumber,description:iForm.description,category:iForm.category,unit:iForm.unit,qtyPlanned:parseInt(iForm.qtyPlanned)||0,qtyIns:parseInt(iForm.qtyIns)||0,qtyRet:parseInt(iForm.qtyRet)||0,unitPrice:parseFloat(iForm.unitPrice)||0};
    setProjects(prev=>prev.map(p=>{if(p.id!==activePrj)return p;return editItem?{...p,items:p.items.map(i=>i.id===editItem?item:i)}:{...p,items:[...p.items,item]};}));
    setIForm({partNumber:"",description:"",category:"Optics",unit:"ea",qtyPlanned:"",qtyIns:"",qtyRet:"",unitPrice:""});setEditItem(null);setShowItemForm(false);
  }
  function startEdit(item){setIForm({partNumber:item.partNumber,description:item.description,category:item.category,unit:item.unit,qtyPlanned:item.qtyPlanned,qtyIns:item.qtyIns,qtyRet:item.qtyRet,unitPrice:item.unitPrice||""});setEditItem(item.id);setShowItemForm(true);}
  function delItem(id){setProjects(prev=>prev.map(p=>p.id!==activePrj?p:{...p,items:p.items.filter(i=>i.id!==id)}));}
  function exportPrj(p){if(!p?.items.length)return;csvExport(p.items.map(i=>({"Project":p.name,"NSIM Ref":p.nsimRef||"","Site":p.code,"Data Hall":p.dataHall||"","Part Number":i.partNumber,"Description":i.description,"Category":i.category,"Unit":i.unit,"Qty Planned":i.qtyPlanned,"Qty Installed":i.qtyIns,"Qty Returned":i.qtyRet,"Outstanding":Math.max(0,i.qtyPlanned-i.qtyIns),"% Complete":i.qtyPlanned>0?Math.round((i.qtyIns/i.qtyPlanned)*100)+"%" :"0%","Notes":i.notes,"Export Date":tod()})),`${p.name.replace(/[^a-z0-9]/gi,"_")}_NSIM_${tod()}.csv`);}
  function exportOverview(){if(!bySite.length)return;const rows=[];bySite.forEach(([site,d])=>Object.entries(d.parts).forEach(([part,qty])=>rows.push({"Site":site,"Part Number":part,"Qty Released":qty,"From":aFrom,"To":aTo})));csvExport(rows,`optics_summary_${tod()}.csv`);}

  const Topbar=(
    <TopBar
      theme={D}
      view={view}
      onViewChange={setView}
      user={user}
      users={USERS}
      showUserMenu={showUserMenu}
      onToggleUserMenu={()=>setShowUserMenu(!showUserMenu)}
      onSelectUser={(u)=>{setUser({name:u.name,role:u.role,email:u.email});setShowUserMenu(false);}}
      onLogout={onLogout}
      onNewTicket={()=>setShowForm(true)}
      fSite={fSite}
      onFSiteChange={setFSite}
      fStat={fStat}
      onFStatChange={setFStat}
      locodes={LOCODES}
      statuses={STATS}
    />
  );

  const MRow=(
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:10,marginBottom:16}}>
      {[["Open today",mx.open,"active tickets",D.t1],["Pending approval",mx.pend,"awaiting DCM",D.t1],["In progress",mx.inp,"materials issued",D.t1],["Excess return",mx.excess,"pending return",mx.excess>0?D.amberT:D.t1],["Resolved",mx.res,"closed",D.t1]].map(([l,v,s,vc])=>(
        <div key={l} style={{background:D.bg1,border:`0.5px solid ${l==="Excess return"&&mx.excess>0?D.amber:D.border}`,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:14,color:D.t3,marginBottom:5,fontWeight:500}}>{l}</div>
          <div style={{fontSize:22,fontWeight:500,color:vc}}>{v}</div>
          <div style={{fontSize:11,color:D.t2,marginTop:2}}>{s}</div>
        </div>
      ))}
    </div>
  );

  const BoardView=(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10}}>
      {["Pending Approval","Approved – Pending Transfer","Picked / Staged","In Progress – Work Underway"].map(col=>{
        const items=filtered.filter(t=>t.status===col);const c=SC[col];
        return <div key={col}>
          <div style={{fontSize:11,fontWeight:500,padding:"0 0 8px",display:"flex",justifyContent:"space-between"}}><span style={{color:c.tx}}>{col}</span><span style={{fontSize:10,background:D.bg3,borderRadius:20,padding:"1px 7px",color:D.t3}}>{items.length}</span></div>
          {items.map(t=><div key={t.id} onClick={()=>{setSelId(t.id);setView("detail");}} style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor=D.borderH} onMouseLeave={e=>e.currentTarget.style.borderColor=D.border}>
            <div style={{fontSize:10,color:D.t3,marginBottom:3}}>{t.id}</div>
            <div style={{fontSize:12,fontWeight:500,color:D.t1,marginBottom:6,lineHeight:1.4}}>
              {t.lines?t.lines.map(l=>l.part).join(", "):t.part} – {t.location.split("–")[0].trim()}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:D.blueB,color:D.blueT}}>{t.code}</span><div style={{display:"flex",gap:4}}><Av name={t.req}/><Av name={t.ics} bg={D.tealB} fg={D.tealT}/></div></div>
          </div>)}
        </div>;
      })}
    </div>
  );

  const ListView=(
    <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,tableLayout:"fixed"}}>
        <thead><tr style={{background:D.bg2}}>{["Ticket","Site","Part","Location","Req","Used","Ret","Status","Date"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:11,color:D.t3,fontWeight:500}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map((t,i)=><tr key={t.id} onClick={()=>{setSelId(t.id);setView("detail");}} style={{borderBottom:`0.5px solid ${D.border}`,cursor:"pointer",background:i%2===0?"transparent":D.bg2}}>
          <td style={{padding:"8px 10px",color:D.blue,fontWeight:600,fontSize:13}}>{t.id}</td>
          <td style={{padding:"8px 10px",color:D.t1}}>{t.code}</td>
          <td style={{padding:"8px 10px",color:D.t1}}>{t.lines?t.lines.map(l=>l.part).join(", "):t.part}</td>
          <td style={{padding:"8px 10px",color:D.t2}}>{t.location}</td>
          <td style={{padding:"8px 10px",color:D.t1,fontWeight:500}}>{t.qtyReq}</td>
          <td style={{padding:"8px 10px",color:D.tealT,fontWeight:500}}>{t.qtyIns??'—'}</td>
          <td style={{padding:"8px 10px",color:D.amberT}}>{t.qtyRet??'—'}</td>
          <td style={{padding:"8px 10px"}}><Badge s={t.status}/></td>
          <td style={{padding:"8px 10px",color:D.blueT,fontWeight:500}}>{t.date}</td>
        </tr>)}</tbody>
      </table>
    </div>
  );

  const qrPrintRef=useRef(null);
  function printQrTag(t){
    if(!t)return;
    const svgEl=qrPrintRef.current?.querySelector("svg");
    const svgMarkup=svgEl?new XMLSerializer().serializeToString(svgEl):"";
    const value=ticketQrValue(t);
    const dateStr=new Date(t.date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});
    const w=window.open("","_blank","width=420,height=560");
    if(!w){alert("Enable popups to print the QR tag.");return;}
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t.id} — PickIT tag</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif;color:#0b0d12;background:#fff}
.tag{padding:24px;text-align:center}
.brand{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#475569;margin-bottom:6px}
.ticket{font-size:28px;font-weight:800;letter-spacing:.02em;margin:4px 0 2px}
.accent{color:#1E40F6}
.date{font-size:13px;color:#475569;margin-bottom:14px}
.qr{display:inline-block;padding:10px;border:1px solid #e2e8f0;border-radius:10px;background:#fff}
.qr svg{width:220px;height:220px;display:block}
.payload{margin-top:10px;font-size:10px;color:#94a3b8;word-break:break-all}
.hint{margin-top:6px;font-size:10px;color:#64748b}
@media print{
  @page{size:auto;margin:8mm}
  .noprint{display:none}
  .tag{padding:0}
}
button{margin-top:14px;padding:8px 18px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font:inherit;cursor:pointer}
</style></head><body>
<div class="tag">
  <div class="brand">PickIT · CoreWeave</div>
  <div class="ticket">${t.id.replace(/^(PICK-)(.*)$/,'$1<span class="accent">$2</span>')}</div>
  <div class="date">${dateStr}</div>
  <div class="qr">${svgMarkup}</div>
  <div class="payload">${value}</div>
  <div class="hint">Scan to open this ticket in PickIT</div>
  <button class="noprint" onclick="window.print()">Print</button>
</div>
<script>window.addEventListener('load',()=>{setTimeout(()=>window.print(),120);});</script>
</body></html>`);
    w.document.close();
  }

  const DetailView=selT&&(
    <div>
      <button onClick={()=>setView("board")} style={{fontSize:11,padding:"4px 10px",borderRadius:6,border:`0.5px solid ${D.border}`,background:"transparent",color:D.t2,cursor:"pointer",marginBottom:12}}>← Back</button>
      <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:12,padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:14}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:D.blue,marginBottom:4,letterSpacing:"0.01em"}}>{selT.id}<span style={{fontWeight:400,color:D.blueT,fontSize:13,marginLeft:10}}>{selT.date}</span></div>
            <div style={{fontSize:15,fontWeight:500,color:D.t1}}>
              {selT.lines?selT.lines.map(l=>l.part).join(", "):selT.part} – {selT.location}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            <Badge s={selT.status}/>
            <div title={ticketQrValue(selT)} style={{display:"flex",alignItems:"center",gap:8,background:D.bg2,border:`0.5px solid ${D.border}`,borderRadius:8,padding:"6px 10px"}}>
              <div ref={qrPrintRef} style={{background:"#fff",padding:4,borderRadius:4,lineHeight:0}}>
                <QRCodeSVG value={ticketQrValue(selT)} size={64} level="M" bgColor="#ffffff" fgColor="#0b0d12"/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:0}}>
                <span style={{fontSize:9,color:D.t3,textTransform:"uppercase",letterSpacing:".06em"}}>Ticket tag</span>
                <span style={{fontSize:11,fontWeight:600,color:D.t1,letterSpacing:".02em"}}>{selT.id}</span>
                <span style={{fontSize:9,color:D.t3}}>Scan to open</span>
                <button onClick={()=>printQrTag(selT)} style={{marginTop:3,fontSize:10,padding:"3px 8px",borderRadius:6,border:`0.5px solid ${D.border}`,background:D.bg3,color:D.t1,cursor:"pointer",fontWeight:500,letterSpacing:".02em"}} title="Print QR tag">Print</button>
              </div>
            </div>
          </div>
        </div>
        {selT.lines&&selT.lines.length>1?(
          <div style={{background:D.bg2,borderRadius:8,marginBottom:14,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"140px 1fr 110px 70px 70px 70px",gap:0}}>
              {["Part","Description","Vendor","Requested","Used","Returned"].map(h=>(
                <div key={h} style={{padding:"6px 10px",fontSize:10,color:D.t3,fontWeight:500,borderBottom:`0.5px solid ${D.border}`}}>{h}</div>
              ))}
              {selT.lines.map((l,i)=>{
                const ci=PARTS_CATALOG_FLAT.find(x=>x.pn===l.part);
                const bdr=i<selT.lines.length-1?`0.5px solid ${D.border}`:"none";
                return [
                  <div key={`p${i}`} style={{padding:"7px 10px",fontSize:12,color:D.t1,fontWeight:500,borderBottom:bdr}}>{l.part}</div>,
                  <div key={`d${i}`} style={{padding:"7px 10px",fontSize:11,color:D.t2,borderBottom:bdr}}>{ci?.desc||'—'}</div>,
                  <div key={`v${i}`} style={{padding:"7px 10px",fontSize:11,color:D.t3,borderBottom:bdr}}>{VENDOR_MAP[l.part]||'—'}</div>,
                  <div key={`r${i}`} style={{padding:"7px 10px",fontSize:12,color:D.t2,borderBottom:bdr}}>{l.qtyReq}</div>,
                  <div key={`u${i}`} style={{padding:"7px 10px",fontSize:12,color:D.tealT,fontWeight:500,borderBottom:bdr}}>{l.qtyIns??'—'}</div>,
                  <div key={`ret${i}`} style={{padding:"7px 10px",fontSize:12,color:l.qtyRet>0?D.amberT:D.t3,borderBottom:bdr}}>{l.qtyRet??'—'}</div>
                ];
              })}
            </div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
            {[["Qty requested",selT.qtyReq,D.t2],["Qty used / installed",selT.qtyIns??'—',D.tealT],["Qty returned",selT.qtyRet??'—',(selT.qtyRet??0)>0?D.amberT:D.t3]].map(([l,v,c])=>(
              <div key={l} style={{background:D.bg2,borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:D.t3,marginBottom:4}}>{l}</div>
                <div style={{fontSize:22,fontWeight:500,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {selT.status==="Excess Return Pending"&&(
          <div style={{background:D.amberB,border:`0.5px solid ${D.amber}`,borderRadius:8,padding:"10px 14px",marginBottom:14}}>
            <div style={{fontSize:11,color:D.amberT,fontWeight:500,marginBottom:6}}>NetSuite bin transfer required</div>
            <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:2}}>Qty to return to Stored</div><div style={{fontSize:18,fontWeight:500,color:D.amberT}}>{selT.qtyRet??0} unit{(selT.qtyRet??0)!==1?"s":""}</div></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:2}}>Direction</div><div style={{fontSize:14,fontWeight:500,color:D.t1}}>In Process → Stored</div></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:2}}>Reference</div><div style={{fontSize:14,fontWeight:500,color:D.t1}}>{selT.id}</div></div>
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          {[["Site",selT.code],["Part",selT.lines?selT.lines.map(l=>l.part).join(", "):selT.part],["Location",selT.location],["Requestor",selT.req],["ICS",selT.ics],["DCM Lead",selT.dcm||"—"],["Asana",selT.asana||'—']].map(([k,v])=>(
            <div key={k}><div style={{fontSize:10,color:D.t3,textTransform:"uppercase",letterSpacing:".04em",marginBottom:3}}>{k}</div><div style={{fontSize:13,fontWeight:500,color:D.t1}}>{v}</div></div>
          ))}
          {selT.taskLink&&(
            <div style={{gridColumn:"1/-1"}}>
              <div style={{fontSize:10,color:D.t3,textTransform:"uppercase",letterSpacing:".04em",marginBottom:3}}>Task link</div>
              <a href={selT.taskLink} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:D.blueT,wordBreak:"break-all",textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>
                <span style={{flexShrink:0,fontSize:10,padding:"1px 6px",borderRadius:4,background:D.blueB,color:D.blueT,border:`0.5px solid ${D.blue}`,fontWeight:500}}>{selT.taskLink.includes("atlassian")||selT.taskLink.includes("jira")?"Jira":"Asana"}</span>
                {selT.taskLink}
              </a>
            </div>
          )}
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:10,color:D.t3,textTransform:"uppercase",letterSpacing:".04em",marginBottom:3}}>Linked project</div>
            {selT.projectId?(()=>{
              const lp=projects.find(p=>p.id===selT.projectId);
              return lp?(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:2,background:D.blue,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:500,color:D.blueT,cursor:"pointer"}} onClick={()=>{setActivePrj(lp.id);setView("projects");}}>{lp.name}</span>
                  <span style={{fontSize:10,color:D.t3}}>↗ view project</span>
                </div>
              ):<span style={{fontSize:13,color:D.t3}}>Project not found</span>;
            })():<span style={{fontSize:13,color:D.t3}}>—</span>}
          </div>
        </div>
        <Hr/>
        <div style={{fontSize:11,fontWeight:500,color:D.t2,marginBottom:10}}>Activity log</div>
        {(!selT.log||selT.log.length===0)&&<div style={{fontSize:12,color:D.t3,fontStyle:"italic",marginBottom:8}}>No activity yet.</div>}
        <div style={{position:"relative",paddingLeft:20,marginBottom:10}}>
          <div style={{position:"absolute",left:7,top:4,bottom:4,width:"0.5px",background:D.border}}/>
          {(selT.log||[]).map((e,i)=>{
            const rc=ROLE_COLOR[e.role]||D.t2;
            const dc=ROLE_DOT[e.role]||D.t3;
            const isCmt=e.action==="Comment added";
            return <div key={i} style={{position:"relative",marginBottom:12}}>
              <div style={{position:"absolute",left:-17,top:3,width:9,height:9,borderRadius:"50%",background:dc,border:`1.5px solid ${D.bg1}`}}/>
              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:isCmt?3:0}}>
                <span style={{fontSize:10,color:D.t3,minWidth:38,fontVariantNumeric:"tabular-nums"}}>{e.ts}</span>
                <span style={{fontSize:11,fontWeight:500,color:rc}}>{e.who}</span>
                <span style={{fontSize:10,color:D.t3}}>{e.role}</span>
              </div>
              <div style={{marginLeft:46}}>
                <span style={{fontSize:12,color:D.t1,fontWeight:isCmt?400:500}}>{e.action}</span>
                {e.detail&&!isCmt&&<span style={{fontSize:11,color:D.t3,marginLeft:6}}>{e.detail}</span>}
                {isCmt&&<div style={{background:D.bg2,borderRadius:6,padding:"6px 10px",marginTop:3,borderLeft:`2px solid ${dc}`,fontSize:12,color:D.t2}}>{e.detail}</div>}
              </div>
            </div>;
          })}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment…" style={{...inpS,flex:1}} onKeyDown={e=>e.key==="Enter"&&addComment()}/>
          <button onClick={addComment} style={{...btnS,background:D.bg3,color:D.t1,border:`0.5px solid ${D.border}`,fontWeight:400}}>Post</button>
        </div>
        <Hr/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {canApprove&&selT.status==="Pending Approval"&&<button onClick={()=>advance(selT.id)} style={{...btnS,background:D.greenB,color:D.greenT}}>Approve ticket</button>}
          {canClose&&selT.status==="Approved – Pending Transfer"&&(
            <div style={{width:"100%"}}>
              <div style={{background:D.bg2,border:`0.5px solid ${D.border}`,borderRadius:8,padding:"12px 14px",marginBottom:10}}>
                <div style={{fontSize:10,color:D.t3,textTransform:"uppercase",letterSpacing:".04em",marginBottom:8}}>Project assignment</div>
                {(()=>{
                  const lp=selT.projectId?projects.find(p=>p.id===selT.projectId):null;
                  return lp?(
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
                        <div style={{width:8,height:8,borderRadius:2,background:D.blue,flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:500,color:D.blueT}}>{lp.name}</span>
                        {lp.code&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:D.blueB,color:D.blueT}}>{lp.code}</span>}
                        {lp.dataHall&&<span style={{fontSize:11,color:D.t3}}>Hall: <span style={{color:D.t2}}>{lp.dataHall}</span></span>}
                        {lp.subsidiary&&<span style={{fontSize:11,color:D.t3}}>Subsidiary: <span style={{color:D.t2}}>{lp.subsidiary}</span></span>}
                      </div>
                      {(()=>{
                        const ticketLines=selT.lines&&selT.lines.length?selT.lines:[{part:selT.part,qtyReq:selT.qtyReq}];
                        return(
                          <div style={{paddingTop:8,borderTop:`0.5px solid ${D.border}`}}>
                            <div style={{background:D.bg3,borderRadius:6,overflow:"hidden"}}>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 64px 64px 64px 64px",borderBottom:`0.5px solid ${D.border}`}}>
                                {["Part","Planned","Installed","Outstdg","This ticket"].map(h=><div key={h} style={{padding:"5px 8px",fontSize:10,color:D.t3,fontWeight:500}}>{h}</div>)}
                              </div>
                              {ticketLines.map((l,i)=>{
                                const match=lp.items.find(i=>i.partNumber===l.part);
                                return(
                                  <div key={l.part} style={{display:"grid",gridTemplateColumns:"1fr 64px 64px 64px 64px",borderTop:i>0?`0.5px solid ${D.border}`:"none",alignItems:"center"}}>
                                    <div style={{padding:"6px 8px",fontSize:11,color:D.t1,fontWeight:500}}>{l.part}</div>
                                    <div style={{padding:"6px 8px",fontSize:11,color:D.t2,textAlign:"center"}}>{match?match.qtyPlanned:"—"}</div>
                                    <div style={{padding:"6px 8px",fontSize:11,color:D.tealT,textAlign:"center",fontWeight:500}}>{match?match.qtyIns:"—"}</div>
                                    <div style={{padding:"6px 8px",fontSize:11,color:match&&match.qtyPlanned-match.qtyIns>0?D.redT:D.greenT,textAlign:"center",fontWeight:500}}>{match?Math.max(0,match.qtyPlanned-match.qtyIns):"—"}</div>
                                    <div style={{padding:"6px 8px",fontSize:11,color:D.blueT,textAlign:"center",fontWeight:500}}>+{l.qtyReq}</div>
                                  </div>
                                );
                              })}
                            </div>
                            {ticketLines.some(l=>!lp.items.find(i=>i.partNumber===l.part))&&(
                              <div style={{fontSize:10,color:D.t3,marginTop:6}}>
                                Parts marked — will be auto-added to BOM on receipt confirmation.
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ):(
                    <div>
                      <div style={{fontSize:11,color:D.t3,marginBottom:8}}>No project linked. Assign one now:</div>
                      <ProjectSelector
                        ticketId={selT.id}
                        currentProjectId={selT.projectId}
                        projects={projects}
                        allSites={allSites}
                        setProjects={setProjects}
                        onLink={(pid,pname)=>{
                          setTickets(prev=>prev.map(t=>t.id===selT.id?{...t,projectId:pid,log:[...(t.log||[]),{ts:now(),who:user.name,role:user.role,action:"Linked to project",detail:pname}]}:t));
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
              <button onClick={()=>advance(selT.id)} style={{...btnS,background:"#14532d",color:"#6ee7b7"}}>Picked / Staged — notify DCT</button>
            </div>
          )}
          {selT.status==="Approved – Pending Transfer"&&!canClose&&<span style={{fontSize:12,color:D.t3,fontStyle:"italic"}}>Awaiting ICS to pick & stage.</span>}
          {selT.status==="Picked / Staged"&&<div style={{width:"100%"}}>
            <div style={{background:D.tealB,border:`0.5px solid ${D.teal}`,borderRadius:8,padding:"10px 14px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:500,color:D.tealT,marginBottom:8}}>NetSuite bin transfer will fire on confirmation</div>
              <div style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:12,marginBottom:8}}>
                <div><span style={{color:D.t3}}>Site </span><span style={{color:D.tealT,fontWeight:500}}>{selT.code}</span></div>
                <div><span style={{color:D.t3}}>From </span><span style={{color:D.t1}}>Stored</span></div>
                <div><span style={{color:D.t3}}>To </span><span style={{color:D.t1}}>In Process</span></div>
                <div><span style={{color:D.t3}}>Ref </span><span style={{color:D.t1}}>{selT.id}</span></div>
              </div>
              <div style={{background:"rgba(0,0,0,0.2)",borderRadius:6,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 60px",borderBottom:`0.5px solid rgba(45,212,191,0.15)`}}>
                  <div style={{padding:"5px 10px",fontSize:10,color:D.t3}}>Part</div>
                  <div style={{padding:"5px 10px",fontSize:10,color:D.t3,textAlign:"right"}}>Qty</div>
                </div>
                {(selT.lines&&selT.lines.length?selT.lines:[{part:selT.lines?selT.lines[0].part:selT.part,qtyReq:selT.qtyReq}]).map((l,i,arr)=>(
                  <div key={l.part} style={{display:"grid",gridTemplateColumns:"1fr 60px",borderTop:i>0?`0.5px solid rgba(45,212,191,0.1)`:"none"}}>
                    <div style={{padding:"6px 10px",fontSize:12,color:D.t1,fontWeight:500}}>{l.part}</div>
                    <div style={{padding:"6px 10px",fontSize:12,color:D.tealT,fontWeight:600,textAlign:"right"}}>{l.qtyReq}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={()=>advance(selT.id)} style={{...btnS,background:D.tealB,color:D.tealT,border:`0.5px solid ${D.teal}`}}>Confirm receipt & begin work</button>
          </div>}
          {selT.status==="In Progress – Work Underway"&&<>
            {canClose&&<button onClick={()=>closeT(selT.id)} style={{...btnS,background:D.greenB,color:D.greenT}}>Close – no excess</button>}
            <button onClick={()=>{
              const lines=selT.lines&&selT.lines.length?selT.lines:[{part:selT.part,qtyReq:selT.qtyReq}];
              setExF(lines.map(l=>({part:l.part,qtyReq:l.qtyReq,qtyIns:String(l.qtyReq),qtyRet:"0"})));
              setShowExcess(true);
            }} style={{...btnS,background:D.amberB,color:D.amberT,border:`0.5px solid ${D.amber}`}}>Flag excess return</button>
          </>}
          {selT.status==="Excess Return Pending"&&canClose&&<button onClick={()=>closeT(selT.id)} style={{...btnS,background:D.greenB,color:D.greenT}}>Confirm return & close</button>}
          {selT.status==="Resolved / Closed"&&(
            <div style={{width:"100%"}}>
              <Hr/>
              <div style={{fontSize:11,fontWeight:500,color:D.t2,marginBottom:8}}>Link to project</div>
              {selT.projectId?(()=>{
                const lp=projects.find(p=>p.id===selT.projectId);
                return lp?(
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{width:8,height:8,borderRadius:2,background:D.green,flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:500,color:D.greenT,cursor:"pointer"}} onClick={()=>{setActivePrj(lp.id);setView("projects");}}>{lp.name}</span>
                    <span style={{fontSize:10,color:D.t3,cursor:"pointer"}} onClick={()=>{setActivePrj(lp.id);setView("projects");}}>↗ view project</span>
                    <button onClick={()=>setTickets(p=>p.map(t=>t.id===selT.id?{...t,projectId:null}:t))} style={{fontSize:10,padding:"2px 8px",borderRadius:4,border:`0.5px solid ${D.border}`,background:"transparent",color:D.t3,cursor:"pointer",marginLeft:"auto"}}>Unlink</button>
                  </div>
                ):<span style={{fontSize:12,color:D.t3}}>Project not found.</span>;
              })():(
                <div>
                  <div style={{fontSize:11,color:D.t3,marginBottom:8}}>Select the project this ticket contributed to for tracking in the Project Tracker.</div>
                  <ProjectSelector
                    ticketId={selT.id}
                    currentProjectId={selT.projectId}
                    projects={projects}
                    allSites={allSites}
                    setProjects={setProjects}
                    onLink={(pid,pname)=>{
                      setTickets(prev=>prev.map(t=>{
                        if(t.id!==selT.id)return t;
                        return{...t,projectId:pid,log:[...(t.log||[]),{ts:now(),who:user.name,role:user.role,action:"Linked to project",detail:pname}]};
                      }));
                      setProjects(prev=>prev.map(p=>{
                        if(p.id!==pid)return p;
                        const ticketLines=selT.lines&&selT.lines.length?selT.lines:[{part:selT.part,qtyReq:selT.qtyReq,qtyIns:selT.qtyIns,qtyRet:selT.qtyRet}];
                        let items=[...p.items];
                        ticketLines.forEach((l,li)=>{
                          const ins=l.qtyIns??l.qtyReq;
                          const ret=l.qtyRet??0;
                          const idx=items.findIndex(i=>i.partNumber===l.part);
                          if(idx>=0){items[idx]={...items[idx],qtyPlanned:items[idx].qtyPlanned+(l.qtyReq||0),qtyIns:items[idx].qtyIns+ins,qtyRet:items[idx].qtyRet+ret};}
                          else{const _ci=PARTS_CATALOG_FLAT.find(x=>x.pn===l.part);items.push({id:`i${Date.now()}-${li}`,partNumber:l.part,description:_ci?.desc||l.part,category:_ci?.cat||"Other",unit:"ea",qtyPlanned:l.qtyReq,qtyIns:ins,qtyRet:ret,unitPrice:_ci?.price||0});}
                        });
                        return{...p,items};
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const exTotalRet=exF.reduce((s,l)=>s+(parseInt(l.qtyRet)||0),0);
  const exTotalIns=exF.reduce((s,l)=>s+(parseInt(l.qtyIns)||0),0);

  const ExcessModal=showExcess&&selT&&exF.length>0&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
      <div style={{background:D.bg1,border:`0.5px solid ${D.amber}`,borderRadius:12,padding:24,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{fontSize:14,fontWeight:500,color:D.amberT,marginBottom:2}}>Flag excess return</div>
        <div style={{fontSize:11,color:D.t3,marginBottom:16}}>{selT.id} · {selT.code}</div>

        {/* Per-line table */}
        <div style={{background:D.bg2,borderRadius:8,overflow:"hidden",marginBottom:16}}>
          {/* Header */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 72px 72px 72px",gap:0,borderBottom:`0.5px solid ${D.border}`}}>
            {["Part","Requested","Installed","Returned"].map(h=>(
              <div key={h} style={{padding:"7px 10px",fontSize:10,color:D.t3,fontWeight:500}}>{h}</div>
            ))}
          </div>
          {/* Rows */}
          {exF.map((line,i)=>(
            <div key={line.part} style={{display:"grid",gridTemplateColumns:"1fr 72px 72px 72px",gap:0,borderTop:i>0?`0.5px solid ${D.border}`:"none",alignItems:"center"}}>
              <div style={{padding:"8px 10px",fontSize:12,color:D.t1,fontWeight:500}}>{line.part}</div>
              <div style={{padding:"8px 10px",fontSize:12,color:D.t2,textAlign:"center"}}>{line.qtyReq}</div>
              <div style={{padding:"4px 6px"}}>
                <input
                  type="number" min="0" max={line.qtyReq}
                  value={line.qtyIns}
                  onChange={e=>{
                    const ins=Math.min(parseInt(e.target.value)||0,line.qtyReq);
                    const ret=Math.max(0,line.qtyReq-ins);
                    setExF(prev=>prev.map(l=>l.part===line.part?{...l,qtyIns:String(ins),qtyRet:String(ret)}:l));
                  }}
                  style={{...inpS,textAlign:"center",padding:"5px 4px",fontSize:13,color:D.tealT,fontWeight:500}}
                />
              </div>
              <div style={{padding:"4px 6px"}}>
                <input
                  type="number" min="0" max={line.qtyReq}
                  value={line.qtyRet}
                  onChange={e=>{
                    const ret=Math.min(parseInt(e.target.value)||0,line.qtyReq);
                    const ins=Math.max(0,line.qtyReq-ret);
                    setExF(prev=>prev.map(l=>l.part===line.part?{...l,qtyRet:String(ret),qtyIns:String(ins)}:l));
                  }}
                  style={{...inpS,textAlign:"center",padding:"5px 4px",fontSize:13,color:D.amberT,fontWeight:500}}
                />
              </div>
            </div>
          ))}
          {/* Totals footer */}
          {exF.length>1&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 72px 72px 72px",gap:0,borderTop:`0.5px solid ${D.border}`,background:D.bg3}}>
              <div style={{padding:"7px 10px",fontSize:11,color:D.t3,fontWeight:500}}>Total</div>
              <div style={{padding:"7px 10px",fontSize:11,color:D.t2,textAlign:"center",fontWeight:500}}>{exF.reduce((s,l)=>s+l.qtyReq,0)}</div>
              <div style={{padding:"7px 10px",fontSize:11,color:D.tealT,textAlign:"center",fontWeight:500}}>{exTotalIns}</div>
              <div style={{padding:"7px 10px",fontSize:11,color:D.amberT,textAlign:"center",fontWeight:500}}>{exTotalRet}</div>
            </div>
          )}
        </div>

        {/* NS transfer summary */}
        {exTotalRet>0&&(
          <div style={{background:D.amberB,border:`0.5px solid ${D.amber}`,borderRadius:8,padding:"12px 14px",marginBottom:16}}>
            <div style={{fontSize:11,color:D.amberT,fontWeight:500,marginBottom:8}}>NetSuite bin transfer summary</div>
            <div style={{marginBottom:8}}>
              {exF.filter(l=>parseInt(l.qtyRet)>0).map(l=>(
                <div key={l.part} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:D.t2}}>{l.part}</span>
                  <span style={{color:D.amberT,fontWeight:500}}>{l.qtyRet} unit{parseInt(l.qtyRet)!==1?"s":""} → Stored</span>
                </div>
              ))}
            </div>
            <div style={{borderTop:`0.5px solid rgba(245,158,11,0.3)`,paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:12}}>
              <span style={{color:D.t3}}>Total to return</span>
              <span style={{color:D.amberT,fontWeight:600}}>{exTotalRet} unit{exTotalRet!==1?"s":""} In Process → Stored</span>
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={()=>{setShowExcess(false);setExF([]);}} style={{...btnS,background:D.bg3,color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400}}>Cancel</button>
          <button onClick={submitExcess} style={{...btnS,background:D.amber,color:"#000"}}>Submit excess return</button>
        </div>
      </div>
    </div>
  );

  async function submitWorkOrder(p){
    setWoStatus("submitting");
    const payload={
      type:"workorder",
      subsidiary:{name:"CoreWeave, Inc"},
      location:{name:p.code},
      assembly:{name:"Site Consumables"},
      quantity:1,
      memo:woMemo,
      components:p.items.map(i=>({item:{name:i.partNumber},quantity:i.qtyPlanned,description:i.description||i.partNumber}))
    };
    console.log("[NetSuite] POST /workorders",JSON.stringify(payload,null,2));
    // Simulated API — replace with real NetSuite REST endpoint
    await new Promise(r=>setTimeout(r,1600));
    const woNum="WO-"+(Math.floor(Math.random()*90000)+10000);
    setWoStatus({success:true,woNum,payload});
  }

  const WoModal=showWO&&woProject&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}>
      <div style={{background:D.bg1,border:`0.5px solid ${D.purple}`,borderRadius:12,padding:24,width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:10,height:10,borderRadius:2,background:D.purple,flexShrink:0}}/>
          <div style={{fontSize:14,fontWeight:500,color:D.purpleT}}>Create NetSuite Work Order</div>
        </div>
        <div style={{fontSize:11,color:D.t3,marginBottom:18}}>{woProject.name}</div>

        {woStatus&&woStatus.success?(
          // ── Success state ──
          <div>
            <div style={{background:"#1a1a2e",border:`0.5px solid ${D.purple}`,borderRadius:10,padding:"20px 18px",marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>✓</div>
              <div style={{fontSize:16,fontWeight:600,color:D.purpleT,marginBottom:4}}>Work Order Created</div>
              <div style={{fontSize:22,fontWeight:700,color:D.t1,letterSpacing:".06em",marginBottom:12}}>{woStatus.woNum}</div>
              <div style={{fontSize:11,color:D.t3}}>NetSuite has received the work order. Reference the number above in all related communications.</div>
            </div>
            <div style={{background:D.bg2,borderRadius:8,padding:"12px 14px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:500,color:D.t2,marginBottom:8}}>Submitted payload</div>
              <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"4px 12px",fontSize:11}}>
                {[["Site",woStatus.payload.location.name],["Subsidiary",woStatus.payload.subsidiary.name],["Assembly",woStatus.payload.assembly.name],["Quantity",woStatus.payload.quantity],["Memo",woStatus.payload.memo]].map(([k,v])=>[
                  <span key={"k"+k} style={{color:D.t3}}>{k}</span>,
                  <span key={"v"+k} style={{color:D.t1,fontWeight:500}}>{v}</span>
                ])}
              </div>
            </div>
            <button onClick={()=>{
              setProjects(prev=>prev.map(p=>p.id===woProject.id?{...p,woNumber:woStatus.woNum,woLockedAt:new Date().toISOString()}:p));
              setShowWO(false);setWoStatus(null);setWoProject(null);
            }} style={{...btnS,background:D.purple,color:"#fff",width:"100%",padding:"10px"}}>Done</button>
          </div>
        ):(
          // ── Review state ──
          <div>
            {/* Fixed fields */}
            <div style={{background:D.bg2,borderRadius:8,padding:"12px 14px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:500,color:D.t2,marginBottom:10}}>Work order fields</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px"}}>
                {[
                  ["Site",woProject.code],
                  ["Subsidiary","CoreWeave, Inc"],
                  ["Assembly","Site Consumables"],
                  ["Quantity","1"],
                ].map(([k,v])=>(
                  <div key={k}>
                    <div style={{fontSize:10,color:D.t3,marginBottom:2}}>{k}</div>
                    <div style={{fontSize:12,fontWeight:500,color:D.t1,padding:"5px 8px",background:D.bg3,borderRadius:6,border:`0.5px solid ${D.border}`}}>{v}</div>
                  </div>
                ))}
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:10,color:D.t3,marginBottom:2}}>Memo / Reference</div>
                  <textarea
                    value={woMemo}
                    onChange={e=>setWoMemo(e.target.value)}
                    rows={2}
                    style={{...inpS,resize:"vertical",lineHeight:1.5,fontFamily:"inherit"}}
                  />
                </div>
              </div>
            </div>

            {/* Components / BOM */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:500,color:D.t2,marginBottom:8}}>Components ({woProject.items.length} part{woProject.items.length!==1?"s":""})</div>
              {woProject.items.length===0?(
                <div style={{fontSize:11,color:D.t3,fontStyle:"italic",padding:"12px",background:D.bg2,borderRadius:8,textAlign:"center"}}>No items in project BOM.</div>
              ):(
                <div style={{background:D.bg2,borderRadius:8,overflow:"hidden"}}>
                  {/* Header */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 90px",borderBottom:`0.5px solid ${D.border}`}}>
                    {["Part number","Qty installed"].map(h=>(
                      <div key={h} style={{padding:"6px 10px",fontSize:10,color:D.t3,fontWeight:500}}>{h}</div>
                    ))}
                  </div>
                  {/* Rows */}
                  {woProject.items.map((item,i)=>(
                    <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr 90px",borderTop:i>0?`0.5px solid ${D.border}`:"none",background:i%2===0?"transparent":D.bg3}}>
                      <div style={{padding:"7px 10px",fontSize:12,color:D.blueT,fontWeight:500}}>{item.partNumber}</div>
                      <div style={{padding:"7px 10px",fontSize:12,color:D.tealT,fontWeight:500,textAlign:"center"}}>{item.qtyIns}</div>
                    </div>
                  ))}
                  {/* Totals */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 90px",borderTop:`0.5px solid ${D.border}`,background:D.bg3}}>
                    <div style={{padding:"7px 10px",fontSize:11,color:D.t3,fontWeight:500}}>Total installed</div>
                    <div style={{padding:"7px 10px",fontSize:11,color:D.tealT,fontWeight:500,textAlign:"center"}}>{woProject.items.reduce((s,i)=>s+i.qtyIns,0)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* API note */}
            <div style={{background:"#1a1a2e",border:`0.5px solid rgba(167,139,250,0.25)`,borderRadius:8,padding:"10px 12px",marginBottom:16,fontSize:11,color:D.t3}}>
              <span style={{color:D.purpleT,fontWeight:500}}>NetSuite REST API</span> — POST /workorders with components array. This will create a Work Order record in your NetSuite account.
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowWO(false);setWoStatus(null);}} style={{...btnS,background:D.bg3,color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400}}>Cancel</button>
              <button
                onClick={()=>submitWorkOrder(woProject)}
                disabled={woStatus==="submitting"||woProject.items.length===0}
                style={{...btnS,background:woStatus==="submitting"||woProject.items.length===0?"#2e1065":D.purple,color:woStatus==="submitting"||woProject.items.length===0?D.t3:"#fff",cursor:woStatus==="submitting"||woProject.items.length===0?"not-allowed":"pointer",minWidth:140}}
              >
                {woStatus==="submitting"?(
                  <span style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                    <span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",border:`2px solid ${D.purpleT}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
                    Submitting…
                  </span>
                ):"Submit to NetSuite"}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const NsToast=nsToast&&(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:300,background:D.tealB,border:`1px solid ${D.teal}`,borderRadius:12,padding:"14px 18px",minWidth:340,maxWidth:420}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:D.teal,flexShrink:0}}/>
        <span style={{fontSize:12,fontWeight:500,color:D.tealT}}>NetSuite bin transfer fired</span>
        <span style={{marginLeft:"auto",fontSize:11,fontWeight:600,color:D.t1,background:D.bg0,padding:"2px 9px",borderRadius:20,border:`0.5px solid ${D.teal}`,letterSpacing:".03em"}}>{nsToast.btNum}</span>
      </div>
      {/* Ticket + Site row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,marginBottom:8}}>
        <div><span style={{color:D.t3}}>Ticket </span><span style={{color:D.t1,fontWeight:500}}>{nsToast.id}</span></div>
        <div><span style={{color:D.t3}}>Site </span><span style={{color:D.tealT,fontWeight:500}}>{nsToast.site}</span></div>
      </div>
      {/* Per-line parts table */}
      <div style={{background:"rgba(0,0,0,0.25)",borderRadius:7,overflow:"hidden",marginBottom:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 56px",gap:0}}>
          <div style={{padding:"5px 10px",fontSize:10,color:D.t3,borderBottom:`0.5px solid rgba(45,212,191,0.15)`}}>Part</div>
          <div style={{padding:"5px 10px",fontSize:10,color:D.t3,borderBottom:`0.5px solid rgba(45,212,191,0.15)`,textAlign:"right"}}>Qty</div>
          {nsToast.lines.map((l,i)=>[
            <div key={`p${i}`} style={{padding:"6px 10px",fontSize:12,color:D.t1,fontWeight:500,borderBottom:i<nsToast.lines.length-1?`0.5px solid rgba(45,212,191,0.1)`:"none"}}>{l.part}</div>,
            <div key={`q${i}`} style={{padding:"6px 10px",fontSize:12,color:D.tealT,fontWeight:600,textAlign:"right",borderBottom:i<nsToast.lines.length-1?`0.5px solid rgba(45,212,191,0.1)`:"none"}}>{l.qtyReq}</div>
          ])}
        </div>
      </div>
      {/* Direction footer */}
      <div style={{paddingTop:8,borderTop:`0.5px solid rgba(45,212,191,0.2)`,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}>
        <span style={{color:D.t3,fontWeight:500}}>{nsToast.dir.split(" → ")[0]}</span>
        <span style={{color:D.tealT,fontWeight:700,fontSize:16}}>→</span>
        <span style={{color:D.t3,fontWeight:500}}>{nsToast.dir.split(" → ")[1]}</span>
      </div>
    </div>
  );

  const IcsToast=icsToast&&(
    <div style={{position:"fixed",top:24,right:24,zIndex:300,background:D.greenB,border:`1px solid ${D.green}`,borderRadius:12,padding:"14px 18px",minWidth:340,maxWidth:420}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:D.green,flexShrink:0}}/>
        <span style={{fontSize:12,fontWeight:500,color:D.greenT}}>Ticket auto-approved — ICS notified</span>
        <span style={{marginLeft:"auto",fontSize:11,fontWeight:600,color:D.t1,background:D.bg0,padding:"2px 9px",borderRadius:20,border:`0.5px solid ${D.green}`,letterSpacing:".03em"}}>{icsToast.id}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,marginBottom:8}}>
        <div><span style={{color:D.t3}}>ICS </span><span style={{color:D.t1,fontWeight:500}}>{icsToast.ics||"—"}</span></div>
        <div><span style={{color:D.t3}}>Site </span><span style={{color:D.greenT,fontWeight:500}}>{icsToast.site}</span></div>
      </div>
      <div style={{fontSize:11,color:D.t3,marginBottom:8}}>Location <span style={{color:D.t2}}>{icsToast.location||"—"}</span></div>
      <div style={{background:"rgba(0,0,0,0.25)",borderRadius:7,overflow:"hidden",marginBottom:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 56px",gap:0}}>
          <div style={{padding:"5px 10px",fontSize:10,color:D.t3,borderBottom:`0.5px solid rgba(34,197,94,0.15)`}}>Part</div>
          <div style={{padding:"5px 10px",fontSize:10,color:D.t3,borderBottom:`0.5px solid rgba(34,197,94,0.15)`,textAlign:"right"}}>Qty</div>
          {icsToast.lines.map((l,i)=>[
            <div key={`p${i}`} style={{padding:"6px 10px",fontSize:12,color:D.t1,fontWeight:500,borderBottom:i<icsToast.lines.length-1?`0.5px solid rgba(34,197,94,0.1)`:"none"}}>{l.part}</div>,
            <div key={`q${i}`} style={{padding:"6px 10px",fontSize:12,color:D.greenT,fontWeight:600,textAlign:"right",borderBottom:i<icsToast.lines.length-1?`0.5px solid rgba(34,197,94,0.1)`:"none"}}>{l.qtyReq}</div>
          ])}
        </div>
      </div>
      <div style={{paddingTop:8,borderTop:`0.5px solid rgba(34,197,94,0.2)`,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11}}>
        <span style={{color:D.t3}}>Submitted by <span style={{color:D.t2,fontWeight:500}}>{icsToast.by}</span></span>
        <span style={{color:D.greenT,fontWeight:600}}>Ready to pick &amp; stage</span>
      </div>
    </div>
  );

  const lineIdRef=useRef(2);
  function addLine(){lineIdRef.current++;setForm(f=>({...f,lines:[...f.lines,{id:lineIdRef.current,part:"",qty:""}]}));}
  function removeLine(id){setForm(f=>({...f,lines:f.lines.filter(l=>l.id!==id)}));}
  function updateLine(id,field,val){setForm(f=>({...f,lines:f.lines.map(l=>l.id===id?{...l,[field]:val}:l)}));}
  const validLineCount=form.lines.filter(l=>l.part.trim()&&parseInt(l.qty)>0).length;
  const missingFields=[];
  if(!form.site)missingFields.push("Site");
  if(!form.dataHall)missingFields.push("Data Hall");
  if(!form.rack)missingFields.push("Rack");
  if(!form.ics)missingFields.push("Onsite ICS");
  if(validLineCount===0)missingFields.push("at least one part & qty");
  const formValid=missingFields.length===0;
  const formAutoApprove=user.role==="DCM / Tiger Team";

  const FormModal=showForm&&(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
      <div style={{background:D.bg1,borderRadius:12,border:`0.5px solid ${D.border}`,padding:24,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{fontSize:14,fontWeight:500,color:D.t1,marginBottom:4}}>New pick ticket</div>
        <div style={{fontSize:11,color:D.t3,marginBottom:16}}>Shared fields apply to all line items below.</div>

        {formAutoApprove&&(
          <div style={{background:D.greenB,border:`0.5px solid ${D.green}`,borderRadius:8,padding:"10px 12px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:D.green,flexShrink:0,marginTop:5}}/>
            <div style={{fontSize:11,color:D.greenT,lineHeight:1.5}}>
              <div style={{fontWeight:600,marginBottom:2}}>Auto-approval enabled</div>
              <div style={{color:D.t2}}>As a DCM / Tiger Team Lead, your tickets skip approval. The selected <span style={{color:D.greenT,fontWeight:500}}>Onsite ICS</span> will be notified immediately to pick &amp; stage.</div>
            </div>
          </div>
        )}

        {/* Shared fields */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:11,color:D.t3,marginBottom:4}}>Site</div>
            <select value={form.site} onChange={e=>setForm(f=>({...f,site:e.target.value}))} style={selS}>
              <option value="">Select a Locode…</option>
              {LOCODES.map(l=><option key={l} value={l.split(" ")[0]}>{l}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:11,color:D.t3,marginBottom:4}}>Data Hall</div>
              <input value={form.dataHall} onChange={e=>setForm(f=>({...f,dataHall:e.target.value}))} placeholder="e.g. DH3" style={inpS}/>
            </div>
            <div>
              <div style={{fontSize:11,color:D.t3,marginBottom:4}}>Rack</div>
              <input value={form.rack} onChange={e=>setForm(f=>({...f,rack:e.target.value}))} placeholder="e.g. B07" style={inpS}/>
            </div>
            <div>
              <div style={{fontSize:11,color:D.t3,marginBottom:4}}>RU <span style={{fontSize:10,color:D.t3,fontWeight:400}}>(optional)</span></div>
              <input value={form.ru} onChange={e=>setForm(f=>({...f,ru:e.target.value}))} placeholder="e.g. U12" style={inpS}/>
            </div>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:11,color:D.t3,marginBottom:4}}>Onsite ICS</div>
            <select value={form.ics} onChange={e=>setForm(f=>({...f,ics:e.target.value}))} style={selS}>
              <option value="">Select ICS…</option>
              {USERS["ICS"].map(u=><option key={u.email} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:11,color:D.t3,marginBottom:4}}>DCM / Tiger Team Lead <span style={{fontSize:10,color:D.t3,fontWeight:400}}>(optional)</span></div>
            <select value={form.dcm} onChange={e=>setForm(f=>({...f,dcm:e.target.value}))} style={selS}>
              <option value="">Select DCM / Tiger Team Lead…</option>
              {USERS["DCM / Tiger Team"].map(u=><option key={u.email} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:11,color:D.t3,marginBottom:4}}>Jira / Asana Task Link <span style={{fontSize:10,color:D.t3,fontWeight:400}}>(optional)</span></div>
            <input
              value={form.taskLink}
              onChange={e=>setForm(f=>({...f,taskLink:e.target.value}))}
              placeholder="https://app.asana.com/... or https://coreweave.atlassian.net/..."
              style={inpS}
            />
          </div>
        </div>

        {/* Line items */}
        <div style={{borderTop:`0.5px solid ${D.border}`,paddingTop:14,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:500,color:D.t2}}>Parts &amp; quantities</div>
            <div style={{fontSize:10,color:D.t3}}>{form.lines.length} line{form.lines.length!==1?"s":""} · {validLineCount} valid</div>
          </div>

          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 90px 28px",gap:6,marginBottom:6,paddingLeft:2}}>
            <div style={{fontSize:10,color:D.t3}}>Part number</div>
            <div style={{fontSize:10,color:D.t3}}>Qty</div>
            <div/>
          </div>

          {form.lines.map((line,idx)=>(
            <div key={line.id} style={{display:"grid",gridTemplateColumns:"1fr 90px 28px",gap:6,marginBottom:6,alignItems:"center"}}>
              <PartSearch value={line.part} onChange={val=>updateLine(line.id,"part",val)}/>
              <input
                type="number"
                min="1"
                value={line.qty}
                onChange={e=>updateLine(line.id,"qty",e.target.value)}
                placeholder="0"
                style={{...inpS,textAlign:"center"}}
              />
              {form.lines.length>1?(
                <button
                  onClick={()=>removeLine(line.id)}
                  style={{width:28,height:28,borderRadius:6,border:`0.5px solid ${D.redB}`,background:"transparent",color:D.redT,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
                  title="Remove line"
                >×</button>
              ):<div/>}
            </div>
          ))}

          <button
            onClick={addLine}
            style={{marginTop:4,fontSize:11,padding:"5px 12px",borderRadius:6,border:`0.5px solid ${D.blue}`,background:"transparent",color:D.blueT,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}
          >
            <span style={{fontSize:15,lineHeight:1}}>+</span> Add part
          </button>
        </div>

        <div style={{borderTop:`0.5px solid ${D.border}`,paddingTop:14}}>
          {!formValid&&(
            <div style={{background:D.amberB,border:`0.5px solid ${D.amber}`,borderRadius:7,padding:"8px 11px",marginBottom:10,fontSize:11,color:D.amberT,display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{fontWeight:600}}>Missing:</span>
              <span style={{color:D.t2}}>{missingFields.join(", ")}</span>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setShowForm(false);setForm({site:"",dataHall:"",rack:"",ru:"",ics:"",dcm:"",taskLink:"",lines:[{id:1,part:"",qty:""}]});}} style={{...btnS,background:D.bg3,color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400}}>Cancel</button>
            <button
              onClick={submitTicket}
              disabled={!formValid}
              title={formValid?(formAutoApprove?"Submit & auto-approve":"Submit ticket"):`Complete: ${missingFields.join(", ")}`}
              style={{...btnS,background:formValid?(formAutoApprove?D.green:D.blue):D.bg3,color:formValid?"#fff":D.t3,cursor:formValid?"pointer":"not-allowed",opacity:formValid?1:0.7}}
            >{formAutoApprove?"Submit & auto-approve":"Submit ticket"}</button>
          </div>
        </div>
      </div>
    </div>
  );

  const OverviewTab=(
    <div>
      <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>From</div><input type="date" value={aFrom} onChange={e=>setAFrom(e.target.value)} style={{...inpS,width:140}}/></div>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>To</div><input type="date" value={aTo} onChange={e=>setATo(e.target.value)} style={{...inpS,width:140}}/></div>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Site</div><select value={aSite} onChange={e=>setASite(e.target.value)} style={{...selS,width:160}}><option value="">All sites</option>{allSites.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Part</div><select value={aPart} onChange={e=>setAPart(e.target.value)} style={{...selS,width:160}}><option value="">All parts</option>{allParts.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
        <button onClick={()=>{setASite("");setAPart("");setAFrom(mkD(30));setATo(mkD(0));}} style={{...btnS,background:D.bg3,color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400,fontSize:11,padding:"6px 12px"}}>Reset</button>
        <button onClick={exportOverview} style={{...btnS,background:D.greenB,color:D.greenT,fontSize:11,padding:"6px 14px",marginLeft:"auto"}}>Export CSV</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,marginBottom:14}}>
        {[["Total units released",grand,"issued to DCTs"],["Sites active",bySite.length,"with releases"],["Unique parts",byPart.length,"part numbers"]].map(([l,v,s])=>(
          <div key={l} style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:11,color:D.t3,marginBottom:4}}>{l}</div><div style={{fontSize:26,fontWeight:500,color:D.t1}}>{v}</div><div style={{fontSize:11,color:D.t2,marginTop:2}}>{s}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:500,color:D.t1,marginBottom:12}}>Units by site</div>
          {bySite.length===0&&<div style={{fontSize:12,color:D.t3,fontStyle:"italic"}}>No data.</div>}
          {bySite.map(([site,data],si)=>(
            <div key={site} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,fontWeight:500,color:D.t1}}>{site}</span><span style={{fontSize:11,color:D.blueT}}>{data.total}</span></div>
              <Bar v={data.total} m={maxS} c={D.blue}/>
              {Object.entries(data.parts).sort((a,b)=>b[1]-a[1]).map(([part,qty],pi)=>(
                <div key={part} style={{display:"flex",alignItems:"center",gap:8,marginTop:4,paddingLeft:8}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:PALETTE_COLOURS[pi%PALETTE_COLOURS.length],flexShrink:0}}/>
                  <span style={{fontSize:10,color:D.t2,flex:1}}>{part}</span>
                  <span style={{fontSize:10,color:D.t3}}>{qty}</span>
                  <div style={{width:50,height:4,background:D.bg3,borderRadius:2,overflow:"hidden"}}><div style={{width:`${Math.round((qty/data.total)*100)}%`,height:"100%",background:PALETTE_COLOURS[pi%PALETTE_COLOURS.length]}}/></div>
                </div>
              ))}
              {si<bySite.length-1&&<div style={{height:"0.5px",background:D.border,margin:"10px 0 0"}}/>}
            </div>
          ))}
        </div>
        <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:500,color:D.t1,marginBottom:12}}>Units by part number</div>
          {byPart.length===0&&<div style={{fontSize:12,color:D.t3,fontStyle:"italic"}}>No data.</div>}
          {byPart.map(([part,qty],pi)=>(
            <div key={part} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:8,height:8,borderRadius:2,background:PALETTE_COLOURS[pi%PALETTE_COLOURS.length]}}/><span style={{fontSize:12,fontWeight:500,color:D.t1}}>{part}</span></div>
                <span style={{fontSize:12,fontWeight:500,color:PALETTE_COLOURS[pi%PALETTE_COLOURS.length]}}>{qty}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Bar v={qty} m={maxP} c={PALETTE_COLOURS[pi%PALETTE_COLOURS.length]}/><span style={{fontSize:10,color:D.t3,minWidth:32,textAlign:"right"}}>{grand>0?Math.round((qty/grand)*100):0}%</span></div>
              <div style={{marginTop:4,paddingLeft:15}}>{bySite.filter(([,d])=>d.parts[part]).map(([site,d])=>(
                <div key={site} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:D.t3,marginBottom:2}}><span>{site}</span><span style={{color:D.t2}}>{d.parts[part]}</span></div>
              ))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProjectTab=(
    <div>
      {/* ── Site → Project filter bar ─────────────────────────────────────── */}
      {(()=>{
        const projectSites=[...new Set(projects.map(p=>p.code))].sort();
        const visibleProjects=prjSiteFilter?projects.filter(p=>p.code===prjSiteFilter):projects;
        return(
          <div style={{marginBottom:14}}>
            {/* Row 1: site pills */}
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:10,color:D.t3,marginRight:2,flexShrink:0}}>Site</span>
              <button
                onClick={()=>{setPrjSiteFilter("");}}
                style={{fontSize:11,padding:"4px 12px",borderRadius:20,border:`0.5px solid ${!prjSiteFilter?D.blue:D.border}`,background:!prjSiteFilter?D.blueB:"transparent",color:!prjSiteFilter?D.blueT:D.t2,cursor:"pointer"}}
              >All</button>
              {projectSites.map(site=>(
                <button key={site} onClick={()=>{setPrjSiteFilter(site);const first=projects.find(p=>p.code===site);if(first)setActivePrj(first.id);}}
                  style={{fontSize:11,padding:"4px 12px",borderRadius:20,border:`0.5px solid ${prjSiteFilter===site?D.blue:D.border}`,background:prjSiteFilter===site?D.blueB:"transparent",color:prjSiteFilter===site?D.blueT:D.t2,cursor:"pointer"}}
                >{site}</button>
              ))}
            </div>
            {/* Row 2: project pills for selected site */}
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",paddingLeft:36}}>
              {visibleProjects.map(p=>(
                <button key={p.id} onClick={()=>setActivePrj(p.id)}
                  style={{fontSize:11,padding:"4px 12px",borderRadius:20,border:`0.5px solid ${activePrj===p.id?D.teal:D.border}`,background:activePrj===p.id?D.tealB:"transparent",color:activePrj===p.id?D.tealT:D.t2,cursor:"pointer",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}
                  title={p.name}
                >{p.name}</button>
              ))}
{user.role==="ICS"&&<button onClick={()=>setShowNewPrj(true)} style={{fontSize:11,padding:"4px 11px",borderRadius:20,border:`0.5px solid ${D.green}`,background:D.greenB,color:D.greenT,cursor:"pointer",flexShrink:0,fontWeight:500}}>+ New</button>}
            </div>
          </div>
        );
      })()}
      {showNewPrj&&(
        <div style={{background:D.bg1,border:`0.5px solid ${D.amber}`,borderRadius:10,padding:16,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:500,color:D.amberT,marginBottom:12}}>New project</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Project name</div><input value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value}))} placeholder="e.g. OBG01 DH2 Optics, Cables & Consumables" style={inpS}/></div>
            <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Site</div><select value={pForm.site} onChange={e=>setPForm(f=>({...f,site:e.target.value}))} style={selS}><option value="">Select…</option>{LOCODES.map(s=><option key={s} value={s.split(" ")[0]}>{s}</option>)}</select></div>
            <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Data hall</div><input value={pForm.dataHall} onChange={e=>setPForm(f=>({...f,dataHall:e.target.value}))} placeholder="DH2" style={inpS}/></div>
            <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Subsidiary</div><input value={pForm.subsidiary} onChange={e=>setPForm(f=>({...f,subsidiary:e.target.value}))} placeholder="CoreWeave, Inc" style={inpS}/></div>
            <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Description</div><input value={pForm.description} onChange={e=>setPForm(f=>({...f,description:e.target.value}))} placeholder="Optional" style={inpS}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>setShowNewPrj(false)} style={{...btnS,background:D.bg3,color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400}}>Cancel</button>
            <button onClick={createPrj} style={{...btnS,background:D.amber,color:"#000"}}>Create</button>
          </div>
        </div>
      )}
      {prj&&<>
        <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
            <div>
              <div style={{fontSize:15,fontWeight:500,color:D.t1,marginBottom:4}}>{prj.name}</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:D.t3}}>Site: <span style={{color:D.blueT}}>{prj.code}</span></span>
                {prj.dataHall&&<span style={{fontSize:11,color:D.t3}}>Hall: <span style={{color:D.t2}}>{prj.dataHall}</span></span>}
                {prj.subsidiary&&<span style={{fontSize:11,color:D.t3}}>Subsidiary: <span style={{color:D.t2}}>{prj.subsidiary}</span></span>}
              </div>
            </div>
            {prj.woNumber?(
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,background:"#1a1a2e",border:`0.5px solid ${D.purple}`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:D.purple,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:9,color:D.t3,textTransform:"uppercase",letterSpacing:".05em",marginBottom:1}}>Work Order</div>
                  <div style={{fontSize:13,fontWeight:700,color:D.purpleT,letterSpacing:".04em"}}>{prj.woNumber}</div>
                </div>
              </div>
            ):(
              <button onClick={()=>{setWoProject(prj);setWoStatus(null);setWoMemo(`Work Order — ${prj.name}`);setShowWO(true);}} style={{...btnS,background:D.purple,color:"#fff",fontSize:11,padding:"6px 14px",border:`0.5px solid ${D.purple}`}}>Create Work Order</button>
            )}
          </div>
          {prjStats&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}>
              {[["Planned",prjStats.tot,D.t2],["Returned",prjStats.ret,D.amberT],["Installed",prjStats.ins,D.tealT]].map(([l,v,c])=>(
                <div key={l} style={{background:D.bg2,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:D.t3,marginBottom:2}}>{l}</div><div style={{fontSize:18,fontWeight:500,color:c}}>{v}</div></div>
              ))}
            </div>
          )}
        </div>
        <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,overflow:"hidden",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:`0.5px solid ${D.border}`}}>
            <div style={{fontSize:12,fontWeight:500,color:D.t1}}>Bill of materials</div>
            {!prj.woNumber&&(
              <button onClick={()=>{setEditItem(null);setIForm({partNumber:"",description:"",category:"Optics",unit:"ea",qtyPlanned:"",qtyIns:"",qtyRet:"",unitPrice:""});setShowItemForm(true);}} style={{...btnS,background:D.bg3,color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400,fontSize:11,padding:"4px 12px"}}>+ Add item</button>
            )}
          </div>
          {prj.woNumber&&(
            <div style={{padding:"8px 14px",background:"#1a1a2e",borderBottom:`0.5px solid ${D.purple}`,display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:D.purple,flexShrink:0}}/>
              <span style={{fontSize:11,color:D.t3}}>BOM locked — Work Order <span style={{color:D.purpleT,fontWeight:600}}>{prj.woNumber}</span> has been created for this project.</span>
            </div>
          )}
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,tableLayout:"fixed"}}>
            <thead><tr style={{background:D.bg2}}>{["Part #","Description","Category","Planned","Returned","Installed","Unit Price","Total Value",""].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:10,color:D.t3,fontWeight:500}}>{h}</th>)}</tr></thead>
            <tbody>
              {prj.items.length===0&&<tr><td colSpan={8} style={{padding:"20px",textAlign:"center",fontSize:12,color:D.t3,fontStyle:"italic"}}>No items yet.</td></tr>}
              {prj.items.map((item,i)=>{
                const u=bomUnitPrice(item);
                return <tr key={item.id} style={{borderTop:`0.5px solid ${D.border}`,background:i%2===0?"transparent":D.bg2}}>
                  <td style={{padding:"7px 10px",color:D.blueT,fontWeight:500}}>{item.partNumber}</td>
                  <td style={{padding:"7px 10px",color:D.t1}}>{item.description}</td>
                  <td style={{padding:"7px 10px"}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:D.bg3,color:CC[item.category]||D.t2,border:`0.5px solid ${CC[item.category]||D.border}`}}>{item.category}</span></td>
                  <td style={{padding:"7px 10px",color:D.t2}}>{item.qtyPlanned}</td>
                  <td style={{padding:"7px 10px",color:D.amberT}}>{item.qtyRet}</td>
                  <td style={{padding:"7px 10px",color:D.tealT,fontWeight:500}}>{item.qtyIns}</td>
                  <td style={{padding:"7px 10px",color:D.t2,fontSize:11}}>{u>0?`$${u.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`:"—"}</td>
                  <td style={{padding:"7px 10px",color:D.greenT,fontSize:12,fontWeight:500}}>{u>0?`$${(u*item.qtyPlanned).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`:"—"}</td>
                  <td style={{padding:"7px 10px"}}>
                    {prj.woNumber?(
                      <span style={{fontSize:10,color:D.t3,fontStyle:"italic"}}>Locked</span>
                    ):(
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEdit(item)} style={{fontSize:10,padding:"2px 7px",borderRadius:4,border:`0.5px solid ${D.border}`,background:"transparent",color:D.t3,cursor:"pointer"}}>Edit</button>
                        <button onClick={()=>delItem(item.id)} style={{fontSize:10,padding:"2px 7px",borderRadius:4,border:`0.5px solid ${D.redB}`,background:"transparent",color:D.redT,cursor:"pointer"}}>Del</button>
                      </div>
                    )}
                  </td>
                </tr>;
              })}
            </tbody>
            {prj.items.length>0&&(
              <tfoot>
                <tr style={{borderTop:`1px solid ${D.borderH}`,background:D.bg2}}>
                  <td colSpan={3} style={{padding:"7px 10px",fontSize:11,color:D.t3,fontWeight:500}}>Totals</td>
                  <td style={{padding:"7px 10px",fontSize:12,color:D.t2,fontWeight:600}}>{prj.items.reduce((s,i)=>s+i.qtyPlanned,0)}</td>
                  <td style={{padding:"7px 10px",fontSize:12,color:D.amberT,fontWeight:600}}>{prj.items.reduce((s,i)=>s+i.qtyRet,0)}</td>
                  <td style={{padding:"7px 10px",fontSize:12,color:D.tealT,fontWeight:600}}>{prj.items.reduce((s,i)=>s+i.qtyIns,0)}</td>
                  <td style={{padding:"7px 10px",fontSize:11,color:D.t3}}></td>
                  <td style={{padding:"7px 10px",fontSize:12,color:D.greenT,fontWeight:700}}>{(()=>{const tot=prj.items.reduce((s,i)=>s+bomUnitPrice(i)*i.qtyPlanned,0);return tot>0?`$${tot.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`:"—"})()}</td>
                  <td/>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {showItemForm&&(
          <div style={{background:D.bg1,border:`0.5px solid ${D.blue}`,borderRadius:10,padding:16}}>
            <div style={{fontSize:12,fontWeight:500,color:D.blueT,marginBottom:12}}>{editItem?"Edit item":"Add item"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Part number</div><input value={iForm.partNumber} onChange={e=>setIForm(f=>({...f,partNumber:e.target.value}))} placeholder="SFP-10G-SR" style={inpS}/></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Description</div><input value={iForm.description} onChange={e=>setIForm(f=>({...f,description:e.target.value}))} placeholder="10G SR Optic" style={inpS}/></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Category</div><select value={iForm.category} onChange={e=>setIForm(f=>({...f,category:e.target.value}))} style={selS}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Unit</div><input value={iForm.unit} onChange={e=>setIForm(f=>({...f,unit:e.target.value}))} placeholder="ea" style={inpS}/></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Qty planned</div><input type="number" min="0" value={iForm.qtyPlanned} onChange={e=>setIForm(f=>({...f,qtyPlanned:e.target.value}))} style={inpS}/></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Qty installed</div><input type="number" min="0" value={iForm.qtyIns} onChange={e=>setIForm(f=>({...f,qtyIns:e.target.value}))} style={inpS}/></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Qty returned</div><input type="number" min="0" value={iForm.qtyRet} onChange={e=>setIForm(f=>({...f,qtyRet:e.target.value}))} style={inpS}/></div>
              <div><div style={{fontSize:10,color:D.t3,marginBottom:4}}>Unit Price ($)</div><input type="number" min="0" step="0.01" value={iForm.unitPrice} onChange={e=>setIForm(f=>({...f,unitPrice:e.target.value}))} placeholder="0.00" style={inpS}/></div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>{setShowItemForm(false);setEditItem(null);}} style={{...btnS,background:D.bg3,color:D.t2,border:`0.5px solid ${D.border}`,fontWeight:400}}>Cancel</button>
              <button onClick={saveItem} style={{...btnS,background:D.blue,color:"#fff"}}>{editItem?"Save":"Add item"}</button>
            </div>
          </div>
        )}
      </>}
    </div>
  );

  const WorkOrderTab=(()=>{
    const woProjects=projects.filter(p=>p.woNumber);
    return(
      <div>
        {woProjects.length===0?(
          <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,padding:"40px 20px",textAlign:"center"}}>
            <div style={{fontSize:13,color:D.t3,marginBottom:4}}>No work orders submitted yet.</div>
            <div style={{fontSize:11,color:D.t3}}>Work orders appear here once created from the Project Tracker.</div>
          </div>
        ):(
          <div style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"120px 130px 1fr 130px 110px 100px",borderBottom:`0.5px solid ${D.border}`,background:D.bg2}}>
              {["Work Order #","Site","Project","Subsidiary","Date Created","Status"].map(h=>(
                <div key={h} style={{padding:"8px 12px",fontSize:10,color:D.t3,fontWeight:500}}>{h}</div>
              ))}
            </div>
            {woProjects.map((p,i)=>(
              <div key={p.id} style={{display:"grid",gridTemplateColumns:"120px 130px 1fr 130px 110px 100px",borderTop:i>0?`0.5px solid ${D.border}`:"none",background:i%2===0?"transparent":D.bg2,alignItems:"center",cursor:"pointer"}}
                onClick={()=>{setActivePrj(p.id);setView("projects");}}
              >
                <div style={{padding:"10px 12px",display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:D.purple,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:D.purpleT,letterSpacing:".03em"}}>{p.woNumber}</span>
                </div>
                <div style={{padding:"10px 12px",fontSize:11,color:D.blueT,fontWeight:500}}>{p.code}</div>
                <div style={{padding:"10px 12px"}}>
                  <div style={{fontSize:12,fontWeight:500,color:D.t1,marginBottom:1}}>{p.name}</div>
                  {p.dataHall&&<div style={{fontSize:10,color:D.t3}}>{p.dataHall}</div>}
                </div>
                <div style={{padding:"10px 12px",fontSize:11,color:D.t2}}>{p.subsidiary||"—"}</div>
                <div style={{padding:"10px 12px",fontSize:11,color:D.t3}}>{p.woLockedAt?new Date(p.woLockedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—"}</div>
                <div style={{padding:"10px 12px"}}>
                  <span style={{fontSize:10,fontWeight:500,padding:"3px 9px",borderRadius:20,background:"#1a1a2e",color:D.purpleT,border:`0.5px solid ${D.purple}`}}>Submitted</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {woProjects.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:12}}>
            {[
              ["Total work orders",woProjects.length,"submitted to NetSuite"],
              ["Sites covered",[...new Set(woProjects.map(p=>p.code))].length,"unique sites"],
              ["Total parts installed",woProjects.reduce((s,p)=>s+p.items.reduce((si,i)=>si+i.qtyIns,0),0),"across all WOs"],
            ].map(([l,v,sub])=>(
              <div key={l} style={{background:D.bg1,border:`0.5px solid ${D.border}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:D.t3,marginBottom:4}}>{l}</div>
                <div style={{fontSize:22,fontWeight:500,color:D.purpleT}}>{v}</div>
                <div style={{fontSize:11,color:D.t2,marginTop:2}}>{sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  })();

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:D.bg0,borderRadius:12,border:`0.5px solid ${D.border}`,overflow:"hidden",fontFamily:"system-ui,sans-serif"}}>
      {NsToast}{IcsToast}{ExcessModal}{FormModal}{WoModal}
      {Topbar}
      <div style={{flex:1,padding:16,overflowY:"auto",display:"flex",flexDirection:"column"}}>
        {view!=="detail"&&view!=="analytics"&&view!=="flowchart"&&view!=="projects"&&MRow}
        {view==="board"&&BoardView}
        {view==="list"&&ListView}
        {view==="detail"&&DetailView}
        {view==="projects"&&ProjectTab}
        {view==="flowchart"&&<FlowchartView theme={D}/>}
        {view==="analytics"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:14,borderBottom:`0.5px solid ${D.border}`,paddingBottom:10}}>
              {[["overview","Overview"],["workorders","Work Order List"]].map(([k,label])=><button key={k} onClick={()=>setATab(k)} style={{fontSize:12,padding:"5px 16px",borderRadius:6,border:"none",background:aTab===k?D.bg3:"transparent",color:aTab===k?D.t1:D.t2,cursor:"pointer",fontWeight:aTab===k?500:400}}>{label}</button>)}
            </div>
            {aTab==="overview"&&OverviewTab}
            {aTab==="workorders"&&WorkOrderTab}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const [authedUser,setAuthedUser]=useState(null);
  if(!authedUser)return <LoginScreen users={USERS} theme={D} onLogin={setAuthedUser}/>;
  return <PickItApp key={authedUser.email} initialUser={authedUser} onLogout={()=>setAuthedUser(null)}/>;
}
