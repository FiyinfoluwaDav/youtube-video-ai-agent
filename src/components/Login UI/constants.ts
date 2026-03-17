import { BlobSpec } from './types'

export const blobs: BlobSpec[] = [
  {
    kind: 'main',
    color: '#FF6B00',
    width: 250,
    height: 325,
    left: '51%',
    eyeY: 153,
    eyeGap: 56,
    eyeRx: 13,
    enterDelay: 0.0,
    zIndex: 10,
    bounceDelay: 0.1,
  },
  {
    kind: 'topRoundRect',
    color: '#D500F9',
    width: 250,
    height: 538,
    left: '29%',
    eyeY: 88,
    eyeGap: 28,
    eyeRx: 9,
    enterDelay: 0.2,
    zIndex: 1,
    bounceDelay: 0.0,
  },
  {
    kind: 'semicircle',
    color: '#FF4500',
    width: 250,
    height: 250,
    left: '20%',
    eyeY: 175,
    eyeGap: 28,
    eyeRx: 9,
    enterDelay: 0.3,
    zIndex: 50,
    bounceDelay: 0.2,
  },
]

export const BASELINE = -10
