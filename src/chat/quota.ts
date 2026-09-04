export const DEFAULT_QUESTION_LIMIT = 8;

export type QuotaState = { used: number; limit: number; exhausted: boolean };

export function initialQuota(): QuotaState {
  return { used: 0, limit: DEFAULT_QUESTION_LIMIT, exhausted: false };
}

export function countLocalSend(state: QuotaState): QuotaState {
  const used = state.used + 1;

  return { ...state, used, exhausted: state.exhausted || used >= state.limit };
}

function nonNegativeInt(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function applyQuotaResponse(
  state: QuotaState,
  response: { status: number; headers: Headers },
): QuotaState {
  const limitHeader = nonNegativeInt(response.headers.get("x-twin-quota-limit"));
  const limit = limitHeader !== null && limitHeader > 0 ? limitHeader : state.limit;
  const remaining = nonNegativeInt(response.headers.get("x-twin-quota-remaining"));
  const used = remaining === null ? Math.min(state.used, limit) : Math.max(0, limit - remaining);

  return { used, limit, exhausted: response.status === 429 || used >= limit };
}

export function describeQuota(state: QuotaState): { visible: string; srText: string } {
  return {
    visible: `${state.used} / ${state.limit}`,
    srText: `질문 ${state.limit}개 중 ${state.used}개 사용`,
  };
}
