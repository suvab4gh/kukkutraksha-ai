/**
 * Test script for Disease Prediction Service
 * Run: node test-prediction.js
 */

import diseasePredictionService from './services/diseasePredictionService.js';

console.log('🔮 Testing KukkutRaksha AI Disease Prediction Service\n');

// Test coordinates (Kolkata, West Bengal)
const latitude = 22.5726;
const longitude = 88.3639;

// Sample sensor data
const sensorData = {
  ammonia: 28,
  co2: 3500,
  temperature: 26,
  humidity: 65,
  tds: 450,
};

async function runTest() {
  try {
    console.log('📍 Location: Kolkata, West Bengal');
    console.log('🌡️  Current Sensor Data:', sensorData);
    console.log('\n⏳ Fetching 10-day weather forecast and generating prediction...\n');

    const result = await diseasePredictionService.generatePrediction(
      latitude,
      longitude,
      sensorData
    );

    if (!result.success) {
      console.error('❌ Prediction failed:', result.error);
      return;
    }

    const prediction = result.prediction;

    console.log('✅ Prediction Generated Successfully!\n');
    console.log('=' .repeat(60));
    console.log('📊 OVERALL RISK ASSESSMENT');
    console.log('=' .repeat(60));
    console.log(`Risk Level: ${prediction.overallRisk.level.toUpperCase()}`);
    console.log(`Risk Score: ${(prediction.overallRisk.score * 100).toFixed(1)}%`);
    console.log(`Description: ${prediction.overallRisk.description}\n`);

    console.log('=' .repeat(60));
    console.log('⚠️  HIGHEST RISK DAY');
    console.log('=' .repeat(60));
    console.log(`Date: ${prediction.highestRiskDay.date}`);
    console.log(`Risk Level: ${prediction.highestRiskDay.level.toUpperCase()}`);
    console.log(`Score: ${(prediction.highestRiskDay.score * 100).toFixed(1)}%\n`);

    console.log('=' .repeat(60));
    console.log('📅 NEXT 3 DAYS FORECAST');
    console.log('=' .repeat(60));
    
    prediction.dailyForecasts.slice(0, 3).forEach((day, index) => {
      const riskEmoji = {
        green: '🟢',
        yellow: '🟡',
        orange: '🟠',
        red: '🔴'
      }[day.riskLevel];
      
      console.log(`\nDay ${index + 1} (${day.date}):`);
      console.log(`  ${riskEmoji} Risk: ${day.riskLevel.toUpperCase()}`);
      console.log(`  🌡️  Temp: ${day.weather.minTemp}°C - ${day.weather.maxTemp}°C`);
      console.log(`  💧 Humidity: ${day.weather.humidity}%`);
      console.log(`  🌧️  Precipitation: ${day.weather.precipitation} mm`);
      
      if (day.recommendations.length > 0) {
        console.log(`  💡 Recommendations:`);
        day.recommendations.slice(0, 2).forEach(rec => {
          console.log(`     - ${rec}`);
        });
      }
    });

    console.log('\n' + '=' .repeat(60));
    console.log('📈 10-DAY SUMMARY');
    console.log('=' .repeat(60));
    console.log(`🟢 Safe Days: ${prediction.summary.safeDays}`);
    console.log(`🟡 Warning Days: ${prediction.summary.warningDays}`);
    console.log(`🟠 High Risk Days: ${prediction.summary.highRiskDays}`);
    console.log(`🔴 Critical Days: ${prediction.summary.criticalDays}`);
    console.log(`📉 Trend: ${prediction.summary.trend.toUpperCase()}`);

    if (prediction.summary.highRiskDiseases.length > 0) {
      console.log('\n⚠️  High-Risk Diseases Detected:');
      prediction.summary.highRiskDiseases.forEach(disease => {
        console.log(`   - ${disease.disease}: ${disease.days} days`);
      });
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Test completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  }
}

runTest();
