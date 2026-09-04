// 뫼비우스 띠: ∞ 리본을 두 가닥(under/over)으로 나눠 그린다. 각 가닥은 굵은 잉크 선 위에 종이색 선을 겹쳐
// 1px 테두리 두 줄만 남기고, 나중에 그린 over 가닥이 교차점에서 under 가닥을 덮어 앞뒤가 생긴다.
const UNDER = "M8 32C8 46 24 40 32 32C40 24 56 18 56 32";
const OVER = "M56 32C56 46 40 40 32 32C24 24 8 18 8 32";
const LOOP = `${UNDER}C56 46 40 40 32 32C24 24 8 18 8 32Z`;

export function MobiusMark() {
  return (
    <svg className="ask-docky-trigger-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g className="ask-docky-trigger-band">
        <path className="ask-docky-band-body" d={UNDER} />
        <path className="ask-docky-band-core" d={UNDER} />
        <path className="ask-docky-band-body" d={OVER} />
        <path className="ask-docky-band-core" d={OVER} />
        <path className="ask-docky-band-flow" d={LOOP} pathLength={100} />
      </g>
    </svg>
  );
}
