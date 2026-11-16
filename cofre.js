// Carrega a lista de famílias.
// No computador (servidor local) lê data/familias.json direto.
// No site publicado esse arquivo não existe: lê data/familias.enc.json,
// que está criptografado (AES-GCM, chave derivada da senha com PBKDF2),
// e pede a senha da ala para abrir. Sem a senha os dados não podem ser lidos.
window.Cofre = (function () {
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const CHAVE_SESSAO = 'distritos-senha';

  async function abrir(enc, senha) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']);
    const chave = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(enc.salt), iterations: enc.iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const txt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(enc.iv) }, chave, b64(enc.ct));
    return JSON.parse(new TextDecoder().decode(txt));
  }

  function pedirSenha(tentar) {
    return new Promise(resolve => {
      const box = document.createElement('div');
      box.className = 'cofre';
      box.innerHTML =
        '<form class="cofre-card" autocomplete="off">' +
        '<h2>Lista restrita aos membros</h2>' +
        '<p>Digite a senha da ala para ver as famílias de cada distrito.</p>' +
        '<input type="password" name="s" placeholder="Senha" aria-label="Senha" required autofocus>' +
        '<p class="cofre-erro" hidden>Senha incorreta. Tente de novo.</p>' +
        '<button class="btn primary" type="submit">Entrar</button>' +
        '<a class="cofre-voltar" href="index.html">← Voltar ao mapa</a>' +
        '</form>';
      document.body.appendChild(box);
      const f = box.querySelector('form'), erro = box.querySelector('.cofre-erro'), bt = box.querySelector('button');
      f.onsubmit = async ev => {
        ev.preventDefault();
        bt.disabled = true; erro.hidden = true;
        const r = await tentar(f.s.value);
        bt.disabled = false;
        if (r) { box.remove(); resolve(r); } else { erro.hidden = false; f.s.select(); }
      };
    });
  }

  async function carregar() {
    try { const r = await fetch('data/familias.json'); if (r.ok) return await r.json(); } catch (e) { /* segue para a versão criptografada */ }
    const enc = await (await fetch('data/familias.enc.json')).json();
    const tentar = async senha => {
      try {
        const d = await abrir(enc, senha);
        try { sessionStorage.setItem(CHAVE_SESSAO, senha); } catch (e) { /* sem armazenamento: pede de novo na próxima */ }
        return d;
      } catch (e) { return null; }
    };
    let salva = null;
    try { salva = sessionStorage.getItem(CHAVE_SESSAO); } catch (e) { salva = null; }
    if (salva) { const d = await tentar(salva); if (d) return d; }
    return pedirSenha(tentar);
  }

  return { carregar };
})();
