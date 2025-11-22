import { FilterConfig, FilterType } from './types';

export const FILTERS: Record<FilterType, FilterConfig> = {
  [FilterType.NORMAL]: {
    name: FilterType.NORMAL,
    class: '',
    cssFilter: 'none'
  },
  [FilterType.VINTAGE]: {
    name: FilterType.VINTAGE,
    class: 'sepia-[.6] contrast-[1.1] brightness-90 saturate-[.8]',
    cssFilter: 'sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)'
  },
  [FilterType.BW]: {
    name: FilterType.BW,
    class: 'grayscale contrast-[1.2] brightness-110',
    cssFilter: 'grayscale(1) contrast(1.2) brightness(1.1)'
  },
  [FilterType.COOL]: {
    name: FilterType.COOL,
    class: 'hue-rotate-[15deg] contrast-[1.1] saturate-[0.8]',
    cssFilter: 'hue-rotate(15deg) contrast(1.1) saturate(0.8)'
  },
  [FilterType.WARM]: {
    name: FilterType.WARM,
    class: 'sepia-[.3] hue-rotate-[-15deg] saturate-[1.2]',
    cssFilter: 'sepia(0.3) hue-rotate(-15deg) saturate(1.2)'
  },
  [FilterType.FADED]: {
    name: FilterType.FADED,
    class: 'brightness-[1.1] saturate-[0.6] contrast-[0.9]',
    cssFilter: 'brightness(1.1) saturate(0.6) contrast(0.9)'
  },
  [FilterType.DRAMATIC]: {
    name: FilterType.DRAMATIC,
    class: 'contrast-[1.3] saturate-[1.2] brightness-[0.9]',
    cssFilter: 'contrast(1.3) saturate(1.2) brightness(0.9)'
  }
};
