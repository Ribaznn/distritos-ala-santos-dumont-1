// Monta as áreas dos distritos recortando os bairros pelo limite azul da ala.
// Depende de: turf, geo.js (OsmGeo), distritos.js (DISTRITOS)
window.AppCore = (function () {
  // Divisa Distrito 01 x 02 pelas ruas (data/divisa_d1_d2.geojson):
  // Praia (depois do Alphaville) -> Rod. José de Campos/SE-100 -> Posto Petrox -> Rod. José de Campos até a ponte (alterada em 23/11/2026).
  // O polígono "sul" é tudo abaixo/à oeste dessa linha.
  function sideOf(div) {
    const L = div.features[0].geometry.coordinates;
    const a = L[0], b = L[L.length - 1];
    const sul = turf.polygon([L.concat([[b[0], b[1] - 0.6], [a[0], a[1] - 0.6], a])]);
    return { sul, linha: L };
  }

  function union(list) {
    let acc = null;
    for (const f of list) { if (f) acc = acc ? turf.union(acc, f) : f; }
    return acc;
  }

  async function build() {
    const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
    const [wardFC, osmRaw, lug, div] = await Promise.all([
      get('data/limite_ala.geojson'), get('data/osm_relations.json'), get('data/lugares.json'), get('data/divisa_d1_d2.geojson')
    ]);
    const ward = wardFC.features[0];

    const osm = {};
    for (const el of osmRaw.elements) if (el.type === 'relation') osm[el.tags.name] = OsmGeo.relToFeature(el);
    const barra = osm['Barra dos Coqueiros'];
    delete osm['Barra dos Coqueiros'];

    const aracaju = union(Object.values(osm));
    const rest = turf.difference(ward, aracaju);           // tudo que não é Aracaju
    const barraPart = turf.intersect(rest, barra);          // Barra dos Coqueiros
    const hp = sideOf(div);
    let norte = turf.difference(rest, barra);               // além do município (Pirambu etc.)
    norte = norte && turf.intersect(norte, turf.bboxPolygon([-37.3, -10.775, -36.3, -10.3]));

    const districts = DISTRITOS.map(cfg => {
      const d = Object.assign({}, cfg, { bairros: [], lugares: [] });
      if (cfg.regra.tipo === 'bairros') {
        const parts = [];
        for (const nome of cfg.regra.bairros) {
          const b = osm[nome]; if (!b) continue;
          const it = turf.intersect(b, ward); if (!it) continue;
          const a = turf.area(it), A = turf.area(b);
          parts.push(it);
          const rotulo = (cfg.regra.rotulos || {})[nome];
          if (a >= 5e4 || a / A >= 0.10) d.bairros.push({ nome, rotulo, pct: a / A, area: a, feature: it });
        }
        d.feature = union(parts);
      } else {
        const lado = cfg.regra.lado === 'sul' ? turf.intersect(barraPart, hp.sul) : turf.difference(barraPart, hp.sul);
        d.feature = cfg.regra.lado === 'norte' ? union([lado, norte]) : lado;
      }
      d.area = d.feature ? turf.area(d.feature) : 0;
      return d;
    });

    const byId = id => districts.find(d => d.id === id);
    const places = [];
    const todos = lug.barra.map(p => Object.assign({ grupo: 'barra' }, p))
      .concat(lug.norte.map(p => Object.assign({ grupo: 'norte' }, p)));
    for (let p of todos) {
      const pt = turf.point([p.lon, p.lat]);
      if (!turf.booleanPointInPolygon(pt, ward)) continue;
      // localidades em cima da linha azul (traçado menos preciso no interior): marcadas como "na divisa"
      if (p.divisa) p = Object.assign({}, p, { nome: p.nome + ' (na divisa)' });
      let d = districts.find(x => x.regra.tipo === 'barra' && x.feature && turf.booleanPointInPolygon(pt, x.feature));
      if (!d) d = (p.grupo === 'norte' || !turf.booleanPointInPolygon(pt, hp.sul)) ? byId(2) : byId(1);
      d.lugares.push(p.nome);
      places.push(Object.assign({ distrito: d.id }, p));
    }
    return { ward, districts, places, petrox: lug.petrox, corte: hp.linha };
  }

  function bairroLabel(b) { return b.rotulo ? b.rotulo : (b.pct < 0.85 ? b.nome + ' (parte)' : b.nome); }
  function regioes(d) { return d.regra.tipo === 'bairros' ? d.bairros.map(bairroLabel) : d.lugares; }

  return { build, regioes, bairroLabel };
})();
