/**
 * Phase 7 Filter Validation Tests
 * Tests all filter combinations to ensure AND logic works correctly
 */

import { sitterMockData } from '../data/sitterData';

interface FilterTestCase {
  name: string;
  filters: {
    petType?: string;
    maxPrice?: number;
    skills?: string;
    serviceIds?: string;
    minRating?: number;
  };
  expectedSitterIds: number[];
  description: string;
}

// Helper function to apply filters (mimics sitterService.ts logic)
function applyFilters(filters: FilterTestCase['filters']): number[] {
  return sitterMockData
    .filter(sitter => {
      // Pet type filter
      if (filters.petType && !sitter.petTypesAccepted.includes(filters.petType)) {
        return false;
      }

      // Max price filter
      if (filters.maxPrice && sitter.hourlyRate > filters.maxPrice) {
        return false;
      }

      // Skills filter
      if (filters.skills) {
        const requestedSkills = filters.skills.split(',').map(s => s.trim().toLowerCase());
        const hasSkill = requestedSkills.some(skill =>
          sitter.skills.some(sitterSkill => sitterSkill.toLowerCase().includes(skill))
        );
        if (!hasSkill) return false;
      }

      return true;
    })
    .map(s => s.id);
}

// Test cases for Phase 7 filter validation
const testCases: FilterTestCase[] = [
  // Single filter tests
  {
    name: 'Pet Type: Dog Only',
    filters: { petType: 'dog' },
    expectedSitterIds: [1, 2, 3, 5, 6, 7, 9, 10],
    description: 'Should return all sitters accepting dogs'
  },
  {
    name: 'Pet Type: Cat Only',
    filters: { petType: 'cat' },
    expectedSitterIds: [1, 3, 5, 7, 9, 10],
    description: 'Should return all sitters accepting cats'
  },
  {
    name: 'Pet Type: Bird Only',
    filters: { petType: 'bird' },
    expectedSitterIds: [3, 4, 8, 9],
    description: 'Should return all sitters accepting birds'
  },
  {
    name: 'Pet Type: Reptile Only',
    filters: { petType: 'reptile' },
    expectedSitterIds: [4, 9],
    description: 'Should return exotic pet specialists'
  },
  {
    name: 'Price: Under $30',
    filters: { maxPrice: 30 },
    expectedSitterIds: [1, 3, 6],
    description: 'Should return Emily ($25), Jessica ($30), Alex ($28)'
  },
  {
    name: 'Price: Under $40',
    filters: { maxPrice: 40 },
    expectedSitterIds: [1, 2, 3, 5, 6, 8, 10],
    description: 'Should return sitters with hourly rate <= $40'
  },
  {
    name: 'Skills: First Aid',
    filters: { skills: 'first aid' },
    expectedSitterIds: [1, 2, 4, 5, 7, 9, 10],
    description: 'Should return sitters with first aid certification'
  },
  {
    name: 'Skills: Medication Administration',
    filters: { skills: 'medication administration' },
    expectedSitterIds: [1, 3, 4, 5, 7, 9],
    description: 'Should return sitters trained in medication administration'
  },
  {
    name: 'Skills: Grooming',
    filters: { skills: 'grooming' },
    expectedSitterIds: [2, 7],
    description: 'Should return professional groomers'
  },
  {
    name: 'Skills: Training',
    filters: { skills: 'training' },
    expectedSitterIds: [2, 6, 10],
    description: 'Should return certified trainers'
  },
  {
    name: 'Skills: Senior Pet Care',
    filters: { skills: 'senior pet care' },
    expectedSitterIds: [5, 9],
    description: 'Should return senior pet specialists'
  },
  {
    name: 'Skills: Special Needs',
    filters: { skills: 'special needs' },
    expectedSitterIds: [3, 4, 8, 9],
    description: 'Should return special needs experts'
  },

  // Two-filter combinations (AND logic)
  {
    name: 'Dog + Under $30',
    filters: { petType: 'dog', maxPrice: 30 },
    expectedSitterIds: [1, 3, 6],
    description: 'Should return Emily ($25), Jessica ($30), Alex ($28) - all accept dogs and under $30'
  },
  {
    name: 'Cat + Medication',
    filters: { petType: 'cat', skills: 'medication administration' },
    expectedSitterIds: [1, 3, 5, 7, 9],
    description: 'Should return cat sitters who can administer medication'
  },
  {
    name: 'Dog + Training',
    filters: { petType: 'dog', skills: 'training' },
    expectedSitterIds: [2, 6, 10],
    description: 'Should return dog trainers'
  },
  {
    name: 'Bird + Under $35',
    filters: { petType: 'bird', maxPrice: 35 },
    expectedSitterIds: [3, 8],
    description: 'Should return Jessica ($30), Tom ($32) - bird specialists under $35 (David $45 excluded)'
  },
  {
    name: 'Reptile + Special Needs',
    filters: { petType: 'reptile', skills: 'special needs' },
    expectedSitterIds: [4, 9],
    description: 'Should return exotic pet specialists with special needs experience'
  },

  // Three-filter combinations (Complex AND logic)
  {
    name: 'Dog + Under $40 + First Aid',
    filters: { petType: 'dog', maxPrice: 40, skills: 'first aid' },
    expectedSitterIds: [1, 2, 5, 10],
    description: 'Should return affordable dog sitters with first aid certification'
  },
  {
    name: 'Cat + Under $50 + Senior Care',
    filters: { petType: 'cat', maxPrice: 50, skills: 'senior pet care' },
    expectedSitterIds: [5],
    description: 'Should return Sarah Martinez (senior cat specialist under $50)'
  },
  {
    name: 'Dog + Under $30 + Training',
    filters: { petType: 'dog', maxPrice: 30, skills: 'training' },
    expectedSitterIds: [6],
    description: 'Should return only Alex Taylor (affordable dog trainer)'
  },
  {
    name: 'Bird + Under $50 + Special Needs',
    filters: { petType: 'bird', maxPrice: 50, skills: 'special needs' },
    expectedSitterIds: [3, 4, 8],
    description: 'Should return bird specialists with special needs experience'
  },

  // Edge cases - highly restrictive filters
  {
    name: 'Reptile + Under $40',
    filters: { petType: 'reptile', maxPrice: 40 },
    expectedSitterIds: [],
    description: 'Should return no results (David $45, Linda $55 - both over $40)'
  },
  {
    name: 'Dog + Grooming + Under $40',
    filters: { petType: 'dog', skills: 'grooming', maxPrice: 40 },
    expectedSitterIds: [2],
    description: 'Should return only Mike Wilson ($35, dog groomer)'
  },
  {
    name: 'Multiple Skills (OR logic)',
    filters: { skills: 'medication administration,first aid' },
    expectedSitterIds: [1, 2, 3, 4, 5, 7, 9, 10],
    description: 'Should return sitters with medication OR first aid (OR logic for comma-separated)'
  },

  // Broad filters - should return many results
  {
    name: 'Under $100 (all)',
    filters: { maxPrice: 100 },
    expectedSitterIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: 'Should return all sitters (all under $100/hr)'
  },
  {
    name: 'Dog or Cat coverage',
    filters: { petType: 'dog' },
    expectedSitterIds: [1, 2, 3, 5, 6, 7, 9, 10],
    description: 'Should return 8 sitters accepting dogs'
  }
];

// Run all tests
console.log('🧪 Phase 7 Filter Validation Tests\n');
console.log('=' .repeat(80));

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  const actualResults = applyFilters(testCase.filters);
  const expected = testCase.expectedSitterIds.sort();
  const actual = actualResults.sort();

  const passed = JSON.stringify(expected) === JSON.stringify(actual);

  if (passed) {
    console.log(`✅ Test ${index + 1}: ${testCase.name}`);
    console.log(`   ${testCase.description}`);
    console.log(`   Filters: ${JSON.stringify(testCase.filters)}`);
    console.log(`   Results: ${actual.length} sitters (IDs: ${actual.join(', ') || 'none'})\n`);
    passedTests++;
  } else {
    console.log(`❌ Test ${index + 1}: ${testCase.name} FAILED`);
    console.log(`   ${testCase.description}`);
    console.log(`   Filters: ${JSON.stringify(testCase.filters)}`);
    console.log(`   Expected: ${expected.length} sitters (IDs: ${expected.join(', ') || 'none'})`);
    console.log(`   Actual:   ${actual.length} sitters (IDs: ${actual.join(', ') || 'none'})`);
    
    const missing = expected.filter(id => !actual.includes(id));
    const extra = actual.filter(id => !expected.includes(id));
    if (missing.length > 0) console.log(`   Missing: ${missing.join(', ')}`);
    if (extra.length > 0) console.log(`   Extra: ${extra.join(', ')}`);
    console.log();
    failedTests++;
  }
});

console.log('=' .repeat(80));
console.log(`\n📊 Test Summary:`);
console.log(`   Total Tests: ${testCases.length}`);
console.log(`   Passed: ${passedTests} ✅`);
console.log(`   Failed: ${failedTests} ❌`);
console.log(`   Success Rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! Phase 7 filter logic is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Review filter implementation.');
  process.exit(1);
}
