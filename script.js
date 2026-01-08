/**
 * SISTEMA MVC PROFISSIONAL - urs_001
 * Configuração: Redeploy Automático e Variáveis de Ambiente
 */

const App = {
    // A forma certa: Ele tenta ler a variável da Vercel, se for undefined, usa o link reserva.
    apiUrl: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) 
            ? process.env.NEXT_PUBLIC_API_URL 
            : 'https://script.google.com/macros/s/AKfycbwHOvRL8j9EgNTqeyTHoHfqdG64AU1jZlgakxnvido/dev',

    // Controlador de Requisições com Tratamento de Erros Profissional
    async request(action, payload) {
        document.getElementById('loader').style.display = 'flex';
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });

            if (!response.ok) throw new Error("Erro na rede");

            const res = await response.json();
            return res;

        } catch (e) {
            console.error("Erro na API:", e);
            this.aviso("Erro de Conexão", "Não foi possível falar com o servidor. Verifique se o link da API na Vercel está correto.", "error");
            return { sucesso: false, msg: "Falha na comunicação." };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
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

    // Gerenciador de Telas (Views)
    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    },

    // --- FUNÇÕES CRUD / REGRAS DE NEGÓCIO ---

    async login() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if (!u || !p) return this.aviso("Atenção", "Informe Usuário e Senha.", "warning");

        const res = await this.request('login', { user: u, pass: p });
        if (res && res.sucesso) {
            document.getElementById('txt-nome').innerText = res.nome;
            document.getElementById('txt-saldo').innerText = "R$ " + res.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            this.show('view-dash');
        } else {
            this.aviso("Acesso Negado", res.msg || "Dados inválidos.", "error");
        }
    },

    async recuperar() {
        const cpf = document.getElementById('esc-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Digite o CPF.", "warning");

        const res = await this.request('esqueciSenha', { cpf: cpf });
        if (res && res.sucesso) {
            this.aviso("Recuperado!", res.msg, "success");
            this.show('view-login');
        } else {
            this.aviso("Ops!", res.msg || "CPF não localizado.", "error");
        }
    },

    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF.", "warning");

        const res = await this.request('validarCpf', { cpf: cpf });
        if (res && res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + ", agora crie seu acesso:";
            document.getElementById('reg-linha').value = res.linha;
            this.show('view-finalizar');
        } else {
            this.aviso("Erro", res.msg, "error");
        }
    },

    async salvar() {
        const u = document.getElementById('reg-user').value;
        const s = document.getElementById('reg-pass').value;
        const l = document.getElementById('reg-linha').value;

        if (!u || !s) return this.aviso("Atenção", "Preencha todos os campos.", "warning");

        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if (res && res.sucesso) {
            this.aviso("Sucesso!", "Cadastro concluído! Faça seu login.", "success");
            this.show('view-login');
        } else {
            this.aviso("Erro", res.msg, "error");
        }
    }
};
