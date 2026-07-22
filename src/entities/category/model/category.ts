export const CATEGORY_IDS = ['casual', 'fashion', 'goods', 'home', 'digital'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  name: string;
};
