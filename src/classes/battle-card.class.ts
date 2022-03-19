import {Energy} from "../types/energy.type";
import {Card} from "./card.class";
import {CardParser} from "./parser.class";
import {IBattleCard} from "../types/card.interface";

export class BattleCard extends Card implements Partial<IBattleCard> {
  character: string | undefined;
  comboEnergy: string | undefined;
  comboPower: string | undefined;
  energy: Energy | undefined;
  power: string | undefined;
  specialTrait: string[] | undefined;

  constructor(parser: CardParser) {
    super(parser)
    this.character = parser.parseCharacter();
    this.comboEnergy = parser.parseComboEnergy();
    this.comboPower = parser.parseComboPower();
    this.energy = parser.parseEnergy();
    this.power = parser.parsePower();
    this.specialTrait = parser.parseSpecialTrait();
  }
}
