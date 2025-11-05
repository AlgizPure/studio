import data from './placeholder-images.json';

/**
 * @fileoverview Экспортирует массив данных-заполнителей для изображений.
 */

/**
 * @typedef {object} ImagePlaceholder
 * Тип для данных-заполнителей изображения.
 * @property {string} id - Уникальный идентификатор.
 * @property {string} description - Описание изображения.
 * @property {string} imageUrl - URL изображения.
 * @property {string} imageHint - Подсказка для изображения.
 */
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

/**
 * Массив данных-заполнителей для изображений.
 * @type {ImagePlaceholder[]}
 */
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
