/**
 * SISTEMA MVC PROFISSIONAL - urs_001
 * Frontend Conectado ao Controller Google Apps Script
 */

const App = {
    // Sua URL oficial (/exec)
    apiUrl: 'https://script.google.com/macros/s/AKfycbznslD7v9yiZP6aqZ8797Su7HGbWPtNwkH8cSh0yz118JoCGuUtjgwoI5qkGEvZDU8/exec',

    // Central de Comunicação
    async request(action, payload) {
        document.getElementById('loader').style.display = 'flex';
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });
            const res = await response.json();
            return res;
        } catch (e) {
            console.error("Erro na API:", e);
            this.aviso("Erro de Conexão", "Não foi possível falar com o servidor Google.", "error");
            return { sucesso: false };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    // Notificações
    aviso(titulo, texto, icone = 'info') {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icone,
            confirmButtonColor: '#2563eb'
        });
    },

    // Controle de Telas
    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    },

    // --- LÓGICA DE LOGIN ---
    async login() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if (!u || !p) return this.aviso("Atenção", "Preencha usuário e senha.", "warning");

        const res = await this.request('login', { user: u, pass: p });
        if (res && res.sucesso) {
            document.getElementById('txt-nome').innerText = res.nome;
            document.getElementById('txt-saldo').innerText = "R$ " + res.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            this.show('view-dash');
        } else {
            this.aviso("Erro", res.msg || "Dados inválidos.", "error");
        }
    },

    // --- LÓGICA DE CADASTRO (PRIMEIRO ACESSO) ---
    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF para validar.", "warning");

        const res = await this.request('validarCpf', { cpf: cpf });
        if (res && res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + ", agora crie seu acesso:";
            // Guarda a linha num campo oculto para usar no salvamento
            document.getElementById('reg-linha').value = res.linha;
            this.show('view-finalizar');
        } else {
            this.aviso("Ops!", res.msg, "error");
        }
    },

    async salvar() {
        const u = document.getElementById('reg-user').value;
        const s = document.getElementById('reg-pass').value;
        const l = document.getElementById('reg-linha').value;

        if (!u || !s) return this.aviso("Atenção", "Defina um usuário e senha.", "warning");

        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if (res && res.sucesso) {
            Swal.fire("Sucesso!", res.msg, "success").then(() => {
                this.show('view-login');
            });
        } else {
            this.aviso("Erro", "Não foi possível salvar o cadastro.", "error");
        }
    },

    // --- LÓGICA DE ESQUECI A SENHA ---
    async recuperar() {
        const cpf = document.getElementById('esc-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Digite seu CPF.", "warning");

        const res = await this.request('esqueciSenha', { cpf: cpf });
        if (res && res.sucesso) {
            this.aviso("Recuperado!", res.msg, "success");
            this.show('view-login');
        } else {
            this.aviso("Erro", res.msg, "error");
        }
    }
};
