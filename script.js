const App = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbznslD7v9yiZP6aqZ8797Su7HGbWPtNwkH8cSh0yz118JoCGuUtjgwoI5qkGEvZDU8/exec',

    async request(action, payload) {
        document.getElementById('loader').style.display = 'block';
        try {
            const response = await fetch(this.apiUrl, { method: 'POST', body: JSON.stringify({ action, payload }) });
            return await response.json();
        } catch (e) {
            return { sucesso: false, msg: "Erro de conexão" };
        } finally {
            document.getElementById('loader').style.display = 'none';
        }
    },

    async login() {
        const res = await this.request('login', { 
            user: document.getElementById('user').value, 
            pass: document.getElementById('pass').value 
        });

        if (res.sucesso) {
            document.getElementById('txt-nome').innerText = res.nome;
            document.getElementById('txt-saldo').innerText = res.saldo; // Saldo ou Cotas
            document.getElementById('badge-nivel').innerText = res.nivel;

            // REGRA: Se for Administrador, mostra o botão do Menu ADM
            if(res.nivel === 'Administrador') {
                document.getElementById('btn-menu-adm').classList.remove('hidden');
            }

            this.show('view-dash');
        } else {
            Swal.fire("Erro", res.msg, "error");
        }
    },

    async preCadastrar() {
        const payload = {
            nome: document.getElementById('adm-nome').value,
            cpf: document.getElementById('adm-cpf').value,
            cotas: document.getElementById('adm-cotas').value,
            nivel: document.getElementById('adm-nivel').value
        };

        const res = await this.request('preCadastrar', payload);
        if(res.sucesso) {
            Swal.fire("Sucesso", "Membro pré-cadastrado com ID: " + res.id, "success");
            // Limpa campos
            document.getElementById('adm-nome').value = "";
            document.getElementById('adm-cpf').value = "";
        }
    },

    async validarCPF() {
        const res = await this.request('validarCpf', { cpf: document.getElementById('reg-cpf').value });
        if(res.sucesso) {
            document.getElementById('msg-boas-vindas').innerText = "Bem-vindo " + res.nome + "!";
            document.getElementById('reg-linha').value = res.linha;
            this.show('view-finalizar');
        } else {
            Swal.fire("Atenção", res.msg, "warning");
        }
    },

    async salvar() {
        const res = await this.request('salvar', {
            linha: document.getElementById('reg-linha').value,
            u: document.getElementById('reg-user').value,
            s: document.getElementById('reg-pass').value
        });
        if(res.sucesso) {
            Swal.fire("Pronto!", "Acesso criado!", "success").then(() => location.reload());
        }
    },

    show(id) {
        const views = ['view-login', 'view-cadastro', 'view-finalizar', 'view-dash', 'view-adm'];
        views.forEach(v => document.getElementById(v)?.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }
};
