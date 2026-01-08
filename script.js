/**
 * SISTEMA MVC AUTOMÁTICO - urs_001
 * Correção: Modal de erro na recuperação de senha
 */

const App = {
    userGitHub: 'soulbash14', 
    repoGitHub: 'caixinha-urs001', 
    apiUrl: null,

    async obterUrlApi() {
        if (this.apiUrl) return this.apiUrl;
        try {
            const rawUrl = `https://raw.githubusercontent.com/${this.userGitHub}/${this.repoGitHub}/main/url.txt`;
            const response = await fetch(rawUrl + '?t=' + new Date().getTime());
            const link = await response.text();
            this.apiUrl = link.trim();
            return this.apiUrl;
        } catch (e) {
            console.error("Erro URL:", e);
            return null;
        }
    },

    aviso(titulo, texto, icone = 'info') {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icone,
            confirmButtonColor: '#2563eb',
            borderRadius: '15px'
        });
    },

    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    },

    async request(action, payload) {
        const url = await this.obterUrlApi();
        if (!url) return { sucesso: false, msg: "Configuração de API não encontrada." };

        document.getElementById('loader').style.display = 'flex';
        try {
            const r = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });
            return await r.json();
        } catch (e) {
            return { sucesso: false, msg: "Servidor fora do ar ou link inválido." };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    async login() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if (!u || !p) return this.aviso("Atenção", "Preencha usuário e senha.", "warning");

        const res = await this.request('login', { user: u, pass: p });
        if (res.sucesso) {
            document.getElementById('txt-nome').innerText = res.nome;
            document.getElementById('txt-saldo').innerText = "R$ " + res.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            this.show('view-dash');
        } else {
            this.aviso("Erro de Acesso", res.msg, "error");
        }
    },

    async recuperar() {
        const cpf = document.getElementById('esc-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF para recuperar.", "warning");

        const res = await this.request('esqueciSenha', { cpf: cpf });
        
        // CORREÇÃO AQUI: Se for sucesso mostra verde, se não mostra erro
        if (res.sucesso) {
            this.aviso("Recuperado!", res.msg, "success");
            this.show('view-login');
        } else {
            this.aviso("Ops!", res.msg, "error");
        }
    },

    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF.", "warning");

        const res = await this.request('validarCpf', { cpf: cpf });
        if (res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + ", crie seu acesso:";
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

        if (!u || !s) return this.aviso("Atenção", "Defina usuário e senha.", "warning");

        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if (res.sucesso) {
            Swal.fire("Sucesso!", "Pode fazer login agora.", "success").then(() => this.show('view-login'));
        } else {
            this.aviso("Erro", res.msg, "error");
        }
    }
};
