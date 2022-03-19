import {Energy} from "../types/energy.type";
import {Card} from "./card.class";
import {CardParser} from "./parser.class";
import {IUnisonCard} from "../types/card.interface";

export class UnisonCard extends Card implements Partial<IUnisonCard> {
  energy?: Energy;
  power?: string;

  constructor(parser: CardParser) {
    super(parser)
    this.energy = parser.parseEnergy();
    this.power = parser.parsePower();
  }
}
