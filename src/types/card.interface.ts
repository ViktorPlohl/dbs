import {Skill} from "../../../dbs/src/types/skill.type";
import {Energy} from "../../../dbs/src/types/energy.type";
import {CardType} from "./card-type.type";
import {Color} from "../../../dbs/src/types/color";
import {LeaderCard} from "../../../dbs/src/classes/leader-card.class";
import {ExtraCard} from "../../../dbs/src/classes/extra-card.class";
import {BattleCard} from "../../../dbs/src/classes/battle-card.class";
import {UnisonCard} from "../../../dbs/src/classes/unison-card.class";

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
