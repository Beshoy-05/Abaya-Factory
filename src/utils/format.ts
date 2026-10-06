/**
 * دوال تنسيق الأرقام والعملات والكميات لمصنع رواء الخليج للعبايات
 * تجعل الأرقام واضحة وسهلة القراءة (فواصل الآلاف، تمييز العملة، وعدد القطع)
 */

/**
 * تنسيق المبالغ المالية بفواصل الآلاف ورمز الجنيه
 * مثال: 12500 -> "12,500 ج"
 */
export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0 ج';
  }
  const num = Math.round(Number(value));
  return `${num.toLocaleString('en-US')} ج`;
}

/**
 * تنسيق الأرقام بفواصل الآلاف بدون عملة
 * مثال: 12500 -> "12,500"
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0';
  }
  const num = Math.round(Number(value));
  return num.toLocaleString('en-US');
}

/**
 * تنسيق الكميات وقطع العبايات
 * مثال: 25 -> "25 قطعة"
 */
export function formatPieces(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0 قطعة';
  }
  const num = Math.round(Number(value));
  return `${num.toLocaleString('en-US')} قطعة`;
}

/**
 * تنسيق التاريخ بنظام (يوم / شهر / سنة) المريح والمألوف في المصنع
 */
export function formatDateArabic(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${year} / ${month} / ${day}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * تفاصيل حالة الرصيد (مديونية / خالص / دائن)
 */
export function getBalanceStatus(balance: number) {
  const rounded = Math.round(balance || 0);
  if (rounded > 0) {
    return {
      type: 'debt' as const,
      label: 'عليه مديونية',
      amountText: `${formatCurrency(rounded)}`,
      color: '#b91c1c',
      bg: '#fef2f2',
      border: '#fecaca',
    };
  }
  if (rounded === 0) {
    return {
      type: 'settled' as const,
      label: 'خالص الحساب',
      amountText: '0 ج',
      color: '#15803d',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    };
  }
  return {
    type: 'credit' as const,
    label: 'له رصيد دائن',
    amountText: `${formatCurrency(Math.abs(rounded))}`,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
  };
}
