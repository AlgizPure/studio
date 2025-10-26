import type { UserProfile, Day } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (hint: string) => PlaceHolderImages.find(img => img.imageHint.includes(hint))?.imageUrl || 'https://picsum.photos/seed/default/600/400';

export const userProfile: UserProfile = {
  name: 'Alex',
  email: 'alex.sum@example.com',
  avatarUrl: findImage('profile'),
};

export const weeklySchedule: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
