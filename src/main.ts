import fetch, {BodyInit} from 'node-fetch';
import {HTMLElement, parse} from "node-html-parser";
import {CardParser} from "./classes/parser.class";
import * as fs from "fs";
import {CardType} from "./types/card-type.type";
import {LeaderCard} from "./classes/leader-card.class";
import {ExtraCard} from "./classes/extra-card.class";
import {BattleCard} from "./classes/battle-card.class";
import {UnisonCard} from "./classes/unison-card.class";
import {ImageDownloader} from "./classes/image-downloader.class";
import {DbsCard} from "./types/card.interface";
import {Seller} from "./types/seller.type";
import {Cardmarket} from "./classes/cardmarket.class";
import _ from "lodash";
import {formatSkills} from "./utils/skill-formatter.util";

export const DBS_BASE_URL = 'http://www.dbs-cardgame.com';
export const CARDMARKET_BASE_URL = 'https://www.cardmarket.com';

export const CARD_JSON_PATH = 'cards.json';
export const FORMATTED_CARD_JSON_PATH = 'cards_formatted.json';
export const CARDMARKET_JSON_PATH = 'cardmarket.json';

const shouldDownloadCards = false;
const shouldDownloadImages = false;
const shouldFormatCardSkills = true;
const shouldGetPrices = false;

const categories: number[] = [
  428016,
  428015,
  428014,
  428013,
  428012,
  428011,
  428010,
  428009,
  428008,
  428007,
  428006,
  428005,
  428004,
  428003,
  428002,
  428001,
  428103,
  428102,
  428101,
  428201,
  428316,
  428315,
  428314,
  428313,
  428312,
  428311,
  428310,
  428309,
  428308,
  428307,
  428306,
  428305,
  428304,
  428303,
  428302,
  428301,
  428603,
  428602,
  428601,
  428503,
  428502,
  428501,
  428418,
  428417,
  428415,
  428414,
  428412,
  428411,
  428410,
  428409,
  428408,
  428407,
  428419,
  428413,
  428406,
  428405,
  428404,
  428403,
  428416,
  428402,
  428401,
  428901,
]

const calculateProgress = (i: number, numberOfItems: number): number => {
  return Math.round((100 / numberOfItems) * i)
}
const createForm = (category: number): URLSearchParams  => {
  const formData = new URLSearchParams();
  formData.append('category_exp', category.toString());
  return formData;
};


const getPage = async (form: URLSearchParams): Promise<HTMLElement> => {
  const response = await fetch(DBS_BASE_URL +'/us-en/cardlist/?search=true', {method: 'POST', body: form as BodyInit});
  const data = await response.text();
  return parse(data)
};

const getPricePageRedirect = async (cardNumber: string): Promise<string> => {
  const response = await fetch(CARDMARKET_BASE_URL +'/en/DragonBallSuper/Products/Search?searchString=' + cardNumber, {
    method: 'GET',
  });
  return response.url;
};

const getSellers = async (url: string): Promise<Partial<Seller>[]> => {
  let data = '';
  if(url.search('cardNumber') === -1) {
    const redirectResponse = await fetch(url, {method: 'GET'});
    data = await redirectResponse.text();
  }
  const html = parse(data)
  return html?.querySelectorAll('.table-body>.row').map((element) => {
    return {
      name: element?.querySelector('.col-sellerProductInfo .seller-name span.d-flex.has-content-centered.mr-1 a')?.text,
      price: element?.querySelector('.col-offer .price-container')?.text,
      amount: element?.querySelector('.col-offer .amount-container')?.text,
    }
  });
};

const storeCards = (data: DbsCard[], path: string) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 4))
  } catch (err) {
    console.error(err)
  }
}

const storeCardmarketSellers = (data: Cardmarket[], path: string) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 4))
  } catch (err) {
    console.error(err)
  }
}

const loadStoredCards = (path: string): string => {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(err)
    throw new Error('File cannot be loaded')
  }
}

async function loadPage(form: URLSearchParams): Promise<(LeaderCard|ExtraCard|BattleCard|UnisonCard)[]> {
  const html = await getPage(form);
  const cards = html.querySelector('#cardlist')
    ?.querySelector('#wrapper')
    ?.querySelector('#container')
    ?.querySelector('div.innerCol')
    ?.querySelector('section')
    ?.querySelector('#listCol')
    ?.querySelector('ul.list-inner')
    ?.querySelectorAll('li') || [];
  return cards.map(card => {
    const parser = new CardParser(card);
    const type = parser.parseType();
    switch(type) {
      case CardType.LEADER:
        return new LeaderCard(parser)
      case CardType.BATTLE:
        return new BattleCard(parser)
      case CardType.EXTRA:
        return new ExtraCard(parser)
      case CardType.UNISON:
        return new UnisonCard(parser)
      default:
        throw new Error('Unknown card type: ' + type)
    }
  });
}

async function loadPricePage(cardNumber: string): Promise<Cardmarket> {
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
  const url = await getPricePageRedirect(cardNumber);
  const sellers = await getSellers(url);

  return new Cardmarket(sellers, url, cardNumber, new Date().toISOString());
}

async function downloadCards() {
  const cards: DbsCard[] = [];
  for (let i = 0; i < categories.length; i++){
    const category = categories[i];
    const form = createForm(category);
    cards.push(...(await loadPage(form)));
    console.log('progress: 100/' + calculateProgress(i, categories.length));
  }
  storeCards(cards, CARD_JSON_PATH)
}

async function formatCardSkills() {
  const loadedCardsRaw: string = loadStoredCards(CARD_JSON_PATH);
  const loadedCards: DbsCard[] = JSON.parse(loadedCardsRaw);
  storeCards(formatSkills(loadedCards), FORMATTED_CARD_JSON_PATH)
}

async function downloadImages() {
  const loadedCards: DbsCard[] = JSON.parse(loadStoredCards(CARD_JSON_PATH));
  const images: ImageDownloader[] = [];
  loadedCards.forEach(card => {
    images.push(new ImageDownloader(card.image as string, card.number as string));
    if('cardBack' in card && card?.cardBack?.image){
      images.push(new ImageDownloader(card.cardBack.image as string, card.cardBack.number as string + '_b'));
    }
  });
  for (const image of images) {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    })
    await image.download();
  }
}

async function downloadCardmarketPrices() {
  const loadedCards: DbsCard[] = JSON.parse(loadStoredCards(CARD_JSON_PATH));
  const loadedSellers: Cardmarket[] = JSON.parse(loadStoredCards(CARDMARKET_JSON_PATH));
  const cardNumbers: string[] = _.uniq(loadedCards.map(card => card.number?.split('_')[0] as string));
  for (const cardNumber of cardNumbers) {
    const cardmarket = loadedSellers.find(cardmarket => cardmarket.cardNumber === cardNumber);
    const cardmarketIndex = loadedSellers.findIndex(cardmarket => cardmarket.cardNumber === cardNumber);
    if(cardmarket?.sellers === undefined || cardmarket.sellers?.length === 0) {
      const parsedCardmarket = await loadPricePage(cardNumber);
      if(cardmarketIndex !== -1) {
        loadedSellers[cardmarketIndex] = parsedCardmarket;
      } else {
        loadedSellers.push(parsedCardmarket);
      }
      console.log(cardNumber, 'Nb.of.S: ' + parsedCardmarket?.sellers?.length);
      storeCardmarketSellers(loadedSellers, CARDMARKET_JSON_PATH)
    }
  }
}


export async function main(): Promise<void> {
  if(shouldDownloadCards) {
    await downloadCards()
  }

  if(shouldFormatCardSkills) {
    await formatCardSkills()
  }

  if(shouldDownloadImages) {
    await downloadImages()
  }
  if(shouldGetPrices) {
    await downloadCardmarketPrices()
  }
}

