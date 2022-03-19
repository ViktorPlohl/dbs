import {Energy} from "../types/energy.type";
import {Card} from "./card.class";
import {CardParser} from "./parser.class";
import {IExtraCard} from "../types/card.interface";

export class ExtraCard extends Card implements Partial<IExtraCard>{
  energy?: Energy;

  constructor(parser: CardParser) {
    super(parser)
    this.energy = parser.parseEnergy()
  }
}
