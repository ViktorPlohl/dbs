import {Card} from "./card.class";
import {CardParser} from "./parser.class";
import {ILeaderCard} from "../types/card.interface";

export class LeaderCard extends Card implements Partial<ILeaderCard> {
  character?: string;
  power?: string;
  specialTrait?: string[];
  cardBack?: Partial<ILeaderCard>;

  constructor(parser: CardParser) {
    super(parser)
    this.character = parser.parseCharacter();
    this.power = parser.parsePower();
    this.specialTrait = parser.parseSpecialTrait();
    if (parser?.details?.back) {
      this.cardBack = new LeaderCard(new CardParser(parser.details.back));
    }
  }
}
