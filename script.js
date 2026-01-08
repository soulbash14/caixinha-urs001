/**
 * SISTEMA MVC PROFISSIONAL - urs_001
 * ID DA IMPLANTAÇÃO FIXO
 */

const App = {
    // SEU ID DE IMPLANTAÇÃO
    deploymentId: 'AKfycbwHOvRL8j9EgNTqeyTHoHfqdG64AU1jZlgakxnvido',
    
    // O link é montado automaticamente. Nunca mais mexa aqui.
    get apiUrl() {
        return `https://script.google.com/macros/s/${this.deploymentId}/exec`;
    },

    // Notificações SweetAlert2 (Sem erros de parâmetro)
    aviso(titulo, texto, icone = 'info') {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icone,
            confirmButtonColor: '#2563eb'
        });
    },

    // Controle de Telas (Views)
    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    },

    // Controller: Requisições para o Google
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
            this.aviso("Erro de Conexão", "O servidor Google não respondeu. Verifique se a implantação está como 'Qualquer pessoa'.", "error");
            return { sucesso: false };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    // --- AÇÕES DO USUÁRIO ---

    async login() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if (!u || !p) return this.aviso("Atenção", "Preencha todos os campos.", "warning");

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
            this.aviso("Recuperado!", res.msg, "success");
            this.show('view-login');
        } else {
            this.aviso("Não encontrado", res.msg || "CPF inválido.", "error");
        }
    },

    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        const res = await this.request('validarCpf', { cpf: cpf });
        if (res && res.sucesso) {
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
        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if (res && res.sucesso) {
            this.aviso("Sucesso!", "Cadastro realizado.", "success");
            this.show('view-login');
        }
    }
};
