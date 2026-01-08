const App = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbznslD7v9yiZP6aqZ8797Su7HGbWPtNwkH8cSh0yz118JoCGuUtjgwoI5qkGEvZDU8/exec',

    async request(action, payload) {
        document.getElementById('loader').style.display = 'flex';
        try {
            const r = await fetch(this.apiUrl, { method: 'POST', body: JSON.stringify({ action, payload }) });
            return await r.json();
        } catch (e) {
            this.aviso("Erro", "Falha de conexão", "error");
            return { sucesso: false };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    aviso(t, txt, i) { Swal.fire({ title: t, text: txt, icon: i, confirmButtonColor: '#2563eb' }); },

    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-esqueci', 'view-dash', 'view-adm'];
        views.forEach(v => document.getElementById(v)?.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    },

    async login() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        const res = await this.request('login', { user: u, pass: p });
        if (res.sucesso) {
            document.getElementById('txt-nome').innerText = res.nome;
            document.getElementById('txt-saldo').innerText = res.saldo; // Mostra as cotas
            
            // VERIFICAÇÃO DE NÍVEL PARA MOSTRAR MENU ADM
            if (String(res.nivel) === "1") {
                document.getElementById('btn-menu-adm').classList.remove('hidden');
            }
            this.show('view-dash');
        } else { this.aviso("Erro", res.msg, "error"); }
    },

    async preCadastrar() {
        const payload = {
            nome: document.getElementById('adm-nome').value,
            cpf: document.getElementById('adm-cpf').value,
            cotas: document.getElementById('adm-cotas').value,
            nivel: document.getElementById('adm-nivel').value
        };
        if(!payload.nome || !payload.cpf) return this.aviso("Erro", "Preencha Nome e CPF", "warning");

        const res = await this.request('preCadastrar', payload);
        if (res.sucesso) {
            this.aviso("Sucesso", "Membro cadastrado com ID: " + res.id, "success");
            document.getElementById('adm-nome').value = "";
            document.getElementById('adm-cpf').value = "";
            document.getElementById('adm-cotas').value = "";
        }
    },

    async validarCPF() {
        const res = await this.request('validarCpf', { cpf: document.getElementById('reg-cpf').value });
        if (res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Olá " + res.nome + "!";
            document.getElementById('reg-linha').value = res.linha;
            this.show('view-finalizar');
        } else { this.aviso("Erro", res.msg, "error"); }
    },

    async salvar() {
        const res = await this.request('salvar', {
            linha: document.getElementById('reg-linha').value,
            u: document.getElementById('reg-user').value,
            s: document.getElementById('reg-pass').value
        });
        if (res.sucesso) { this.aviso("Sucesso", res.msg, "success"); this.show('view-login'); }
    },

    async recuperar() {
        const res = await this.request('esqueciSenha', { cpf: document.getElementById('esc-cpf').value });
        if (res.sucesso) { this.aviso("Sua Senha", res.msg, "success"); this.show('view-login'); }
        else { this.aviso("Erro", res.msg, "error"); }
    }
};
