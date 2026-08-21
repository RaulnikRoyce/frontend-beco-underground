export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function dataLocal(data) {
  if (!data) return null;
  const ymd = String(data).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const parsed = new Date(data);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatarData(data) {
  const dia = dataLocal(data);
  if (!dia) return '';
  return dia.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatarHorario(horario) {
  if (!horario) return '--:--';
  const texto = String(horario);
  const hhmm = texto.match(/^(\d{2}:\d{2})/);
  return hhmm ? hhmm[1] : texto;
}

export function statusEvento(data) {
  const dia = dataLocal(data);
  if (!dia) return { chave: 'upcoming', label: 'Próximo' };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dia.setHours(0, 0, 0, 0);
  const diff = (dia - hoje) / (1000 * 60 * 60 * 24);

  if (diff < 0) return { chave: 'done', label: 'Finalizado' };
  if (diff === 0) return { chave: 'live', label: 'Hoje' };
  return { chave: 'upcoming', label: 'Próximo' };
}
