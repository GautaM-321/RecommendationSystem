interface User {
  userId: number;
  userName: string;
  userPassword: string;
  roleId: number;
  formFilledStatus: boolean;
}
interface Review {
  itemid: number;
  userid: number;
  rating: string;
  comment: string;
  date: Date;
}
interface LoginPayload {
  name: string;
  password: string;
}

interface MenuItemPayload {
  id?: number;
  name: string;
  price: number;
  availability: boolean;
  mealTypeId: number;
}

interface FeedbackPayload {
  itemId: number;
  comment: string;
  rating: number;
}
