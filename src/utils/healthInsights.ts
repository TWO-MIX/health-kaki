import { HealthMetric } from '../App'

export interface HealthInsight {
  type: 'positive' | 'warning' | 'concern' | 'info'
  title: string
  message: string
  iconName: string
  bgColor: string
  borderColor: string
  textColor: string
  recommendations?: string[]
  severity: 'good' | 'warning' | 'concern' | 'info'
  details?: {
    highest?: number
    lowest?: number
    average?: number
    trend?: 'improving' | 'worsening' | 'stable'
    concerningReadings?: number
    totalReadings?: number
  }
}

export const generateHealthInsights = (metrics: HealthMetric[]): HealthInsight[] => {
  const insights: HealthInsight[] = []
  const latestMetrics = getLatestMetricsByType(metrics)

  // Heart Rate Analysis
  const heartRateMetrics = metrics.filter(m => m.type === 'heart_rate').slice(-14) // Last 14 readings
  if (heartRateMetrics.length >= 3) {
    const values = heartRateMetrics.map(m => parseInt(m.value))
    const highest = Math.max(...values)
    const lowest = Math.min(...values)
    const average = values.reduce((a, b) => a + b, 0) / values.length
    const recent = values.slice(-7)
    const older = values.slice(0, -7)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg
    
    const highReadings = values.filter(v => v > 100).length
    const lowReadings = values.filter(v => v < 60).length
    const normalReadings = values.filter(v => v >= 60 && v <= 100).length
    
    let insight: HealthInsight = {
      type: 'info',
      title: 'Heart Rate Pattern Analysis',
      message: '',
      iconName: 'Heart',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-500',
      severity: 'info',
      details: {
        highest,
        lowest,
        average: Math.round(average),
        totalReadings: values.length,
        concerningReadings: highReadings + lowReadings,
        trend: recentAvg > olderAvg + 5 ? 'worsening' : recentAvg < olderAvg - 5 ? 'improving' : 'stable'
      }
    }

    // Analyze patterns and provide specific insights
    if (highReadings > values.length * 0.4) {
      insight.type = 'warning'
      insight.severity = 'warning'
      insight.title = 'Wah Lau! Heart Rate Often Too High Leh!'
      insight.message = `Alamak! Out of your last ${values.length} readings, ${highReadings} times your heart rate above 100 bpm (highest: ${highest} bpm). This one quite concerning sia! Your heart working too hard lah.`
      insight.recommendations = [
        'Wah, need to chill out more lah! Try deep breathing exercises daily',
        'Cut down on kopi and teh - maybe switch to decaf?',
        'Check if you very stress lately - work or family pressure?',
        'Do light exercise like walking, but don\'t overdo until heart rate normal',
        'If this continue, better go see doctor check check your heart'
      ]
    } else if (lowReadings > values.length * 0.4) {
      insight.type = 'info'
      insight.severity = 'info'
      insight.title = 'Heart Rate Quite Slow Leh'
      insight.message = `Your heart rate quite low sia - ${lowReadings} out of ${values.length} readings below 60 bpm (lowest: ${lowest} bpm). If you very fit athlete, normal lah. But if not, maybe need to check.`
      insight.recommendations = [
        'If you feel dizzy, tired, or breathless, must see doctor',
        'Check if you taking any medication that slow down heart',
        'Monitor how you feel during daily activities',
        'If you very active person, this might be normal for you',
        'Keep tracking and show pattern to doctor during next visit'
      ]
    } else if (highest - lowest > 50) {
      insight.type = 'warning'
      insight.severity = 'warning'
      insight.title = 'Aiyo! Heart Rate Very Unstable!'
      insight.message = `Wah your heart rate damn unpredictable sia! Range from ${lowest} to ${highest} bpm - that's ${highest - lowest} difference! This kind of variation not normal leh.`
      insight.recommendations = [
        'Try to identify what cause the high readings - exercise? stress? kopi?',
        'Take readings at same time daily for better comparison',
        'Note down what you doing before taking measurement',
        'Practice relaxation techniques to keep heart rate steady',
        'Discuss this pattern with doctor - might need further investigation'
      ]
    } else {
      insight.type = 'positive'
      insight.severity = 'good'
      insight.title = 'Shiok! Heart Rate Very Steady!'
      insight.message = `Your heart rate damn consistent leh! Ranging from ${lowest} to ${highest} bpm, average ${Math.round(average)} bpm. ${normalReadings} out of ${values.length} readings in normal range - very good!`
      insight.recommendations = [
        'Steady lah! Your heart very healthy and consistent',
        'Continue whatever you doing for cardiovascular health',
        'Keep up regular exercise and healthy lifestyle',
        'This kind of stability shows good heart fitness'
      ]
    }

    insights.push(insight)
  }

  // Blood Pressure Analysis
  const bpMetrics = metrics.filter(m => m.type === 'blood_pressure').slice(-14)
  if (bpMetrics.length >= 3) {
    const systolicValues = bpMetrics.map(m => m.systolic!).filter(v => v)
    const diastolicValues = bpMetrics.map(m => m.diastolic!).filter(v => v)
    
    if (systolicValues.length > 0 && diastolicValues.length > 0) {
      const highestSys = Math.max(...systolicValues)
      const lowestSys = Math.min(...systolicValues)
      const avgSys = systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
      const highestDia = Math.max(...diastolicValues)
      const lowestDia = Math.min(...diastolicValues)
      const avgDia = diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length

      const highBPReadings = systolicValues.filter((s, i) => s >= 140 || diastolicValues[i] >= 90).length
      const lowBPReadings = systolicValues.filter((s, i) => s < 90 || diastolicValues[i] < 60).length
      const normalBPReadings = systolicValues.length - highBPReadings - lowBPReadings

      let insight: HealthInsight = {
        type: 'info',
        title: 'Blood Pressure Pattern Analysis',
        message: '',
        iconName: 'Activity',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-500',
        severity: 'info',
        details: {
          highest: highestSys,
          lowest: lowestSys,
          average: Math.round(avgSys),
          totalReadings: systolicValues.length,
          concerningReadings: highBPReadings + lowBPReadings
        }
      }

      if (highBPReadings > systolicValues.length * 0.5) {
        insight.type = 'concern'
        insight.severity = 'concern'
        insight.title = 'Alamak! Blood Pressure Consistently High!'
        insight.message = `Wah lau eh! ${highBPReadings} out of ${systolicValues.length} readings show high BP (highest: ${highestSys}/${highestDia} mmHg). This one serious leh, cannot ignore!`
        insight.bgColor = 'bg-red-50'
        insight.borderColor = 'border-red-200'
        insight.textColor = 'text-red-500'
        insight.recommendations = [
          'Eh this one urgent lah! Must see doctor immediately for proper treatment',
          'Start monitoring daily and keep record to show doctor',
          'Cut down salt intake drastically - no more instant noodles!',
          'Exercise regularly but start slow - walking, swimming good',
          'Reduce stress - try meditation, yoga, or whatever helps you relax',
          'If doctor prescribe medication, must take regularly!',
          'Check family history - got high BP in family or not?'
        ]
      } else if (highestSys - lowestSys > 40 || highestDia - lowestDia > 20) {
        insight.type = 'warning'
        insight.severity = 'warning'
        insight.title = 'Blood Pressure Very Unstable Sia!'
        insight.message = `Your BP readings all over the place leh! Systolic from ${lowestSys} to ${highestSys}, diastolic from ${lowestDia} to ${highestDia}. This kind of variation not good.`
        insight.bgColor = 'bg-orange-50'
        insight.borderColor = 'border-orange-200'
        insight.textColor = 'text-orange-500'
        insight.recommendations = [
          'Try to take readings same time every day for consistency',
          'Sit quietly for 5 minutes before measuring',
          'Don\'t take after exercise, kopi, or when stressed',
          'Note down what you doing before each reading',
          'Show this pattern to doctor - might need 24-hour monitoring',
          'Could be white coat syndrome if only high at clinic'
        ]
      } else if (normalBPReadings === systolicValues.length) {
        insight.type = 'positive'
        insight.severity = 'good'
        insight.title = 'Wah! Blood Pressure Damn Good!'
        insight.message = `All ${systolicValues.length} readings in normal range! Average ${Math.round(avgSys)}/${Math.round(avgDia)} mmHg. Your cardiovascular system very healthy!`
        insight.bgColor = 'bg-green-50'
        insight.borderColor = 'border-green-200'
        insight.textColor = 'text-green-500'
        insight.recommendations = [
          'Steady lah! Your BP control damn good',
          'Continue your current lifestyle - whatever you doing is working',
          'Keep up regular exercise and healthy diet',
          'This shows excellent heart and blood vessel health'
        ]
      } else {
        insight.message = `Your BP readings mixed lah - ${normalBPReadings} normal, ${highBPReadings} high, ${lowBPReadings} low out of ${systolicValues.length} readings. Average ${Math.round(avgSys)}/${Math.round(avgDia)} mmHg.`
        insight.recommendations = [
          'Monitor more regularly to understand the pattern',
          'Note down activities and stress levels with each reading',
          'Focus on consistent lifestyle - regular sleep, exercise, diet',
          'Discuss the mixed readings with your doctor'
        ]
      }

      insights.push(insight)
    }
  }

  // SpO2 Analysis
  const spo2Metrics = metrics.filter(m => m.type === 'spo2').slice(-14)
  if (spo2Metrics.length >= 3) {
    const values = spo2Metrics.map(m => parseInt(m.value))
    const highest = Math.max(...values)
    const lowest = Math.min(...values)
    const average = values.reduce((a, b) => a + b, 0) / values.length
    const lowReadings = values.filter(v => v < 95).length
    const normalReadings = values.filter(v => v >= 95).length

    let insight: HealthInsight = {
      type: 'info',
      title: 'Oxygen Level Analysis',
      message: '',
      iconName: 'Activity',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-500',
      severity: 'info',
      details: {
        highest,
        lowest,
        average: Math.round(average),
        totalReadings: values.length,
        concerningReadings: lowReadings
      }
    }

    if (lowReadings > 0) {
      insight.type = 'concern'
      insight.severity = 'concern'
      insight.title = 'Alamak! Oxygen Level Sometimes Too Low!'
      insight.message = `Wah ${lowReadings} out of ${values.length} readings below 95% (lowest: ${lowest}%). This one serious leh! Your body not getting enough oxygen.`
      insight.bgColor = 'bg-red-50'
      insight.borderColor = 'border-red-200'
      insight.textColor = 'text-red-500'
      insight.recommendations = [
        'If you feel breathless or chest tight, see doctor immediately!',
        'Check if your SpO2 meter working properly',
        'Make sure finger clean and warm when measuring',
        'Note if low readings happen during specific activities',
        'Could be lung problem, heart problem, or circulation issue',
        'Don\'t delay - this kind of reading need medical attention'
      ]
    } else if (lowest < 97) {
      insight.type = 'info'
      insight.severity = 'info'
      insight.title = 'Oxygen Level At Lower End'
      insight.message = `Your SpO2 readings between ${lowest}% to ${highest}%, average ${Math.round(average)}%. All above 95% but on the lower side of normal.`
      insight.recommendations = [
        'Monitor how you feel - any breathlessness or fatigue?',
        'Make sure you in well-ventilated area when measuring',
        'Try some deep breathing exercises daily',
        'If you smoke, this good time to quit lah!',
        'Keep tracking and inform doctor if readings drop further'
      ]
    } else {
      insight.type = 'positive'
      insight.severity = 'good'
      insight.title = 'Shiok! Oxygen Levels Excellent!'
      insight.message = `All ${values.length} readings above 97%! Range from ${lowest}% to ${highest}%, average ${Math.round(average)}%. Your lungs and circulation working perfectly!`
      insight.bgColor = 'bg-green-50'
      insight.borderColor = 'border-green-200'
      insight.textColor = 'text-green-500'
      insight.recommendations = [
        'Excellent lah! Your respiratory system very healthy',
        'Continue whatever you doing for lung health',
        'Regular exercise helping to maintain good oxygen levels',
        'This shows your heart and lungs working well together'
      ]
    }

    insights.push(insight)
  }

  // Blood Sugar Analysis
  const bsMetrics = metrics.filter(m => m.type === 'blood_sugar').slice(-14)
  if (bsMetrics.length >= 3) {
    const values = bsMetrics.map(m => parseFloat(m.value))
    const highest = Math.max(...values)
    const lowest = Math.min(...values)
    const average = values.reduce((a, b) => a + b, 0) / values.length
    const highReadings = values.filter(v => v > 11.1).length
    const lowReadings = values.filter(v => v < 4.0).length
    const normalReadings = values.filter(v => v >= 4.0 && v <= 11.1).length

    let insight: HealthInsight = {
      type: 'info',
      title: 'Blood Sugar Pattern Analysis',
      message: '',
      iconName: 'Droplets',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-500',
      severity: 'info',
      details: {
        highest,
        lowest,
        average: Math.round(average * 10) / 10,
        totalReadings: values.length,
        concerningReadings: highReadings + lowReadings
      }
    }

    if (highReadings > values.length * 0.3) {
      insight.type = 'concern'
      insight.severity = 'concern'
      insight.title = 'Wah Lau! Blood Sugar Often Too High!'
      insight.message = `${highReadings} out of ${values.length} readings above 11.1 mmol/L (highest: ${highest.toFixed(1)} mmol/L). This one diabetes territory already leh!`
      insight.bgColor = 'bg-red-50'
      insight.borderColor = 'border-red-200'
      insight.textColor = 'text-red-500'
      insight.recommendations = [
        'Eh this one serious lah! Must see doctor for diabetes screening',
        'Start cutting down on rice, noodles, and sweet drinks immediately',
        'No more teh tarik, kopi-o kosong better',
        'Eat more vegetables, less carbs at each meal',
        'Exercise after meals - even 10 minutes walking helps',
        'Check family history - got diabetes in family or not?',
        'Might need medication if doctor confirm diabetes'
      ]
    } else if (lowReadings > 0) {
      insight.type = 'warning'
      insight.severity = 'warning'
      insight.title = 'Blood Sugar Sometimes Too Low!'
      insight.message = `${lowReadings} readings below 4.0 mmol/L (lowest: ${lowest.toFixed(1)} mmol/L). Low blood sugar can be dangerous too!`
      insight.bgColor = 'bg-yellow-50'
      insight.borderColor = 'border-yellow-200'
      insight.textColor = 'text-yellow-600'
      insight.recommendations = [
        'Keep glucose sweets or 100Plus with you always',
        'Don\'t skip meals, eat regularly throughout the day',
        'If taking diabetes medication, discuss with doctor',
        'Learn to recognize low sugar symptoms - shaky, sweaty, blur',
        'Check timing of readings - before or after meals?',
        'Might need to adjust medication or meal timing'
      ]
    } else if (highest - lowest > 8) {
      insight.type = 'warning'
      insight.severity = 'warning'
      insight.title = 'Blood Sugar Very Unstable Leh!'
      insight.message = `Your blood sugar swing from ${lowest.toFixed(1)} to ${highest.toFixed(1)} mmol/L - that's ${(highest - lowest).toFixed(1)} difference! This kind of variation not good.`
      insight.bgColor = 'bg-orange-50'
      insight.borderColor = 'border-orange-200'
      insight.textColor = 'text-orange-500'
      insight.recommendations = [
        'Try to eat at regular times every day',
        'Note down what you eat before each reading',
        'Avoid sugary snacks that cause sudden spikes',
        'Consider smaller, more frequent meals',
        'Show this pattern to doctor - might need glucose tolerance test',
        'Could indicate pre-diabetes or insulin resistance'
      ]
    } else {
      insight.type = 'positive'
      insight.severity = 'good'
      insight.title = 'Steady Lah! Blood Sugar Well Controlled!'
      insight.message = `All ${values.length} readings in good range! From ${lowest.toFixed(1)} to ${highest.toFixed(1)} mmol/L, average ${average.toFixed(1)} mmol/L. Your sugar control damn good!`
      insight.bgColor = 'bg-green-50'
      insight.borderColor = 'border-green-200'
      insight.textColor = 'text-green-500'
      insight.recommendations = [
        'Excellent sugar control! Keep up whatever you doing',
        'Your diet and lifestyle choices working very well',
        'Continue regular monitoring to maintain this good control',
        'This shows low risk for diabetes complications'
      ]
    }

    insights.push(insight)
  }

  // Overall Health Pattern Analysis
  if (insights.length >= 2) {
    const concerningInsights = insights.filter(i => i.severity === 'concern' || i.severity === 'warning').length
    const goodInsights = insights.filter(i => i.severity === 'good').length
    
    let overallInsight: HealthInsight = {
      type: 'info',
      title: 'Overall Health Pattern',
      message: '',
      iconName: 'TrendingUp',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-500',
      severity: 'info'
    }

    if (concerningInsights > goodInsights) {
      overallInsight.type = 'warning'
      overallInsight.severity = 'warning'
      overallInsight.title = 'Health Pattern Needs Attention Lah!'
      overallInsight.message = `Out of ${insights.length} health metrics analyzed, ${concerningInsights} showing concerning patterns. Time to take action before things get worse!`
      overallInsight.bgColor = 'bg-orange-50'
      overallInsight.borderColor = 'border-orange-200'
      overallInsight.textColor = 'text-orange-500'
      overallInsight.recommendations = [
        'Don\'t wait lah! Schedule appointment with doctor soon',
        'Start making lifestyle changes now - diet, exercise, stress management',
        'Keep detailed records of all readings to show doctor',
        'Consider getting comprehensive health screening',
        'Small changes now can prevent big problems later'
      ]
    } else if (goodInsights > concerningInsights) {
      overallInsight.type = 'positive'
      overallInsight.severity = 'good'
      overallInsight.title = 'Wah! Overall Health Looking Good!'
      overallInsight.message = `${goodInsights} out of ${insights.length} metrics showing healthy patterns! You taking good care of yourself lah!`
      overallInsight.bgColor = 'bg-green-50'
      overallInsight.borderColor = 'border-green-200'
      overallInsight.textColor = 'text-green-500'
      overallInsight.recommendations = [
        'Keep up the excellent work! Your health habits paying off',
        'Continue regular monitoring to maintain these good trends',
        'You setting good example for family and friends',
        'Regular check-ups with doctor still important even when healthy'
      ]
    } else {
      overallInsight.message = `Mixed health patterns - ${goodInsights} metrics good, ${concerningInsights} need attention. Focus on improving the concerning areas.`
      overallInsight.recommendations = [
        'Focus on the metrics that need improvement',
        'Don\'t neglect the areas where you doing well',
        'Gradual improvements better than trying to change everything at once',
        'Discuss your health goals with doctor for personalized advice'
      ]
    }

    insights.push(overallInsight)
  }

  return insights
}

const getLatestMetricsByType = (metrics: HealthMetric[]) => {
  const latest: { [key in HealthMetric['type']]?: HealthMetric } = {}
  
  for (const metric of metrics) {
    if (!latest[metric.type] || metric.timestamp > latest[metric.type]!.timestamp) {
      latest[metric.type] = metric
    }
  }
  
  return latest
}
