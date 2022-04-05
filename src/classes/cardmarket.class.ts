import {ICardmarket} from "../types/cardmarket-card.interface";
import {Seller} from "../types/seller.type";

export class Cardmarket implements Partial<ICardmarket> {
  sellers: Partial<Seller>[];
  url: string;
  cardNumber: string;
  lastUpdateDate: string;

  constructor(sellers: Partial<Seller>[], url: string, cardNumber: string, lastUpdateDate: string) {
    this.cardNumber = cardNumber;
    this.sellers = sellers;
    this.url = url;
    this.lastUpdateDate = lastUpdateDate;
  }
}
