import {HTMLElement} from "node-html-parser";
import {Color} from "../types/color";
import {Skill} from "../types/skill.type";
import _ from "lodash";
import {DBS_BASE_URL} from "../main";
import {Energy} from "../types/energy.type";
import {CardType} from "../types/card-type.type";

type CardDetail = {
  details: HTMLElement | null;
  left: HTMLElement | null;
  right: HTMLElement | null;
  bottom: HTMLElement | null;
  back: HTMLElement | null;
}

export class CardParser {
  details: Partial<CardDetail>;

  public static specialTraitsRegex = new RegExp('《(.*?)》', 'g');
  public static charactersRegex = new RegExp('＜(.*?)＞', 'g')

  constructor(card: HTMLElement) {
    this.details = this.getCardDetail(card);
  }

  parseAvailableInTournaments(): string | undefined {
    if (!this.details.bottom) {
      throw new Error('ParseError: AvailableInTournaments. ' + this.parseNumber());
    }
    return this.details.bottom.querySelector('.availableDateCol dd')?.text;
  }

  parseColor(): Color[] {
    if (!this.details.right) {
      throw new Error('ParseError: Color. ' + this.parseNumber());
    }
    return this.getColors(this.details.right.querySelector('.colorCol dd')?.text.split('/') || []);
  }

  parseImage(): string {
    if (!this.details.left) {
      throw new Error('ParseError: Image. ' + this.parseNumber());
    }
    const src = this.details.left.querySelector('.cardimg img')?.getAttribute('src');
    if (!src) {
      throw new Error('ParseError: Image src undefined. ' + this.parseNumber());
    }
    return DBS_BASE_URL + src.split('../..')[1];
  }

  parseName(): string | undefined {
    if (!this.details.details) {
      throw new Error('ParseError: Name. ' + this.parseNumber());
    }
    return this.details.details.querySelector('.cardName')?.text
  }

  parseNumber(): string | undefined {
    if (!this.details.details) {
      throw new Error('ParseError: Number');
    }
    return this.details.details.querySelector('.cardNumber')?.text
  }

  parseRarity(): string | undefined {
    if (!this.details.left) {
      throw new Error('ParseError: Rarity. ' + this.parseNumber());
    }
    return this.details.left.querySelector('.rarityCol dd')?.text;
  }

  parseSeries(): string | undefined {
    if (!this.details.left) {
      throw new Error('ParseError: Series. ' + this.parseNumber());
    }
    return this.details.left.querySelector('.seriesCol dd')?.text;
  }

  parseType(): CardType | undefined {
    if (!this.details.right) {
      throw new Error('ParseError: Type. ' + this.parseNumber());
    }
    return this.details.right.querySelector('.typeCol dd')?.text as CardType;

  }

  parseEra(): string | undefined {
    if (!this.details.right) {
      throw new Error('ParseError: Era. ' + this.parseNumber());
    }
    return this.details.right.querySelector('.eraCol dd')?.text;
  }

  parseCharacter(): string | undefined {
    if (!this.details.right) {
      throw new Error('ParseError: Character. ' + this.parseNumber());
    }
    return this.details.right.querySelector('.characterCol dd')?.text;
  }

  parseComboEnergy(): string | undefined {
    if (!this.details.right) {
      throw new Error('ParseError: ComboEnergy. ' + this.parseNumber());
    }
    return this.details.right.querySelector('.comboEnergyCol dd')?.text;
  }

  parseComboPower(): string | undefined {
    if (!this.details.right) {
      throw new Error('ParseError: ComboPower. ' + this.parseNumber());
    }
    return this.details.right.querySelector('.comboPowerCol dd')?.text;
  }

  parsePower(): string | undefined {
    if (!this.details.right) {
      throw new Error('ParseError: ComboPower. ' + this.parseNumber());
    }
    return this.details.right.querySelector('.powerCol dd')?.text;
  }

  parseSpecialTrait(): string[] | undefined {
    if (!this.details.right) {
      throw new Error('ParseError: ComboPower. ' + this.parseNumber());
    }
    return this.details.right.querySelector('.specialTraitCol dd')?.text.split('/');
  }

  parseSkill(): Skill {
    if (!this.details.right) {
      throw new Error('ParseError: Skill. ' + this.parseNumber());
    }
    const skill = this.details.right.querySelector('.skillCol dd');
    if (!skill) {
      throw new Error('ParseError: Skill not found. ' + this.parseNumber());
    }
    return this.getSkill(skill);
  }

  parseEnergy(): Energy {
    if (!this.details.right) {
      throw new Error('ParseError: Skill. ' + this.parseNumber());
    }
    const energy = this.details.right.querySelector('.energyCol dd');
    const all = _.toNumber(energy?.text.split('(')[0]);
    let red = 0;
    let blue = 0;
    let green = 0;
    let yellow = 0;
    let black = 0;
    const colorCost = energy?.querySelectorAll('img') || [];

    if(colorCost.length) {
      red = this.countColorCost(Color.RED, colorCost);
      blue = this.countColorCost(Color.BLUE, colorCost);
      green = this.countColorCost(Color.GREEN, colorCost);
      yellow = this.countColorCost(Color.YELLOW, colorCost);
      black = this.countColorCost(Color.BLACK, colorCost);
    }

    return {
      unspecified: all - red - blue - green - yellow,
      red: red,
      blue: blue,
      green: green,
      yellow: yellow,
      black: black
    }
  }

  private getCardDetail(card: HTMLElement): Partial<CardDetail> {
    const details = card.querySelector('.cardListCol');
    const left = details?.querySelector('.leftCol');
    const right = details?.querySelector('.rightCol');
    const bottom = details?.querySelector('.bottomCol');
    const back = card?.querySelector('.cardBack');

    return {
      details,
      left,
      right,
      bottom,
      back
    }
  }

  private getColors = (colors: string[]): Color[] => {
    colors.forEach((color, index) => {
      if (color.toUpperCase() === 'GREENYELLOW') {
        colors[index] = Color.GREEN;
        colors.push(Color.YELLOW);
      }
    });
    return colors.map((color) => {
      if(Color[color.toUpperCase() as keyof typeof Color]) {
        return Color[color.toUpperCase() as keyof typeof Color]
      } else {
        throw new Error('Unexpected color: ' + color.toUpperCase() +'. ' + this.parseNumber())
      }
    })
  };

  private countColorCost = (color: string, colorCost: HTMLElement[]): number => {
    return colorCost.filter(cost => {
      return cost?.getAttribute('src')?.search(color.toLowerCase() + '_ball') !== -1;
    }).length
  }

  private getSkill = (skill: HTMLElement): Skill => {
    const skillImgs = skill.querySelectorAll('.skillText');
    const skills = _.uniq(skillImgs.map(img => img.getAttribute('alt') as string));
    const charactersMatchArray = skill.toString().match(CardParser.charactersRegex);
    const characters: string[] = _.uniq(_.map(charactersMatchArray, match => match.slice(1, -1).replace('＜', '')))// Replace is needed because in some cases data is wrongly formatted
    const specialTraitsMatchArray = skill.toString().match(CardParser.specialTraitsRegex);
    const specialTraits: string[] = _.uniq(_.map(specialTraitsMatchArray, match => match.slice(1, -1)))
    return {
      specialTraits: specialTraits,
      characters: characters,
      keywords: skills,
      text: skill.innerHTML
    }
  };
}
