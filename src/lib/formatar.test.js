import { describe, expect, it } from 'vitest';
import { formatarMoeda, formatarHorario, formatarData, statusEvento, ordenarLineup } from './formatar';

describe('formatarMoeda', () => {
  it('formata número em reais', () => {
    expect(formatarMoeda(1500)).toContain('500,00');
  });

  it('trata valor vazio como zero', () => {
    expect(formatarMoeda(null)).toMatch(/0,00/);
  });
});

describe('formatarHorario', () => {
  it('mostra HH:MM', () => {
    expect(formatarHorario('21:30:00')).toBe('21:30');
  });

  it('mostra placeholder sem horário', () => {
    expect(formatarHorario(null)).toBe('--:--');
  });
});

describe('formatarData', () => {
  it('não muda o dia por fuso (YYYY-MM-DD)', () => {
    expect(formatarData('2026-08-20')).toContain('20');
  });
});

describe('statusEvento', () => {
  it('marca data passada como finalizado', () => {
    expect(statusEvento('2000-01-01').chave).toBe('done');
  });
});

describe('ordenarLineup', () => {
  it('coloca a madrugada depois da noite', () => {
    const ordenada = ordenarLineup([
      { nome: 'Band 4', horario: '00:30' },
      { nome: 'Band 1', horario: '22:30' },
      { nome: 'Band 3', horario: '23:30' },
      { nome: 'Band 2', horario: '01:30' },
    ]);
    expect(ordenada.map((item) => item.horario)).toEqual(['22:30', '23:30', '00:30', '01:30']);
  });
});
