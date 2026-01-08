/**
 * SISTEMA MVC AUTOMÁTICO - urs_001
 * Este script busca a URL da API direto do seu repositório GitHub.
 */

const App = {
    // AJUSTE ESTAS DUAS LINHAS COM SEUS DADOS DO GITHUB
    userGitHub: 'soulbash14', 
    repoGitHub: 'caixinha-urs001', 
    
    apiUrl: null,

    // 1. BUSCA A URL AUTOMATICAMENTE NO GITHUB
    async obterUrlApi() {
        if (this.apiUrl) return this.apiUrl; // Já buscou? Não busca de novo.
        
        try {
            // Busca o conteúdo do arquivo url.txt no modo 'raw' (texto puro)
            const rawUrl = `https://raw.githubusercontent.com/${this.userGitHub}/${this.repoGitHub}/main/url.txt`;
            const response = await fetch(rawUrl + '?t=' + new Date().getTime()); // Cache bypass
            const link = await response.text();
            
            this.apiUrl = link.trim();
            console.log("API Carregada:", this.apiUrl);
            return this.apiUrl;
        } catch (e) {
            console.error("Erro ao obter URL fixa:", e);
            return null;
        }
    },

    // 2. FUNÇÃO DE AVISO (SweetAlert2)
    aviso(titulo, texto, icone = 'info') {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icone,
            confirmButtonColor: '#2563eb',
            borderRadius: '15px'
        });
    },

    // 3. TROCAR TELAS
    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    },

    // 4. CONTROLADOR DE REQUISIÇÕES (MVC)
    async request(action, payload) {
        document.getElementById('loader').style.display = 'flex';
        
        const url = await this.obterUrlApi();
        if (!url) {
            this.aviso("Erro Crítico", "Não foi possível localizar o endereço do servidor no url.txt", "error");
            document.getElementById('loader').style.display = 'none';
            return { sucesso: false };
        }

        try {
            const r = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });
            return await r.json();
        } catch (e) {
            this.aviso("Erro de Conexão", "O servidor Google não respondeu.", "error");
            return { sucesso: false };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    // 5. LÓGICA DE LOGIN
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

    // 6. LÓGICA DE PRIMEIRO ACESSO (CADASTRO)
    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF.", "warning");

        const res = await this.request('validarCpf', { cpf: cpf });
        if (res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + ", agora crie seus dados:";
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

        if (!u || !s) return this.aviso("Atenção", "Defina um usuário e uma senha.", "warning");

        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if (res.sucesso) {
            Swal.fire("Sucesso!", "Cadastro realizado com sucesso!", "success")
                .then(() => this.show('view-login'));
        }
    },

    // 7. LÓGICA DE RECUPERAÇÃO DE SENHA
    async recuperar() {
        const cpf = document.getElementById('esc-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF para recuperar.", "warning");

        const res = await this.request('esqueciSenha', { cpf: cpf });
        if (res.sucesso) {
            this.aviso("Recuperado!", res.msg, "success");
            this.show('view-login');
        } else {
            this.aviso("Erro", res.msg, "error");
        }
    }
};
