import type { Recipe } from './agents';

export type RootTabParamList = {
  Home: undefined;
  Pantry: undefined;
  Chat: { initialPrompt?: string } | undefined;
  Shopping: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  RecipeDetail: { recipe: Recipe };
};
