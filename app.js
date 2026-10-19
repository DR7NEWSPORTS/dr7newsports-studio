const KEY = "dr7newsports.contents.v1";
const STATUSES = ["Rascunho", "Em revisão", "Aprovado", "Publicado"];
const $ = (s) => document.querySelector(s);
let currentView = "dashboard";
let items = loadItems();

function loadItems() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function persist() { localStorage.setItem(KEY, JSON.stringify(items)); }
function esc(value="") { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function statusClass(s) { return s === "Aprovado" || s === "Publicado" ? "green" : s === "Em revisão" ? "gold" : ""; }
function dateLabel(iso) { try { return new Date(iso).toLocaleString("pt-BR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); } catch { return ""; } }
function toast(msg) { const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2600); }
function setView(view) {
  currentView=view;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const titles={dashboard:"Painel geral",library:"Biblioteca de conteúdos",create:"Novo conteúdo",workflow:"Revisão editorial"};
  $("#page-title").textContent=titles[view]||"DR7Newsports Studio";
  if(view==="create"){openForm();return;}
  render();
}
function statusBadge(s) { return `<span class="badge ${statusClass(s)}">${esc(s)}</span>`; }
function cardRow(item, compact=false) {
  const allowed = item.status==="Rascunho"
    ? `<button class="secondary" data-action="review" data-id="${item.id}">Enviar para revisão</button>`
    : item.status==="Em revisão"
      ? `<button class="secondary" data-action="approve" data-id="${item.id}">Aprovar</button>`
      : item.status==="Aprovado"
        ? `<button class="primary" data-action="publish" data-id="${item.id}">Marcar publicado</button>` : "";
  return `<div class="content-row"><div style="min-width:0;flex:1"><div class="row-title">${esc(item.title)}</div><div class="meta"><span>${esc(item.type)}</span><span>•</span><span>${esc(item.platform)}</span><span>•</span><span>${dateLabel(item.updatedAt)}</span>${statusBadge(item.status)}</div></div><div class="row-actions">${allowed}<button class="icon-btn" data-action="edit" data-id="${item.id}" aria-label="Editar">Editar</button><button class="icon-btn" data-action="delete" data-id="${item.id}" aria-label="Excluir">Excluir</button></div></div>`;
}
function renderDashboard() {
 const counts=Object.fromEntries(STATUSES.map(s=>[s,items.filter(i=>i.status===s).length]));
 return `<div class="stats">
 <div class="stat"><div class="stat-top">Total de conteúdos <span>▤</span></div><strong>${items.length}</strong></div>
 <div class="stat"><div class="stat-top">Rascunhos <span>✎</span></div><strong>${counts["Rascunho"]}</strong></div>
 <div class="stat"><div class="stat-top">Em revisão <span>◷</span></div><strong class="accent">${counts["Em revisão"]}</strong></div>
 <div class="stat"><div class="stat-top">Aprovados <span>✓</span></div><strong>${counts["Aprovado"]}</strong></div></div>
 <div class="hint-box">🔒 Segurança editorial: conteúdos só podem ser marcados como publicados depois da aprovação manual.</div>
 <div class="dashboard-grid"><section class="panel"><div class="panel-head"><h3>Conteúdos recentes</h3><button class="secondary" data-view-link="library">Ver biblioteca</button></div>
 ${items.length?`<div class="content-list">${[...items].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5).map(i=>cardRow(i,true)).join("")}</div>`:`<div class="empty"><b>Seu estúdio começa aqui</b>Crie seu primeiro conteúdo de futebol para organizar a produção.<br><br><button class="primary" data-view-link="create">＋ Criar conteúdo</button></div>`}</section>
 <section class="panel"><div class="panel-head"><h3>Fluxo editorial</h3><span class="badge gold">Obrigatório</span></div><div class="steps">${STATUSES.map(s=>`<div class="step"><strong>${counts[s]}</strong><span>${s}</span></div>`).join("")}</div><p class="muted small">1. Salve como rascunho<br>2. Envie para revisão<br>3. Aprove manualmente<br>4. Marque como publicado somente após publicar na plataforma.</p><button class="secondary" data-view-link="workflow">Abrir revisão editorial →</button></section></div>`;
}
function renderLibrary() {
 return `<div class="toolbar"><input id="search" placeholder="Pesquisar título ou texto…"><select id="filter-status"><option value="">Todos os status</option>${STATUSES.map(s=>`<option>${s}</option>`).join("")}</select><select id="filter-type"><option value="">Todos os tipos</option>${["Notícia","Transferência","Confronto","Resultado","Escalação","Estatística","Meme","Vídeo curto"].map(s=>`<option>${s}</option>`).join("")}</select><button class="primary" data-view-link="create">＋ Novo conteúdo</button></div><section class="page-panel"><div id="library-list"></div></section>`;
}
function fillLibrary() {
 const target=$("#library-list"); if(!target)return;
 const q=($("#search")?.value||"").toLowerCase(), st=$("#filter-status")?.value||"", ty=$("#filter-type")?.value||"";
 const filtered=[...items].filter(i=>(!q||(i.title+" "+i.body).toLowerCase().includes(q))&&(!st||i.status===st)&&(!ty||i.type===ty)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 target.innerHTML=filtered.length?`<div class="content-list">${filtered.map(i=>cardRow(i)).join("")}</div>`:`<div class="empty"><b>Nenhum conteúdo encontrado</b>Crie um conteúdo ou ajuste os filtros.</div>`;
}
function renderWorkflow() {
 return `<div class="hint-box">A aprovação é manual. O botão “Marcar publicado” apenas registra que você já publicou o conteúdo fora deste protótipo; ele não envia nada ao Instagram ou TikTok.</div><div class="steps">${STATUSES.map(s=>`<div class="step"><strong>${items.filter(i=>i.status===s).length}</strong><span>${s}</span></div>`).join("")}</div><section class="page-panel"><div class="panel-head"><h3>Fila editorial</h3><span class="muted small">${items.length} itens</span></div>${items.length?`<div class="content-list">${[...items].sort((a,b)=>STATUSES.indexOf(a.status)-STATUSES.indexOf(b.status)).map(i=>cardRow(i)).join("")}</div>`:`<div class="empty"><b>Fila vazia</b>Os conteúdos enviados para revisão aparecerão aqui.</div>`}</section>`;
}
function render() {
 const root=$("#app-view");
 root.innerHTML=currentView==="dashboard"?renderDashboard():currentView==="library"?renderLibrary():currentView==="workflow"?renderWorkflow():"";
 if(currentView==="library") {
  $("#search").addEventListener("input",fillLibrary);
  $("#filter-status").addEventListener("change",fillLibrary);
  $("#filter-type").addEventListener("change",fillLibrary);
  fillLibrary();
 }
}
function openForm(item=null) {
 $("#content-form").reset();
 $("#content-id").value=item?.id||"";
 $("#form-title").textContent=item?"Editar conteúdo":"Criar conteúdo";
 $("#title").value=item?.title||"";
 $("#type").value=item?.type||"Notícia";
 $("#platform").value=item?.platform||"Instagram";
 $("#body").value=item?.body||"";
 $("#source").value=item?.source||"";
 $("#notes").value=item?.notes||"";
 $("#content-dialog").showModal();
}
function closeForm() { $("#content-dialog").close(); }
$("#new-content").addEventListener("click",()=>openForm());
$("#close-dialog").addEventListener("click",closeForm);
$("#cancel-dialog").addEventListener("click",closeForm);
$("#content-form").addEventListener("submit",e=>{
 e.preventDefault();
 const id=$("#content-id").value || (crypto.randomUUID?crypto.randomUUID():String(Date.now()));
 const old=items.find(i=>i.id===id);
 const item={id,title:$("#title").value.trim(),type:$("#type").value,platform:$("#platform").value,body:$("#body").value.trim(),source:$("#source").value.trim(),notes:$("#notes").value.trim(),status:old?.status||"Rascunho",createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
 if(!item.title){toast("Informe um título.");return;}
 if(old) items=items.map(i=>i.id===id?item:i); else items.push(item);
 persist(); closeForm(); currentView="library";setView("library");toast(old?"Conteúdo atualizado.":"Rascunho salvo.");
});
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-view]"); if(nav){setView(nav.dataset.view);return;}
 const link=e.target.closest("[data-view-link]");if(link){setView(link.dataset.viewLink);return;}
 const btn=e.target.closest("[data-action]");if(!btn)return;
 const item=items.find(i=>i.id===btn.dataset.id);if(!item)return;
 switch(btn.dataset.action){
  case "edit":openForm(item);break;
  case "delete":if(confirm(`Excluir “${item.title}”? Esta ação não pode ser desfeita.`)){items=items.filter(i=>i.id!==item.id);persist();render();toast("Conteúdo excluído.");}break;
  case "review":if(item.status==="Rascunho"){item.status="Em revisão";item.updatedAt=new Date().toISOString();persist();render();toast("Enviado para revisão.");}break;
  case "approve":if(item.status==="Em revisão"&&confirm("Você revisou os fatos e aprova este conteúdo?")){item.status="Aprovado";item.updatedAt=new Date().toISOString();persist();render();toast("Conteúdo aprovado manualmente.");}break;
  case "publish":if(item.status==="Aprovado"&&confirm("Confirma que você já publicou este conteúdo na plataforma? Este protótipo não publica diretamente.")){item.status="Publicado";item.updatedAt=new Date().toISOString();persist();render();toast("Status atualizado para publicado.");}break;
 }
});
setView("dashboard");
