import {CardType} from "../types/card-type.type";
import {Skill} from "../types/skill.type";
import {Color} from "../types/color";
import {CardParser} from "./parser.class";
import {ICard} from "../types/card.interface";
import {ICardmarket} from "../types/cardmarket-card.interface";

export class Card implements Partial<ICard> {
  availableInTournaments?: string;
  color?: Color[];
  image?: string;
  name?: string;
  number?: string;
  rarity?: string;
  series?: string;
  type?: CardType;
  era?: string;
  skill?: Skill;
  cardmarket?: ICardmarket;

  constructor(parser: CardParser) {
    this.availableInTournaments = parser.parseAvailableInTournaments();
    this.color = parser.parseColor();
    this.image = parser.parseImage();
    this.name = parser.parseName();
    this.number = parser.parseNumber();
    this.rarity = parser.parseRarity();
    this.series = parser.parseSeries();
    this.type = parser.parseType();
    this.era = parser.parseEra();
    this.skill = parser.parseSkill()
  }
}


