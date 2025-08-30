
class Contato {
    constructor(nome, email, telefone) {
        this._nome = '';
        this._email = '';
        this._telefone = '';
        this._id = Date.now().toString();

        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
    }

    get nome() {
        return this._nome;
    }

    set nome(valor) {
        if (!valor || valor.trim().length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
        this._nome = valor.trim();
    }

    get email() {
        return this._email;
    }

    set email(valor) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!valor || !emailRegex.test(valor)) {
            throw new Error('E-mail deve ter um formato válido');
        }
        this._email = valor.trim().toLowerCase();
    }

    get telefone() {
        return this._telefone;
    }

    set telefone(valor) {
        const telefoneClean = valor.replace(/\D/g, '');
        if (telefoneClean.length < 10 || telefoneClean.length > 11) {
            throw new Error('Telefone deve ter 10 ou 11 dígitos');
        }
        this._telefone = valor.trim();
    }

    get id() {
        return this._id;
    }

    toJSON() {
        return {
            id: this._id,
            nome: this._nome,
            email: this._email,
            telefone: this._telefone
        };
    }

    static fromJSON(data) {
        const contato = new Contato(data.nome, data.email, data.telefone);
        contato._id = data.id;
        return contato;
    }
}

class GerenciadorContatos {
    constructor() {
        this.contatos = [];
        this.carregarContatos();
    }

    adicionarContato(nome, email, telefone) {
        try {
            const novoContato = new Contato(nome, email, telefone);

            if (this.contatos.some(c => c.email === novoContato.email)) {
                throw new Error('Já existe um contato com este e-mail');
            }

            this.contatos.push(novoContato);
            this.salvarContatos();
            return novoContato;
        } catch (error) {
            throw error;
        }
    }

    removerContato(id) {
        const index = this.contatos.findIndex(c => c.id === id);
        if (index !== -1) {
            this.contatos.splice(index, 1);
            this.salvarContatos();
            return true;
        }
        return false;
    }

    listarContatos() {
        return this.contatos.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    salvarContatos() {
        try {
            const contatosJSON = JSON.stringify(this.contatos.map(c => c.toJSON()));
            localStorage.setItem('contatos', contatosJSON);
            console.log('Contatos salvos no localStorage com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar contatos:', error);
        }
    }

    carregarContatos() {
        try {
            const dados = localStorage.getItem('contatos');
            if (dados) {
                const contatosData = JSON.parse(dados);
                this.contatos = contatosData.map(data => Contato.fromJSON(data));
                console.log('Contatos carregados do localStorage:', this.contatos.length);
            } else {
                this.contatos = [];
                console.log('Nenhum contato encontrado no localStorage');
            }
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
            this.contatos = [];
        }
    }
}

const gerenciador = new GerenciadorContatos();

function mostrarMensagem(texto, tipo = 'erro') {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.innerHTML = `<div class="${tipo}">${texto}</div>`;

    setTimeout(() => {
        mensagemDiv.innerHTML = '';
    }, 3000);
}

function limparFormulario() {
    document.getElementById('contatoForm').reset();
}

function renderizarContatos() {
    const lista = document.getElementById('listaContatos');
    const contatos = gerenciador.listarContatos();

    if (contatos.length === 0) {
        lista.innerHTML = '<div class="vazio">Nenhum contato cadastrado ainda.</div>';
        return;
    }

    const html = contatos.map(contato => `
        <div class="contato-item">
            <div class="contato-info">
                <div class="contato-nome">${contato.nome}</div>
                <div class="contato-detalhes">
                    📧 ${contato.email} | 📞 ${contato.telefone}
                </div>
            </div>
            <button class="btn btn-danger" onclick="removerContato('${contato.id}')">
                Remover
            </button>
        </div>
    `).join('');

    lista.innerHTML = html;
}

function removerContato(id) {
    if (confirm('Tem certeza que deseja remover este contato?')) {
        if (gerenciador.removerContato(id)) {
            mostrarMensagem('Contato removido com sucesso!', 'sucesso');
            renderizarContatos();
        } else {
            mostrarMensagem('Erro ao remover contato');
        }
    }
}

document.getElementById('contatoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;

    try {
        gerenciador.adicionarContato(nome, email, telefone);
        mostrarMensagem('Contato cadastrado com sucesso!', 'sucesso');
        limparFormulario();
        renderizarContatos();
    } catch (error) {
        mostrarMensagem(error.message);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    renderizarContatos();
});