/**
 * LÓGICA MVC - urs_001
 */

const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzX6Rv-0zJplG_-_6_djYq1aUVSfG5Iw6Dv0HiZPUCmoYhvAurg9ztRqJR1KMizU3tn/exec'
};

const App = {
    // Alternar entre as visualizações
    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => document.getElementById(v).classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    },

    // Notificações SweetAlert2
    aviso(titulo, texto, icone = 'info') {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icone,
            confirmButtonColor: '#2563eb',
            borderRadius: '15px'
        });
    },

    // Requisição Centralizada (Controller)
    async request(action, payload) {
        document.getElementById('loader').style.display = 'flex';
        try {
            const r = await fetch(CONFIG.API_URL, { 
                method: 'POST', 
                body: JSON.stringify({action, payload}) 
            });
            return await r.json();
        } catch(e) {
            this.aviso("Erro", "Conexão falhou!", "error");
            return { sucesso: false };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    async login() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if(!u || !p) return this.aviso("Atenção", "Preencha tudo!", "warning");

        const res = await this.request('login', { user: u, pass: p });
        if(res.sucesso) {
            document.getElementById('txt-nome').innerText = res.nome;
            document.getElementById('txt-saldo').innerText = "R$ " + res.saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2});
            this.show('view-dash');
        } else {
            this.aviso("Erro", res.msg, "error");
        }
    },

    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        if(!cpf) return this.aviso("Atenção", "Informe o CPF", "warning");

        const res = await this.request('validarCpf', { cpf: cpf });
        if(res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + ", defina seu login:";
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

        if(!u || !s) return this.aviso("Atenção", "Preencha Usuário e Senha", "warning");

        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if(res.sucesso) {
            Swal.fire("Sucesso!", res.msg, "success").then(() => this.show('view-login'));
        }
    },

    async recuperar() {
        const cpf = document.getElementById('esc-cpf').value;
        const res = await this.request('esqueciSenha', { cpf: cpf });
        this.aviso("Recuperação", res.msg, res.sucesso ? "success" : "error");
        if(res.sucesso) this.show('view-login');
    }
};
