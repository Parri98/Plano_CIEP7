(() => {
  'use strict';

  const cfg = window.CIEP7_CONFIG;
  const program = window.CIEP7_PROGRAM || [];
  const venues = cfg.venues;

  const $ = (id) => document.getElementById(id);
  const els = {
    search: $('searchInput'), clear: $('clearSearch'), results: $('results'), panel: document.querySelector('.search-panel'),
    locate: $('locateBtn'), all: $('allVenuesBtn'), gps: $('gpsStatus'), offline: $('offlineNotice'),
    sheet: $('detailSheet'), closeSheet: $('closeSheet'), detailVenue: $('detailVenue'), detailCode: $('detailCode'),
    detailTitle: $('detailTitle'), detailAuthors: $('detailAuthors'), detailDay: $('detailDay'), detailSession: $('detailSession'),
    detailTime: $('detailTime'), timeBox: $('timeBox'), distanceBox: $('distanceBox'), detailDistance: $('detailDistance'),
    centerDestination: $('centerDestinationBtn'), centerMe: $('centerMeBtn'), layersBtn: $('layersBtn'), layerMenu: $('layerMenu'), toast: $('toast')
  };

  const normalize = (value='') => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const escapeHtml = (s='') => s.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const searchIndex = program.map((w, i) => ({
    i,
    text: normalize(`${w.code} ${w.title} ${w.authors} ${venues[w.venueId]?.name || ''}`)
  }));

  const map = L.map('map', {
    zoomControl: false,
    preferCanvas: true,
    attributionControl: true,
    tap: true,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    minZoom: 16,
    maxZoom: cfg.map.maxZoom
  }).setView(cfg.map.center, cfg.map.initialZoom);

  const pnoa = L.tileLayer(cfg.map.pnoaUrl, {
    minZoom: 1, maxNativeZoom: 20, maxZoom: cfg.map.maxZoom, tileSize: 256,
    keepBuffer: 3, updateWhenIdle: false, updateWhenZooming: false,
    attribution: 'Ortofoto © IGN/CNIG · PNOA MA'
  });
  const osm = L.tileLayer(cfg.map.osmUrl, {
    maxNativeZoom: 19, maxZoom: cfg.map.maxZoom, tileSize: 256, keepBuffer: 3,
    attribution: '© OpenStreetMap contributors'
  });
  pnoa.addTo(map);
  let activeBase = 'pnoa';
  let tileErrors = 0;

  const venueMarkers = {};
  let selectedWork = null;
  let selectedVenueId = null;
  let userMarker = null;
  let accuracyCircle = null;
  let routeLine = null;
  let watchId = null;
  let userLatLng = null;
  let lastPanFromGps = 0;
  let toastTimer = null;

  const venueIcon = (id, selected=false) => {
    const v = venues[id];
    const extra = id === 'biblioteca' ? ' library' : '';
    return L.divIcon({
      className: 'venue-marker',
      html: `<div class="venue-pin${selected ? ' selected' : ''}${extra}">${escapeHtml(v.short)}</div>`,
      iconSize: selected ? [58, 40] : [52, 34],
      iconAnchor: selected ? [29, 20] : [26, 17]
    });
  };

  Object.entries(venues).forEach(([id, v]) => {
    const marker = L.marker([v.lat, v.lng], {
      icon: venueIcon(id, false),
      title: v.name,
      keyboard: true,
      riseOnHover: true
    }).addTo(map);
    marker.bindTooltip(v.name, {direction: 'top', offset: [0, -17], opacity: .96});
    marker.on('click', () => {
      map.flyTo([v.lat, v.lng], 20, {duration: .45});
      showToast(v.name);
    });
    venueMarkers[id] = marker;
  });

  const venueBounds = L.latLngBounds(Object.values(venues).map(v => [v.lat, v.lng]));
  const showAllVenues = () => map.fitBounds(venueBounds.pad(.22), {paddingTopLeft:[20,95], paddingBottomRight:[20,130], maxZoom:19.5});
  showAllVenues();

  function showToast(message, ms=2200){
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.hidden = false;
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, ms);
  }

  function setBaseLayer(name){
    if(name === activeBase) return;
    if(name === 'pnoa'){
      if(map.hasLayer(osm)) map.removeLayer(osm);
      pnoa.addTo(map);
    } else {
      if(map.hasLayer(pnoa)) map.removeLayer(pnoa);
      osm.addTo(map);
    }
    activeBase = name;
    document.querySelectorAll('.layer-choice').forEach(btn => btn.classList.toggle('active', btn.dataset.layer === name));
    els.layerMenu.hidden = true;
  }

  pnoa.on('tileerror', () => {
    tileErrors += 1;
    if(tileErrors === 8 && activeBase === 'pnoa'){
      showToast('La ortofoto no responde. Puedes cambiar al mapa de calles.', 3500);
    }
  });

  function renderResults(query){
    const q = normalize(query);
    els.clear.classList.toggle('show', !!q);
    if(!q){
      els.results.hidden = true;
      els.results.innerHTML = '';
      els.panel.classList.remove('has-results');
      return;
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    const matches = searchIndex
      .filter(row => tokens.every(t => row.text.includes(t)))
      .slice(0, 12)
      .map(row => program[row.i]);

    els.results.innerHTML = '';
    els.results.hidden = false;
    els.panel.classList.add('has-results');

    if(!matches.length){
      els.results.innerHTML = '<div class="no-results">No se han encontrado coincidencias.</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    matches.forEach(w => {
      const v = venues[w.venueId];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'result';
      btn.innerHTML = `
        <div class="result-top"><span class="result-code">${escapeHtml(w.code)}</span><span class="result-venue">${escapeHtml(v.short)}</span></div>
        <div class="result-title">${escapeHtml(w.title)}</div>
        <div class="result-authors">${escapeHtml(w.authors)}</div>
        <div class="result-schedule"><span aria-hidden="true">◷</span><strong>${escapeHtml(w.time || 'Horario pendiente')}</strong><span>·</span><span>${escapeHtml(w.day)}</span></div>`;
      btn.addEventListener('click', () => selectWork(w));
      frag.appendChild(btn);
    });
    els.results.appendChild(frag);
  }

  function selectWork(work){
    selectedWork = work;
    selectedVenueId = work.venueId;
    Object.entries(venueMarkers).forEach(([id, marker]) => marker.setIcon(venueIcon(id, id === selectedVenueId)));
    const v = venues[selectedVenueId];
    venueMarkers[selectedVenueId].setZIndexOffset(1000);
    map.flyTo([v.lat, v.lng], 20, {duration:.55});
    venueMarkers[selectedVenueId].openTooltip();

    els.detailVenue.textContent = v.name;
    els.detailCode.textContent = work.code;
    els.detailTitle.textContent = work.title;
    els.detailAuthors.textContent = work.authors;
    els.detailDay.textContent = work.day;
    els.detailSession.textContent = work.session;
    if(work.time){ els.detailTime.textContent = work.time; els.timeBox.hidden = false; }
    else { els.timeBox.hidden = true; }
    els.sheet.hidden = false;
    els.results.hidden = true;
    els.panel.classList.remove('has-results');
    els.search.blur();
    updateRouteAndDistance();
  }

  function clearSelection(){
    selectedWork = null;
    selectedVenueId = null;
    Object.entries(venueMarkers).forEach(([id, marker]) => {
      marker.setIcon(venueIcon(id, false));
      marker.setZIndexOffset(0);
      marker.closeTooltip();
    });
    if(routeLine){ map.removeLayer(routeLine); routeLine = null; }
    els.sheet.hidden = true;
    els.distanceBox.hidden = true;
  }

  function haversineMeters(a,b){
    const R=6371000, toRad=x=>x*Math.PI/180;
    const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lng-a.lng);
    const s=Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(s));
  }

  function updateRouteAndDistance(){
    if(routeLine){ map.removeLayer(routeLine); routeLine = null; }
    if(!userLatLng || !selectedVenueId){ els.distanceBox.hidden = true; return; }
    const v = venues[selectedVenueId];
    const dest = L.latLng(v.lat,v.lng);
    routeLine = L.polyline([userLatLng,dest], {color:'#f08b2f',weight:4,dashArray:'7 8',opacity:.92,interactive:false}).addTo(map);
    const d = haversineMeters(userLatLng,dest);
    els.detailDistance.textContent = d < 1000 ? `${Math.round(d)} m` : `${(d/1000).toFixed(1)} km`;
    els.distanceBox.hidden = false;
  }

  function setGpsStatus(text, active=true){
    els.gps.textContent = text;
    els.gps.hidden = false;
    els.locate.classList.toggle('active', active);
    els.locate.querySelector('.fab-label').textContent = active ? 'GPS activo' : 'Mi ubicación';
  }

  function stopGps(){
    if(watchId !== null){ navigator.geolocation.clearWatch(watchId); watchId = null; }
    els.locate.classList.remove('active');
    els.locate.querySelector('.fab-label').textContent = 'Mi ubicación';
    els.gps.hidden = true;
  }

  function startGps({center=true}={}){
    if(!navigator.geolocation){ showToast('Este navegador no ofrece geolocalización.'); return; }
    if(watchId !== null){
      if(userLatLng) map.flyTo(userLatLng, Math.max(map.getZoom(),19), {duration:.45});
      return;
    }
    els.locate.querySelector('.fab-label').textContent = 'Buscando…';
    watchId = navigator.geolocation.watchPosition(pos => {
      const p = L.latLng(pos.coords.latitude,pos.coords.longitude);
      userLatLng = p;
      const accuracy = Math.max(1, pos.coords.accuracy || 0);
      if(!userMarker){
        userMarker = L.marker(p, {
          icon:L.divIcon({className:'',html:'<div class="user-marker"></div>',iconSize:[22,22],iconAnchor:[11,11]}),
          title:'Tu ubicación', zIndexOffset:1200
        }).addTo(map).bindTooltip('Tu ubicación', {direction:'top',offset:[0,-13]});
        accuracyCircle = L.circle(p,{radius:accuracy,color:'#118c7e',weight:1,fillColor:'#118c7e',fillOpacity:.08,interactive:false}).addTo(map);
      } else {
        userMarker.setLatLng(p);
        accuracyCircle.setLatLng(p).setRadius(accuracy);
      }
      setGpsStatus(`GPS · ±${Math.round(accuracy)} m`, true);
      updateRouteAndDistance();
      if(center && Date.now()-lastPanFromGps>10000){ map.panTo(p,{animate:true,duration:.4}); lastPanFromGps=Date.now(); center=false; }
    }, err => {
      stopGps();
      const msg = err.code === 1 ? 'Permiso de ubicación denegado.' : 'No se ha podido obtener tu ubicación.';
      showToast(msg,3200);
    }, {enableHighAccuracy:true,maximumAge:2500,timeout:12000});
  }

  function updateConnectivity(){
    els.offline.hidden = navigator.onLine;
  }

  let inputRaf = 0;
  els.search.addEventListener('input', () => {
    cancelAnimationFrame(inputRaf);
    inputRaf = requestAnimationFrame(() => renderResults(els.search.value));
  });
  els.search.addEventListener('focus', () => renderResults(els.search.value));
  els.clear.addEventListener('click', () => {
    els.search.value=''; renderResults(''); clearSelection(); els.search.focus();
  });
  els.closeSheet.addEventListener('click', () => { els.sheet.hidden = true; });
  els.all.addEventListener('click', () => { clearSelection(); showAllVenues(); });
  els.locate.addEventListener('click', () => startGps({center:true}));
  els.centerDestination.addEventListener('click', () => {
    if(!selectedVenueId) return; const v=venues[selectedVenueId]; map.flyTo([v.lat,v.lng],20,{duration:.45});
  });
  els.centerMe.addEventListener('click', () => {
    if(userLatLng) map.flyTo(userLatLng,20,{duration:.45}); else startGps({center:true});
  });
  els.layersBtn.addEventListener('click', () => { els.layerMenu.hidden = !els.layerMenu.hidden; });
  document.querySelectorAll('.layer-choice').forEach(btn => btn.addEventListener('click', () => setBaseLayer(btn.dataset.layer)));
  map.on('click', () => { els.layerMenu.hidden = true; if(document.activeElement === els.search) els.search.blur(); });
  window.addEventListener('online', updateConnectivity);
  window.addEventListener('offline', updateConnectivity);
  window.addEventListener('resize', () => setTimeout(() => map.invalidateSize(false), 100));
  window.addEventListener('orientationchange', () => setTimeout(() => map.invalidateSize(false), 250));

  updateConnectivity();
  renderResults('');

  // Si el usuario ya concedió el permiso en una visita anterior, reactiva el GPS sin volver a molestarlo.
  if(navigator.permissions?.query){
    navigator.permissions.query({name:'geolocation'}).then(status => {
      if(status.state === 'granted') startGps({center:false});
    }).catch(() => {});
  }

  if('serviceWorker' in navigator && location.protocol.startsWith('http')){
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
