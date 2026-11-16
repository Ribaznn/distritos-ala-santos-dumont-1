// Converte relações OSM (Overpass "out geom") em polígonos GeoJSON
(function () {
  function key(p) { return p[0].toFixed(7) + ',' + p[1].toFixed(7); }

  function joinWays(ways) {
    ways = ways.map(w => w.slice());
    const rings = [];
    while (ways.length) {
      let cur = ways.shift();
      let guard = 0;
      while (key(cur[0]) !== key(cur[cur.length - 1]) && guard++ < 10000) {
        const end = key(cur[cur.length - 1]);
        const idx = ways.findIndex(w => key(w[0]) === end || key(w[w.length - 1]) === end);
        if (idx < 0) break;
        let w = ways.splice(idx, 1)[0];
        if (key(w[0]) !== end) w = w.reverse();
        cur = cur.concat(w.slice(1));
      }
      if (key(cur[0]) !== key(cur[cur.length - 1])) cur.push(cur[0]);
      if (cur.length >= 4) rings.push(cur);
    }
    return rings;
  }

  function relToFeature(rel) {
    const outer = [], inner = [];
    for (const m of rel.members) {
      if (m.type !== 'way' || !m.geometry) continue;
      const c = m.geometry.map(p => [p.lon, p.lat]);
      (m.role === 'inner' ? inner : outer).push(c);
    }
    const polys = joinWays(outer).map(r => [r]);
    for (const h of joinWays(inner)) {
      const p = polys.find(pl => turf.booleanPointInPolygon(h[0], turf.polygon([pl[0]])));
      if (p) p.push(h);
    }
    const geom = polys.length === 1
      ? { type: 'Polygon', coordinates: polys[0] }
      : { type: 'MultiPolygon', coordinates: polys };
    return turf.feature(geom, { name: rel.tags.name, osm_id: rel.id });
  }

  async function loadOsm(url) {
    const data = await (await fetch(url)).json();
    const out = {};
    for (const el of data.elements) {
      if (el.type === 'relation') out[el.tags.name] = relToFeature(el);
    }
    return out;
  }

  window.OsmGeo = { joinWays, relToFeature, loadOsm };
})();
