/**
 * Converte input do usuário ("1.234,56" ou "1234.56") para decimal com
 * exatamente 2 casas, usando aritmética inteira (centavos) para evitar
 * imprecisão de ponto-flutuante IEEE 754 em dados financeiros.
 *
 * Retorna NaN se o valor não puder ser interpretado.
 */
export function parseMoney(raw: string): number {
  const normalized = raw
    .trim()
    .replace(/\./g, "")  // remove separador de milhar (pt-BR)
    .replace(",", ".");  // converte vírgula decimal para ponto

  const float = parseFloat(normalized);
  if (!isFinite(float)) return NaN;

  // Converte para centavos (inteiro) e volta para reais — elimina erros de arredondamento
  return Math.round(float * 100) / 100;
}

/** Formata centavos inteiros para exibição em pt-BR ("R$ 1.234,56") */
export function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    style:    "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Máscara de moeda "digit-shift": ignora tudo que não for dígito (bloqueia
 * letras/símbolos no campo) e reconstrói o valor formatado ("1.234,56") a
 * cada tecla, tratando os dígitos digitados como centavos da direita pra
 * esquerda — o mesmo comportamento de caixas eletrônicos/apps bancários.
 */
export function maskCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const cents = digits.padStart(3, "0");
  const intPart = cents.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const decPart = cents.slice(-2);
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart}`;
}

/** Converte um valor numérico (vindo da API) para o formato do campo
 * mascarado ("45,00") — usado para pré-preencher o formulário ao editar
 * uma transação existente. */
export function amountToMaskedInput(amount: number): string {
  return maskCurrencyInput(String(Math.round(amount * 100)));
}
