import {Seller} from "./seller.type";

export interface ICardmarket {
  sellers: Partial<Seller>[];
  url: string;
  cardNumber: string;
  lastUpdateDate: string;
}
