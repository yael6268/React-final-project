import Category from '../models/Category.ts';

const DEFAULT_CATEGORIES = ['מזון', 'מגורים', 'תחבורה', 'פנאי', 'בריאות', 'חשבונות'];

export const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      await Promise.all(DEFAULT_CATEGORIES.map(name => new Category({ name }).save()));
      console.log('Seeded default categories');
    } else {
      console.log('Categories already seeded');
    }
  } catch (err) {
    console.error('Failed to seed categories', err);
  }
};
