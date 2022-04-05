import {Skill} from "./skill.type";
import {Energy} from "./energy.type";
import {CardType} from "./card-type.type";
import {Color} from "./color";
import {LeaderCard} from "../classes/leader-card.class";
import {ExtraCard} from "../classes/extra-card.class";
import {BattleCard} from "../classes/battle-card.class";
import {UnisonCard} from "../classes/unison-card.class";
import {ICardmarket} from "./cardmarket-card.interface";

export interface ICard {
  number: string;
  name: string;
  type: CardType;
  color: Color[];
  availableInTournaments: string;
  series: string;
  rarity: string;
  image: string;
  skill: Skill;
  era: string;
  cardmarket: ICardmarket;
}

export interface IBattleCard extends ICard  {
  power: string;
  energy: Energy;
  comboEnergy: string;
  comboPower: string;
  character: string;
  specialTrait: string[];
}

export interface ILeaderCard extends ICard {
  power: string;
  character: string;
  specialTrait: string[];
  cardBack: Partial<ILeaderCard>
}

export interface IExtraCard extends ICard {
  energy: Energy;
}

export interface IUnisonCard extends ICard {
  power: string;
  energy: Energy;
}

export type DbsCard = (LeaderCard|ExtraCard|BattleCard|UnisonCard);
