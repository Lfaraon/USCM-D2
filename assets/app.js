const state = { seasons: [], current: null };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function formatDiff(v){ return v > 0 ? `+${v}` : String(v); }
function resultClass(match, teamName){
  const isHome = match.home === teamName;
  const gf = isHome ? match.hg : match.ag;
  const ga = isHome ? match.ag : match.hg;
  return gf > ga ? 'win' : gf < ga ? 'loss' : 'draw';
}

function setTab(name){
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  $$('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel === name));
  window.scrollTo({top:0, behavior:'smooth'});
}

function renderSeasonSelect(){
  const select = $('#season-select');
  select.innerHTML = state.seasons.map(s => `<option value="${s.id}">${s.label} · ${s.team}</option>`).join('');
  select.value = state.current.id;
}

function renderStats(season){
  const s = season.stats;
  $('#stat-grid').innerHTML = [
    ['Classement', `${s.rank}e`],
    ['Points', s.points],
    ['Matchs', s.played],
    ['Diff.', formatDiff(s.diff)]
  ].map(([label,value]) => `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`).join('');
}

function matchRow(match, teamName){
  return `<div class="match-row">
    <div class="match-date">${match.date}<br>${match.competition || ''}</div>
    <div class="match-teams"><strong>${match.home}</strong><br>${match.away}</div>
    <div class="score-pill ${resultClass(match, teamName)}">${match.hg}–${match.ag}</div>
  </div>`;
}

function renderMatches(season){
  const results = season.results || [];
  $('#recent-results').innerHTML = results.slice(-3).reverse().map(m => matchRow(m, season.fullTeamName)).join('') || '<p class="note">Aucun résultat enregistré.</p>';
  $('#all-results').innerHTML = results.slice().reverse().map(m => matchRow(m, season.fullTeamName)).join('') || '<p class="note">Aucun résultat enregistré.</p>';
  $('#matches-count').textContent = `${results.length} joués`;

  const n = season.nextMatch;
  $('#next-match-card').innerHTML = n ? `<div class="next-card">
    <div class="next-label">Prochain match</div>
    <div class="next-opponent">${n.opponent}</div>
    <div class="next-meta">${n.date}${n.time ? ` · ${n.time}` : ''}${n.venue ? ` · ${n.venue}` : ''}</div>
  </div>` : '<p class="note">Aucun prochain match renseigné.</p>';
}

function renderRoster(season){
  const roster = season.roster || [];
  $('#roster-count').textContent = `${roster.length} joueurs`;
  const groups = roster.reduce((acc,p) => {
    (acc[p.group] ||= []).push(p);
    return acc;
  }, {});
  $('#roster-groups').innerHTML = Object.entries(groups).map(([group,players]) => `<div class="roster-group">
    <div class="roster-group-title"><span>${group}</span><span>${players.length}</span></div>
    <div class="player-grid">${players.map(p => `<div class="player-card">
      <div class="player-name">${p.name}</div>
      <div class="player-meta">${p.year || 'Année à confirmer'}${p.number ? ` · n° ${p.number}` : ''}</div>
    </div>`).join('')}</div>
  </div>`).join('');
}

function renderStandings(season){
  const rows = season.standings || [];
  $('#standings-date').textContent = season.updatedAt || '';
  $('#standings-body').innerHTML = rows.map((r,i) => `<tr class="${r.team === season.fullTeamName ? 'uscm' : ''}">
    <td>${i+1}</td><td>${r.team}</td><td>${r.mj}</td><td class="${r.diff>0?'diff-pos':r.diff<0?'diff-neg':''}">${formatDiff(r.diff)}</td><td><strong>${r.pts}</strong></td>
  </tr>`).join('');
  $('#standings-note').textContent = season.standingsNote || '';
}

function renderArchives(){
  const archives = state.seasons.filter(s => s.mode === 'archive');
  $('#archive-list').innerHTML = archives.map(a => `<article class="archive-card">
    <span class="archive-badge">Archivée</span>
    <h4>${a.label} · ${a.team}</h4>
    <p>${a.description}</p>
    <a href="${a.archiveUrl}">Ouvrir l’ancienne application →</a>
  </article>`).join('') || '<p class="note">Aucune archive.</p>';
}

function renderLiveSeason(season){
  $('#live-app').hidden = false;
  $('#archive-view').hidden = true;
  $('#error-view').hidden = true;
  $('#app-title').textContent = `${season.team} · ${season.label}`;
  $('#team-title').textContent = season.team;
  $('#season-subtitle').textContent = `${season.category} · ${season.competition}`;
  $('#season-status').textContent = season.statusLabel || 'Saison active';
  renderStats(season);
  renderMatches(season);
  renderRoster(season);
  renderStandings(season);
  renderArchives();
  setTab('overview');
}

function renderArchiveSeason(season){
  $('#live-app').hidden = true;
  $('#archive-view').hidden = false;
  $('#error-view').hidden = true;
  $('#app-title').textContent = `Archive · ${season.label}`;
  $('#archive-title').textContent = `${season.team} · ${season.label}`;
  $('#archive-description').textContent = season.description;
  $('#archive-open').href = season.archiveUrl;
}

function activateSeason(id){
  const season = state.seasons.find(s => s.id === id) || state.seasons[0];
  state.current = season;
  $('#season-select').value = season.id;
  if(season.mode === 'archive') renderArchiveSeason(season); else renderLiveSeason(season);
  history.replaceState(null,'',`#${season.id}`);
}

async function init(){
  try{
    const res = await fetch('data/seasons.json', {cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    state.seasons = await res.json();
    const fromHash = location.hash.replace('#','');
    state.current = state.seasons.find(s => s.id === fromHash) || state.seasons.find(s => s.current) || state.seasons[0];
    renderSeasonSelect();
    activateSeason(state.current.id);

    $('#season-select').addEventListener('change', e => activateSeason(e.target.value));
    $$('.tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
    $$('[data-go-tab]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.goTab)));
    $('#return-current').addEventListener('click', () => {
      const current = state.seasons.find(s => s.current) || state.seasons.find(s => s.mode === 'live');
      activateSeason(current.id);
    });
  }catch(err){
    console.error(err);
    $('#live-app').hidden = true;
    $('#archive-view').hidden = true;
    $('#error-view').hidden = false;
  }
}

document.addEventListener('DOMContentLoaded', init);
