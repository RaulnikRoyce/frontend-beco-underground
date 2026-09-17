import { describe, expect, it } from 'vitest';
import { mensagemDeErro } from './erros';

describe('mensagemDeErro', () => {
  it('usa a mensagem específica do campo quando a API manda detalhes', () => {
    const erro = { response: { data: { erro: 'Dados inválidos', detalhes: [{ campo: 'nome', mensagem: 'Nome do lote obrigatório' }] } } };
    expect(mensagemDeErro(erro)).toBe('Nome do lote obrigatório');
  });

  it('junta várias mensagens de detalhe quando há mais de um campo inválido', () => {
    const erro = { response: { data: { detalhes: [{ mensagem: 'Nome obrigatório' }, { mensagem: 'Preço inválido' }] } } };
    expect(mensagemDeErro(erro)).toBe('Nome obrigatório Preço inválido');
  });

  it('cai para o campo erro quando não há detalhes', () => {
    const erro = { response: { data: { erro: 'Sem permissão' } } };
    expect(mensagemDeErro(erro)).toBe('Sem permissão');
  });

  it('usa o fallback quando não há resposta da API (erro de rede)', () => {
    expect(mensagemDeErro({}, 'Erro ao salvar')).toBe('Erro ao salvar');
    expect(mensagemDeErro(new Error('network'), 'Erro ao salvar')).toBe('Erro ao salvar');
  });
});
