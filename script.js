/**
 * SISTEMA MVC AUTOMÁTICO - urs_001
 * Usando link de desenvolvimento para atualização instantânea
 */

const App = {
    // SEU LINK DE TESTE (Atualiza na hora que você salva o código no Google)
    apiUrl: 'https://script.google.com/macros/s/AKfycbwHOvRL8j9EgNTqeyTHoHfqdG64AU1jZlgakxnvido/dev',

    // Central de Requisições
    async request(action, payload) {
        document.getElementById('loader').style.display = 'flex';
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });
            
            // Como o link /dev pode retornar HTML de login do Google se você não estiver logado:
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (err) {
                console.error("Resposta não é JSON:", text);
                this.aviso("Acesso Negado", "Certifique-se de estar logado no Google para usar o link /dev", "error");
                return { sucesso: false };
            }

        } catch (e) {
            this.aviso("Erro de Conexão", "O servidor Google não respondeu.", "error");
            return { sucesso: false };
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
            confirmButtonColor: '#2563eb'
        });
    },

    // Gerenciador de Telas
    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    },

    // Ações do Sistema
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

    async recuperar() {
        const cpf = document.getElementById('esc-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF.", "warning");

        const res = await this.request('esqueciSenha', { cpf: cpf });
        if (res && res.sucesso) {
            this.aviso("Senha Recuperada", res.msg, "success");
            this.show('view-login');
        } else {
            this.aviso("Erro", res.msg || "Usuário não encontrado.", "error");
        }
    },

    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        const res = await this.request('validarCpf', { cpf: cpf });
        if (res && res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + ", defina seus dados:";
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
        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if (res && res.sucesso) {
            this.aviso("Sucesso!", "Cadastro pronto, faça login.", "success");
            this.show('view-login');
        }
    }
};
