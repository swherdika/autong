/**
 * The Autong calc engine — pure, framework-agnostic budget math.
 *
 * Nothing here imports React or touches I/O, so the whole engine is portable to
 * React Native / desktop untouched, and every function is directly unit-testable.
 */
export { daysInMonth, occurrences } from './occurrences';
export { itemNeed, componentTotal, monthlyTotal, remaining } from './totals';
