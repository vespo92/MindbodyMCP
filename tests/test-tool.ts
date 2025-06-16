// Test script to verify the teacher schedule tool works
import dotenv from 'dotenv';
import { getTeacherScheduleTool } from '../src/tools/teacherSchedule';

// Load environment variables
dotenv.config();

async function test() {
  console.log('Testing Mindbody MCP Server...\n');

  try {
    // Test 1: Get schedule for a specific teacher
    console.log('Test 1: Getting schedule for "Alexia Bauer"...');
    const result = await getTeacherScheduleTool('Alexia Bauer');
    
    console.log('\nResults:');
    console.log(`Teacher: ${result.teacher.name} (ID: ${result.teacher.id})`);
    console.log(`Date Range: ${result.dateRange.start} to ${result.dateRange.end}`);
    console.log(`Total Classes: ${result.totalClasses}`);
    
    console.log('\nSchedule:');
    result.classes.forEach(cls => {
      console.log(`- ${cls.name} at ${cls.location}`);
      console.log(`  ${cls.startTime} (${cls.duration} min)`);
      console.log(`  Spots: ${cls.spotsAvailable}/${cls.totalSpots}`);
      if (cls.isCanceled) console.log('  ⚠️ CANCELED');
      if (cls.isSubstitute) console.log('  👤 SUBSTITUTE');
      console.log();
    });

    console.log('\nSummary:');
    console.log('By Day:', result.summary.byDay);
    console.log('By Location:', result.summary.byLocation);
    console.log('By Class Type:', result.summary.byClassType);

  } catch (error: any) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the test
test().catch(console.error);
