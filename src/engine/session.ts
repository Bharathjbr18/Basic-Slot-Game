import { BETS, DEFAULT_BET_INDEX, STARTING_CREDITS } from '../config/game';

/** Player wallet and bet selection. Pure state, no rendering. */
export class Session {
  private betIndex = DEFAULT_BET_INDEX;

  constructor(public credits: number = STARTING_CREDITS) {
    this.clampBetToCredits();
  }

  get bet(): number { return BETS[this.betIndex]; }
  get isBroke(): boolean { return this.credits < BETS[0]; }
  get canBetDown(): boolean { return this.betIndex > 0; }
  get canBetUp(): boolean { return this.betIndex < BETS.length - 1 && BETS[this.betIndex + 1] <= this.credits; }

  changeBet(delta: -1 | 1): void {
    this.betIndex = Math.min(BETS.length - 1, Math.max(0, this.betIndex + delta));
    this.clampBetToCredits();
  }

  charge(): void {
    if (this.credits < this.bet) throw new Error('Insufficient credits');
    this.credits -= this.bet;
  }

  award(amount: number): void {
    this.credits += amount;
    this.clampBetToCredits();
  }

  reset(credits: number = STARTING_CREDITS): void {
    this.credits = credits;
    this.betIndex = DEFAULT_BET_INDEX;
  }

  private clampBetToCredits(): void {
    while (this.betIndex > 0 && this.bet > this.credits) this.betIndex--;
  }
}
