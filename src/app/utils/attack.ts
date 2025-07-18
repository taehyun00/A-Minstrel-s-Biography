
export interface Stats {
    attack: number;
    defense: number;
    critical: number;   // 백분율(예: 20 → 20%)
  }
  
  export interface CombatResult {
    damageDealt: number;
    wasCritical: boolean;
  }
  
  /**
   * 플레이어 공격 → 몬스터 방어 적용 후 최종 데미지 계산
   * @param attacker 공격자 스탯
   * @param defender 방어자 스탯
   */
  export function calculateDamage(
    attacker: Stats,
    defender: Stats
  ): CombatResult {
    // 1) 기본 데미지 = 공격력 - 방어력 * 0.5
    var base = Math.max(attacker.attack - defender.defense*0.6, 1);

  
    // 2) 크리티컬 판정
    const roll = Math.random() * 100;
    const isCrit = roll < attacker.critical;
  
    // 3) 크리티컬 시 데미지 1.5배
    const damage = isCrit ? Math.floor(base * 1.2) : Math.floor(base);
  
    return { damageDealt: damage, wasCritical: isCrit };
  }
  