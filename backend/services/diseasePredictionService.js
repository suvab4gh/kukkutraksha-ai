import axios from 'axios';

/**
 * Disease Prediction Service
 * Uses Open-Meteo API (free, open-source weather forecast API)
 * Predicts disease risk for the next 10 days based on:
 * - Weather forecasts (temperature, humidity, precipitation)
 * - Historical sensor data patterns
 * - Environmental stress factors
 */

class DiseasePredictionService {
  constructor() {
    // Open-Meteo API base URL (no API key required - free and open source)
    this.weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';
    
    // Disease risk thresholds based on research
    this.diseaseThresholds = {
      // Newcastle Disease: spreads in cool, humid conditions
      newcastle: {
        tempRange: [15, 25],
        humidityMin: 70,
        riskFactor: 0.3,
      },
      // Avian Influenza: spreads in cold, dry conditions
      avianInfluenza: {
        tempRange: [5, 20],
        humidityMax: 50,
        riskFactor: 0.35,
      },
      // Bronchitis: spreads in temperature fluctuations
      bronchitis: {
        tempFluctuation: 10, // °C difference
        humidityRange: [60, 80],
        riskFactor: 0.25,
      },
      // Coccidiosis: spreads in warm, humid conditions
      coccidiosis: {
        tempRange: [25, 35],
        humidityMin: 75,
        riskFactor: 0.4,
      },
      // Heat Stress: high temperature
      heatStress: {
        tempMax: 30,
        humidityMin: 60,
        riskFactor: 0.45,
      },
      // Respiratory Issues: ammonia + poor ventilation conditions
      respiratory: {
        tempRange: [10, 20],
        humidityMax: 50,
        riskFactor: 0.3,
      },
    };
  }

  /**
   * Get 10-day weather forecast for a location
   * @param {number} latitude - Farm latitude
   * @param {number} longitude - Farm longitude
   * @returns {Promise<Object>} Weather forecast data
   */
  async getWeatherForecast(latitude, longitude) {
    try {
      const params = {
        latitude,
        longitude,
        hourly: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_sum,weather_code_max',
        timezone: 'auto',
        forecast_days: 10,
      };

      const response = await axios.get(this.weatherApiUrl, { params });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching weather forecast:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate daily disease risk score
   * @param {Object} dayData - Daily weather data
   * @param {Object} currentSensorData - Current farm sensor readings
   * @returns {Object} Risk assessment for the day
   */
  calculateDailyRisk(dayData, currentSensorData = {}) {
    const risks = {};
    let totalRiskScore = 0;
    const maxTemp = dayData.temperature_2m_max;
    const minTemp = dayData.temperature_2m_min;
    const avgTemp = (maxTemp + minTemp) / 2;
    const humidity = dayData.relative_humidity_2m_mean;
    const precipitation = dayData.precipitation_sum;
    const tempFluctuation = maxTemp - minTemp;

    // Newcastle Disease Risk
    if (avgTemp >= this.diseaseThresholds.newcastle.tempRange[0] && 
        avgTemp <= this.diseaseThresholds.newcastle.tempRange[1] &&
        humidity >= this.diseaseThresholds.newcastle.humidityMin) {
      risks.newcastle = {
        risk: 'high',
        score: this.diseaseThresholds.newcastle.riskFactor,
        conditions: `Temp: ${avgTemp.toFixed(1)}°C, Humidity: ${humidity}%`,
      };
      totalRiskScore += this.diseaseThresholds.newcastle.riskFactor;
    } else if (avgTemp >= 10 && avgTemp <= 30) {
      risks.newcastle = {
        risk: 'moderate',
        score: this.diseaseThresholds.newcastle.riskFactor * 0.5,
        conditions: `Temp: ${avgTemp.toFixed(1)}°C`,
      };
      totalRiskScore += this.diseaseThresholds.newcastle.riskFactor * 0.5;
    }

    // Avian Influenza Risk
    if (avgTemp >= this.diseaseThresholds.avianInfluenza.tempRange[0] && 
        avgTemp <= this.diseaseThresholds.avianInfluenza.tempRange[1] &&
        humidity <= this.diseaseThresholds.avianInfluenza.humidityMax) {
      risks.avianInfluenza = {
        risk: 'high',
        score: this.diseaseThresholds.avianInfluenza.riskFactor,
        conditions: `Temp: ${avgTemp.toFixed(1)}°C, Low Humidity: ${humidity}%`,
      };
      totalRiskScore += this.diseaseThresholds.avianInfluenza.riskFactor;
    }

    // Bronchitis Risk (temperature fluctuation)
    if (tempFluctuation >= this.diseaseThresholds.bronchitis.tempFluctuation) {
      risks.bronchitis = {
        risk: 'high',
        score: this.diseaseThresholds.bronchitis.riskFactor,
        conditions: `Temp Fluctuation: ${tempFluctuation.toFixed(1)}°C`,
      };
      totalRiskScore += this.diseaseThresholds.bronchitis.riskFactor;
    }

    // Coccidiosis Risk
    if (avgTemp >= this.diseaseThresholds.coccidiosis.tempRange[0] && 
        avgTemp <= this.diseaseThresholds.coccidiosis.tempRange[1] &&
        humidity >= this.diseaseThresholds.coccidiosis.humidityMin) {
      risks.coccidiosis = {
        risk: 'high',
        score: this.diseaseThresholds.coccidiosis.riskFactor,
        conditions: `Warm & Humid: ${avgTemp.toFixed(1)}°C, ${humidity}%`,
      };
      totalRiskScore += this.diseaseThresholds.coccidiosis.riskFactor;
    }

    // Heat Stress Risk
    if (maxTemp >= this.diseaseThresholds.heatStress.tempMax) {
      const heatRisk = Math.min(1, (maxTemp - 30) / 10) * this.diseaseThresholds.heatStress.riskFactor;
      risks.heatStress = {
        risk: heatRisk > 0.3 ? 'high' : 'moderate',
        score: heatRisk,
        conditions: `High Temp: ${maxTemp.toFixed(1)}°C`,
      };
      totalRiskScore += heatRisk;
    }

    // Precipitation factor (increases humidity-related risks)
    if (precipitation > 10) {
      totalRiskScore *= 1.1; // 10% increase in risk
    }

    // Factor in current sensor data if available
    if (currentSensorData.ammonia && currentSensorData.ammonia > 25) {
      totalRiskScore *= 1.15; // High ammonia increases respiratory risks
      risks.respiratory = {
        risk: currentSensorData.ammonia > 40 ? 'high' : 'moderate',
        score: 0.2,
        conditions: `High Ammonia: ${currentSensorData.ammonia} ppm`,
      };
    }

    // Normalize risk score (0-1 scale)
    const normalizedRisk = Math.min(1, totalRiskScore);

    return {
      risks,
      totalScore: normalizedRisk,
      riskLevel: this.getRiskLevel(normalizedRisk),
      recommendations: this.getRecommendations(risks, dayData),
    };
  }

  /**
   * Get risk level label based on score
   */
  getRiskLevel(score) {
    if (score >= 0.7) return 'red';      // Critical Alert
    if (score >= 0.5) return 'orange';   // High Risk
    if (score >= 0.3) return 'yellow';   // Warning
    return 'green';                       // Safe
  }

  /**
   * Generate recommendations based on risks
   */
  getRecommendations(risks, dayData) {
    const recommendations = [];

    if (risks.heatStress) {
      recommendations.push('Increase ventilation and provide cool water');
      recommendations.push('Consider installing foggers or misters');
    }

    if (risks.newcastle || risks.avianInfluenza) {
      recommendations.push('Maintain strict biosecurity measures');
      recommendations.push('Limit visitor access to the farm');
    }

    if (risks.bronchitis) {
      recommendations.push('Minimize temperature fluctuations');
      recommendations.push('Ensure proper insulation of the poultry house');
    }

    if (risks.coccidiosis) {
      recommendations.push('Keep litter dry and well-ventilated');
      recommendations.push('Monitor water quality regularly');
    }

    if (dayData.precipitation_sum > 20) {
      recommendations.push('Heavy rain expected - check drainage systems');
    }

    if (dayData.relative_humidity_2m_mean > 80) {
      recommendations.push('High humidity - increase ventilation');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue regular monitoring and maintenance');
    }

    return recommendations;
  }

  /**
   * Generate 10-day disease risk prediction
   * @param {number} latitude - Farm latitude
   * @param {number} longitude - Farm longitude
   * @param {Object} currentSensorData - Current farm sensor readings
   * @returns {Promise<Object>} 10-day prediction with daily breakdown
   */
  async generatePrediction(latitude, longitude, currentSensorData = {}) {
    const weatherResult = await this.getWeatherForecast(latitude, longitude);

    if (!weatherResult.success) {
      return {
        success: false,
        error: weatherResult.error,
      };
    }

    const forecast = weatherResult.data;
    const dailyPredictions = [];
    const dates = forecast.daily.time;
    
    let overallRiskScore = 0;
    let maxRiskDay = null;
    let maxRiskScore = 0;

    for (let i = 0; i < dates.length; i++) {
      const dayData = {
        date: dates[i],
        temperature_2m_max: forecast.daily.temperature_2m_max[i],
        temperature_2m_min: forecast.daily.temperature_2m_min[i],
        relative_humidity_2m_mean: forecast.daily.relative_humidity_2m_mean[i],
        precipitation_sum: forecast.daily.precipitation_sum[i],
        weather_code: forecast.daily.weather_code_max[i],
      };

      const dailyRisk = this.calculateDailyRisk(dayData, currentSensorData);
      
      dailyPredictions.push({
        date: dayData.date,
        dayNumber: i + 1,
        ...dailyRisk,
        weather: {
          maxTemp: dayData.temperature_2m_max,
          minTemp: dayData.temperature_2m_min,
          humidity: dayData.relative_humidity_2m_mean,
          precipitation: dayData.precipitation_sum,
        },
      });

      overallRiskScore += dailyRisk.totalScore;

      if (dailyRisk.totalScore > maxRiskScore) {
        maxRiskScore = dailyRisk.totalScore;
        maxRiskDay = dayData.date;
      }
    }

    const averageRisk = overallRiskScore / dates.length;

    return {
      success: true,
      prediction: {
        generatedAt: new Date().toISOString(),
        location: { latitude, longitude },
        forecastPeriod: '10 days',
        overallRisk: {
          score: averageRisk,
          level: this.getRiskLevel(averageRisk),
          description: this.getRiskDescription(averageRisk),
        },
        highestRiskDay: {
          date: maxRiskDay,
          score: maxRiskScore,
          level: this.getRiskLevel(maxRiskScore),
        },
        dailyForecasts: dailyPredictions,
        summary: this.generateSummary(dailyPredictions),
      },
    };
  }

  /**
   * Get human-readable risk description
   */
  getRiskDescription(score) {
    if (score >= 0.7) {
      return 'Critical Alert: Multiple disease risks detected. Immediate preventive measures recommended.';
    }
    if (score >= 0.5) {
      return 'High Risk: Elevated disease probability. Enhanced monitoring and preventive actions advised.';
    }
    if (score >= 0.3) {
      return 'Warning: Moderate disease risk. Maintain vigilance and standard preventive measures.';
    }
    return 'Safe: Low disease risk. Continue routine monitoring and management practices.';
  }

  /**
   * Generate summary of the 10-day forecast
   */
  generateSummary(dailyPredictions) {
    const riskDays = {
      green: 0,
      yellow: 0,
      orange: 0,
      red: 0,
    };

    const diseaseCounts = {};

    dailyPredictions.forEach(day => {
      riskDays[day.riskLevel]++;
      
      Object.keys(day.risks).forEach(disease => {
        if (!diseaseCounts[disease]) {
          diseaseCounts[disease] = 0;
        }
        if (day.risks[disease].risk === 'high') {
          diseaseCounts[disease]++;
        }
      });
    });

    const highRiskDiseases = Object.entries(diseaseCounts)
      .filter(([_, count]) => count >= 3)
      .map(([disease, count]) => ({ disease, days: count }));

    return {
      safeDays: riskDays.green,
      warningDays: riskDays.yellow,
      highRiskDays: riskDays.orange,
      criticalDays: riskDays.red,
      highRiskDiseases,
      trend: this.calculateTrend(dailyPredictions),
    };
  }

  /**
   * Calculate risk trend (improving, stable, worsening)
   */
  calculateTrend(dailyPredictions) {
    const firstHalf = dailyPredictions.slice(0, 5);
    const secondHalf = dailyPredictions.slice(5, 10);

    const firstAvg = firstHalf.reduce((sum, day) => sum + day.totalScore, 0) / 5;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.totalScore, 0) / 5;

    const change = secondAvg - firstAvg;

    if (change > 0.1) return 'worsening';
    if (change < -0.1) return 'improving';
    return 'stable';
  }
}

export default new DiseasePredictionService();
