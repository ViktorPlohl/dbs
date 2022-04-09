import {DbsCard, ILeaderCard} from "../types/card.interface";
import {parse} from "node-html-parser";
import _ from "lodash";
import {RawAttributes} from "node-html-parser/dist/nodes/html";
import {LeaderCard} from "../classes/leader-card.class";

type SkillImg = {
  image: string,
  model: RawAttributes
}

function formatSpecialTraits(card: DbsCard | Partial<LeaderCard>) {
  if (card.skill?.text && card.skill.specialTraits) {
    card.skill.specialTraits.forEach(specialTrait => {
      const regex = new RegExp('《(' + specialTrait + ')》', 'g');
      const replaceText = '《<span class="special-trait ' + _.kebabCase(specialTrait) + '">' + specialTrait + '</span>》';
      if (card.skill?.text) {
        card.skill.text = _.replace(card.skill.text, regex, replaceText);
      }
    })
  }
}

function formatCharacters(card: DbsCard) {
  if (card.skill?.text && card.skill.characters) {
    card.skill.characters.forEach(character => {
      const regex = new RegExp('＜(' + character + ')＞', 'g')
      const replaceText = '&#60;<span class="character ' + _.kebabCase(character) + '">' + character + '</span>&#62;'
      if (card.skill?.text) {
        card.skill.text = _.replace(card.skill.text, regex, replaceText);
      }
    })
  }
}

function getImageReplaceString(isBallSkill: boolean, skill: SkillImg) {
  if (isBallSkill) {
    return '<span class="' + skill.model.class + '">' + skill.model.alt + '</span>'
  } else {
    const cssClass = _.kebabCase(skill.model.alt.replace('UNISON -', 'UNISON MINUS ').replace('UNISON +', 'UNISON PLUS ').toLowerCase())
    return '<span class="' + skill.model.class + ' ' + cssClass + '">' + skill.model.alt + '</span>'
  }
}

function replaceImageSkillsWithText(card: DbsCard, skill: SkillImg) {
  const searchString = _.replace(skill.image,new RegExp('"',"g"),'\\"');
  console.log(searchString);
  const isBallSkill = skill.model.class.includes('skillTextBall');
  const replaceString = getImageReplaceString(isBallSkill, skill);
  console.log(replaceString);
  if(card.skill?.text) {
    card.skill.text = _.replace(card.skill.text, new RegExp(searchString,"g"), replaceString);
  }
}

function extractSkillFromText(card: DbsCard, skills: SkillImg[]) {
  const images = parse(card.skill?.text as string).querySelectorAll('img');
  images.forEach(image => {
    const imgHtmlText = image.toString();
    const model = image.rawAttributes;
    if (model.class === 'skillText') {
      skills.push({
        image: imgHtmlText,
        model: model
      })
    } else if (model.class === 'skillTextBall') {
      const ballClass = _.replace(imgHtmlText, '<img src="../../images/cardlist/common/', '');
      model.class = model.class + ' ' + _.split(ballClass, '.png')[0];
      model.alt = '●';
      skills.push({
        image: imgHtmlText,
        model: model
      })
    } else if (model.class === 'skillText unisonText') {
      console.log('here', imgHtmlText, model)
      skills.push({
        image: imgHtmlText,
        model: model
      })
    } else {
      throw new Error('ParseError: [' + card.number + '] Unknown skill text class. ' + model.class);
    }
  })
}

export function formatSkills(cards: DbsCard[]): DbsCard[] {
  const skills: SkillImg[] = [];
  cards.forEach(card => extractSkillFromText(card, skills));
  cards.forEach(card => {
    _.uniqBy(skills, 'image').forEach((skill) => replaceImageSkillsWithText(card, skill));
    formatSpecialTraits(card);
    formatCharacters(card);
    if((card as ILeaderCard).cardBack) {
      _.uniqBy(skills, 'image').forEach((skill) => replaceImageSkillsWithText((card as ILeaderCard).cardBack, skill));
      formatSpecialTraits((card as ILeaderCard).cardBack);
      formatCharacters((card as ILeaderCard).cardBack);
    }
  })
  return cards;
}
