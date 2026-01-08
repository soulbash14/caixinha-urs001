const App = {

  apiUrl: 'https://script.google.com/macros/s/AKfycbznslD7v9yiZP6aqZ8797Su7HGbWPtNwkH8cSh0yz118JoCGuUtjgwoI5qkGEvZDU8/exec',

  /* =========================
     REQUEST PADRÃO
  ========================= */
  async request(action, payload = {}) {
    document.getElementById('loader').style.display = 'flex';

    try {
      const r = await fetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action, payload })
      });
      return await r.json();

    } catch (e) {
      this.alert('Erro', 'Falha de conexão com o servidor', 'error');
      return { sucesso: false };

    } finally {
      document.getElementById('loader').style.display = 'none';
    }
  },

  /* =========================
     UI HELPERS
  ========================= */
  show(viewId) {
    const views = [
      'view-login',
      'view-dash',
      'view-cadastro',
      'view-finalizar',
      'view-esqueci',
      'view-adm'
    ];
    views.forEach(v => document.getElementById(v)?.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
  },

  alert(t, m, i) {
    Swal.fire({
      title: t,
      text: m,
      icon: i,
      confirmButtonColor: '#2563eb'
    });
  },

  /* =========================
     LOGIN
  ========================= */
  async login() {
    const username = document.getElementById('user').value;
    const senha = document.getElementById('pass').value;

    if (!username || !senha) {
      return this.alert('Erro', 'Informe usuário e senha', 'warning');
    }

    const res = await this.request('login', { username, senha });

    if (!res.sucesso) {
      return this.alert('Erro', res.msg, 'error');
    }

    document.getElementById('txt-nome').innerText = res.nome;
    document.getElementById('txt-saldo').innerText = res.cotas;

    // menu ADM
    if (Number(res.nivel) >= 1) {
      document.getElementById('btn-menu-adm').classList.remove('hidden');
    }

    this.show('view-dash');
  },

  /* =========================
     PRIMEIRO ACESSO — VALIDAR CPF
  ========================= */
  async validarCPF() {
    const cpf = document.getElementById('reg-cpf').value;

    if (!cpf) {
      return this.alert('Erro', 'Informe o CPF', 'warning');
    }

    const res = await this.request('validarCpf', { cpf });

    if (!res.sucesso) {
      return this.alert('Erro', res.msg, 'error');
    }

    document.getElementById('msg-boas-vindas').innerText =
      `Olá ${res.nome}, finalize seu cadastro`;

    document.getElementById('reg-linha').value = res.linha;

    this.show('view-finalizar');
  },

  /* =========================
     FINALIZAR CADASTRO
  ========================= */
  async finalizarCadastro() {

    const payload = {
      linha: document.getElementById('reg-linha').value,
      username: document.getElementById('reg-user').value,
      senha: document.getElementById('reg-pass').value,
      email: document.getElementById('reg-email')?.value || '',
      telefone: document.getElementById('reg-telefone')?.value || '',
      pix: document.getElementById('reg-pix')?.value || ''
    };

    if (!payload.username || !payload.senha) {
      return this.alert('Erro', 'Usuário e senha são obrigatórios', 'warning');
    }

    const res = await this.request('finalizarCadastro', payload);

    if (!res.sucesso) {
      return this.alert('Erro', res.msg, 'error');
    }

    this.alert('Sucesso', res.msg, 'success');
    this.show('view-login');
  },

  /* =========================
     PRÉ-CADASTRO — ADM / SUBADM
  ========================= */
  async preCadastrar() {

    const payload = {
      nome: document.getElementById('adm-nome').value,
      cpf: document.getElementById('adm-cpf').value,
      cotas: document.getElementById('adm-cotas').value,
      nivel: document.getElementById('adm-nivel').value
    };

    if (!payload.nome || !payload.cpf) {
      return this.alert('Erro', 'Nome e CPF são obrigatórios', 'warning');
    }

    const res = await this.request('preCadastrar', payload);

    if (!res.sucesso) {
      return this.alert('Erro', res.msg, 'error');
    }

    this.alert('Sucesso', `Membro pré-cadastrado: ${res.id}`, 'success');

    document.getElementById('adm-nome').value = '';
    document.getElementById('adm-cpf').value = '';
    document.getElementById('adm-cotas').value = '';
  },

  /* =========================
     ESQUECI SENHA
  ========================= */
  async resetarSenha() {
    const cpf = document.getElementById('esc-cpf').value;

    if (!cpf) {
      return this.alert('Erro', 'Informe o CPF', 'warning');
    }

    const res = await this.request('resetarSenha', { cpf });

    if (!res.sucesso) {
      return this.alert('Erro', res.msg, 'error');
    }

    this.alert('Sucesso', res.msg, 'success');
    this.show('view-login');
  },

  /* =========================
     TEMAS
  ========================= */
  setTheme(theme) {
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '').trim();
    body.classList.add(theme);
    localStorage.setItem('urs_theme', theme);
  },

  loadTheme() {
    const theme = localStorage.getItem('urs_theme') || 'theme-dark';
    document.body.classList.add(theme);
  }

};

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
  App.loadTheme();
});

