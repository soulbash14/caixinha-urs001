/**
 * SISTEMA MVC PROFISSIONAL - urs_001
 * Status: Link estável /exec
 */

const App = {
    // Sua URL oficial de produção
    apiUrl: 'https://script.google.com/macros/s/AKfycbznslD7v9yiZP6aqZ8797Su7HGbWPtNwkH8cSh0yz118JoCGuUtjgwoI5qkGEvZDU8/exec',

    // Central de Comunicação (Controller)
    async request(action, payload) {
        document.getElementById('loader').style.display = 'flex';
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });

            if (!response.ok) throw new Error("Erro na rede");
            
            return await response.json();
        } catch (e) {
            console.error("Erro de conexão:", e);
            this.aviso("Erro de Conexão", "Não foi possível falar com o servidor Google. Verifique a implantação.", "error");
            return { sucesso: false };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    // Notificações SweetAlert2 Corrigidas
    aviso(titulo, texto, icone = 'info') {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icone,
            confirmButtonColor: '#2563eb'
        });
    },

    // Alternador de Telas (Views)
    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if(el) el.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    },

    // --- FUNÇÕES DE INTERAÇÃO ---

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

    async validarCPF() {
        const cpf = document.getElementById('reg-cpf').value;
        if (!cpf) return this.aviso("Atenção", "Informe o CPF.", "warning");

        const res = await this.request('validarCpf', { cpf: cpf });
        if (res && res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + ", agora crie seu acesso:";
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

        if (!u || !s) return this.aviso("Atenção", "Crie um usuário e senha.", "warning");

        const res = await this.request('salvar', { linha: l, u: u, s: s });
        if (res && res.sucesso) {
            this.aviso("Sucesso!", "Cadastro realizado! Faça login.", "success");
            this.show('view-login');
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
            this.aviso("Erro", res.msg || "CPF não encontrado.", "error");
        }
    }
};
