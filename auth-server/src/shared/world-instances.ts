export const WorldRegionName = {
  MainCity: 'main_city',
  Forest: 'forest',
};

export const WorldInstanceName = {
  MainCityA: WorldRegionName.MainCity + '_a',
  MainCityB: WorldRegionName.MainCity + '_b',
  ForestA: WorldRegionName.Forest + '_a',
  ForestB: WorldRegionName.Forest + '_b',
};

export const WorldInstancePath = {
  MainCity: {
    MainCityA: WorldRegionName.MainCity + '/' + WorldInstanceName.MainCityA,
    MainCityB: WorldRegionName.MainCity + '/' + WorldInstanceName.MainCityB,
  },
  Forest: {
    ForestA: WorldRegionName.Forest + '/' + WorldInstanceName.ForestA,
    ForestB: WorldRegionName.Forest + '/' + WorldInstanceName.ForestB,
  },
};

