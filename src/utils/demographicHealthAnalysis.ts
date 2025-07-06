import { HealthMetric } from '../App'
import { UserProfile } from '../components/UserProfileModal'

export interface DemographicHealthAnalysis {
  metric: HealthMetric
  analysis: {
    status: 'excellent' | 'good' | 'borderline' | 'concerning' | 'critical'
    ageAppropriate: boolean
    bmiImpact: 'positive' | 'neutral' | 'negative'
    personalizedMessage: string
    recommendations: string[]
    normalRange: string
    riskFactors: string[]
    ageGroup: string
    bmiCategory: string
  }
}

export const analyzeDemographicHealth = (
  metric: HealthMetric,
  profile: UserProfile
): DemographicHealthAnalysis => {
  const bmi = calculateBMI(profile.height, profile.weight)
  const bmiCategory = getBMICategory(bmi)
  const ageGroup = getAgeGroup(profile.age)

  switch (metric.type) {
    case 'heart_rate':
      return analyzeHeartRate(metric, profile, bmi, bmiCategory, ageGroup)
    case 'blood_pressure':
      return analyzeBloodPressure(metric, profile, bmi, bmiCategory, ageGroup)
    case 'spo2':
      return analyzeSpO2(metric, profile, bmi, bmiCategory, ageGroup)
    case 'blood_sugar':
      return analyzeBloodSugar(metric, profile, bmi, bmiCategory, ageGroup)
    default:
      throw new Error(`Unknown metric type: ${metric.type}`)
  }
}

const calculateBMI = (height: number, weight: number): number => {
  const heightInM = height / 100
  return weight / (heightInM * heightInM)
}

const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

const getAgeGroup = (age: number): string => {
  if (age < 18) return 'child'
  if (age < 30) return 'young_adult'
  if (age < 50) return 'adult'
  if (age < 65) return 'middle_aged'
  return 'senior'
}

const analyzeHeartRate = (
  metric: HealthMetric,
  profile: UserProfile,
  bmi: number,
  bmiCategory: string,
  ageGroup: string
): DemographicHealthAnalysis => {
  const hr = parseInt(metric.value)
  
  // Age-adjusted normal ranges
  let normalRange: { min: number; max: number }
  switch (ageGroup) {
    case 'child':
      normalRange = { min: 70, max: 100 }
      break
    case 'young_adult':
      normalRange = { min: 60, max: 100 }
      break
    case 'adult':
      normalRange = { min: 60, max: 100 }
      break
    case 'middle_aged':
      normalRange = { min: 60, max: 95 }
      break
    case 'senior':
      normalRange = { min: 60, max: 90 }
      break
    default:
      normalRange = { min: 60, max: 100 }
  }

  // BMI impact on heart rate
  let bmiAdjustment = 0
  if (bmiCategory === 'overweight') bmiAdjustment = 5
  if (bmiCategory === 'obese') bmiAdjustment = 10

  const adjustedMax = normalRange.max + bmiAdjustment

  let status: DemographicHealthAnalysis['analysis']['status']
  let ageAppropriate: boolean
  let bmiImpact: 'positive' | 'neutral' | 'negative'
  let personalizedMessage: string
  let recommendations: string[] = []
  let riskFactors: string[] = []

  // Determine status
  if (hr < normalRange.min - 10) {
    status = 'critical'
    ageAppropriate = false
  } else if (hr < normalRange.min) {
    status = 'concerning'
    ageAppropriate = false
  } else if (hr <= adjustedMax) {
    status = hr <= normalRange.max ? 'excellent' : 'good'
    ageAppropriate = true
  } else if (hr <= adjustedMax + 10) {
    status = 'borderline'
    ageAppropriate = false
  } else {
    status = 'concerning'
    ageAppropriate = false
  }

  // BMI impact
  if (bmiCategory === 'underweight') {
    bmiImpact = 'negative'
    riskFactors.push('Being underweight can affect heart function')
  } else if (bmiCategory === 'normal') {
    bmiImpact = 'positive'
  } else if (bmiCategory === 'overweight') {
    bmiImpact = 'negative'
    riskFactors.push('Excess weight increases heart workload')
  } else {
    bmiImpact = 'negative'
    riskFactors.push('Obesity significantly increases cardiovascular risk')
  }

  // Personalized message based on age, gender, and BMI
  const genderTerm = profile.gender === 'male' ? 'uncle' : 'auntie'
  const ageTerm = ageGroup === 'senior' ? 'senior' : ageGroup === 'young_adult' ? 'young' : ''

  if (status === 'excellent') {
    personalizedMessage = `Wah ${genderTerm}! Your heart rate ${hr} bpm is excellent for a ${profile.age}-year-old ${profile.gender}! ${bmiCategory === 'normal' ? 'Your healthy weight is helping your heart work efficiently.' : ''}`
  } else if (status === 'good') {
    personalizedMessage = `Good lah ${genderTerm}! Your heart rate ${hr} bpm is acceptable for your age (${profile.age}), though ${bmiCategory !== 'normal' ? 'your weight might be affecting it a bit' : 'it could be better'}.`
  } else if (status === 'concerning') {
    personalizedMessage = `Alamak ${genderTerm}! Your heart rate ${hr} bpm is quite ${hr > adjustedMax ? 'high' : 'low'} for a ${profile.age}-year-old. ${bmiCategory === 'obese' ? 'Your weight is likely making your heart work harder.' : 'This needs attention ah!'}`
  } else {
    personalizedMessage = `Eh ${genderTerm}, this heart rate ${hr} bpm is very ${hr < normalRange.min ? 'low' : 'high'} for your age! Please see doctor immediately!`
  }

  // Age and BMI-specific recommendations
  if (ageGroup === 'senior') {
    recommendations.push('At your age, gentle exercise like tai chi or walking is best')
    recommendations.push('Monitor for dizziness or chest discomfort')
  } else if (ageGroup === 'young_adult') {
    recommendations.push('You can handle more vigorous exercise - use it to your advantage!')
  }

  if (bmiCategory === 'obese') {
    recommendations.push('Weight loss will significantly improve your heart health')
    recommendations.push('Start with low-impact exercises like swimming or walking')
  } else if (bmiCategory === 'overweight') {
    recommendations.push('Losing 5-10kg will help reduce your heart rate')
  } else if (bmiCategory === 'underweight') {
    recommendations.push('Gaining healthy weight might help stabilize your heart rate')
  }

  // Gender-specific recommendations
  if (profile.gender === 'female' && ageGroup === 'middle_aged') {
    recommendations.push('Menopause can affect heart rate - discuss with your doctor')
  }

  return {
    metric,
    analysis: {
      status,
      ageAppropriate,
      bmiImpact,
      personalizedMessage,
      recommendations,
      normalRange: `${normalRange.min}-${normalRange.max} bpm (adjusted for age)`,
      riskFactors,
      ageGroup,
      bmiCategory
    }
  }
}

const analyzeBloodPressure = (
  metric: HealthMetric,
  profile: UserProfile,
  bmi: number,
  bmiCategory: string,
  ageGroup: string
): DemographicHealthAnalysis => {
  const systolic = metric.systolic!
  const diastolic = metric.diastolic!
  
  // Age-adjusted blood pressure targets
  let normalSystolic: { min: number; max: number }
  let normalDiastolic: { min: number; max: number }
  
  switch (ageGroup) {
    case 'young_adult':
      normalSystolic = { min: 90, max: 120 }
      normalDiastolic = { min: 60, max: 80 }
      break
    case 'adult':
      normalSystolic = { min: 90, max: 130 }
      normalDiastolic = { min: 60, max: 85 }
      break
    case 'middle_aged':
      normalSystolic = { min: 90, max: 140 }
      normalDiastolic = { min: 60, max: 90 }
      break
    case 'senior':
      normalSystolic = { min: 90, max: 150 }
      normalDiastolic = { min: 60, max: 90 }
      break
    default:
      normalSystolic = { min: 90, max: 120 }
      normalDiastolic = { min: 60, max: 80 }
  }

  let status: DemographicHealthAnalysis['analysis']['status']
  let ageAppropriate: boolean
  let bmiImpact: 'positive' | 'neutral' | 'negative'
  let personalizedMessage: string
  let recommendations: string[] = []
  let riskFactors: string[] = []

  // Determine status based on both systolic and diastolic
  const sysStatus = systolic <= normalSystolic.max && systolic >= normalSystolic.min
  const diaStatus = diastolic <= normalDiastolic.max && diastolic >= normalDiastolic.min

  if (systolic >= 180 || diastolic >= 110) {
    status = 'critical'
    ageAppropriate = false
  } else if (systolic >= normalSystolic.max + 20 || diastolic >= normalDiastolic.max + 10) {
    status = 'concerning'
    ageAppropriate = false
  } else if (sysStatus && diaStatus) {
    status = 'excellent'
    ageAppropriate = true
  } else if (systolic <= normalSystolic.max + 10 && diastolic <= normalDiastolic.max + 5) {
    status = 'good'
    ageAppropriate = true
  } else {
    status = 'borderline'
    ageAppropriate = false
  }

  // BMI impact on blood pressure
  if (bmiCategory === 'normal') {
    bmiImpact = 'positive'
  } else if (bmiCategory === 'overweight') {
    bmiImpact = 'negative'
    riskFactors.push('Excess weight increases blood pressure')
  } else if (bmiCategory === 'obese') {
    bmiImpact = 'negative'
    riskFactors.push('Obesity is a major risk factor for hypertension')
  } else {
    bmiImpact = 'neutral'
  }

  const genderTerm = profile.gender === 'male' ? 'uncle' : 'auntie'

  if (status === 'excellent') {
    personalizedMessage = `Excellent lah ${genderTerm}! Your BP ${systolic}/${diastolic} mmHg is perfect for a ${profile.age}-year-old. ${bmiCategory === 'normal' ? 'Your healthy weight is definitely helping!' : ''}`
  } else if (status === 'concerning' || status === 'critical') {
    personalizedMessage = `Alamak ${genderTerm}! Your BP ${systolic}/${diastolic} mmHg is too high for your age (${profile.age}). ${bmiCategory === 'obese' ? 'Your weight is making this worse - must take action now!' : 'This needs immediate attention!'}`
  } else {
    personalizedMessage = `${genderTerm}, your BP ${systolic}/${diastolic} mmHg is ${status} for a ${profile.age}-year-old. ${bmiCategory !== 'normal' ? 'Your weight is affecting your blood pressure.' : 'Keep monitoring closely.'}`
  }

  // Age-specific recommendations
  if (ageGroup === 'senior') {
    recommendations.push('At your age, slightly higher BP might be acceptable - discuss targets with doctor')
    recommendations.push('Be careful with sudden position changes to avoid dizziness')
  } else if (ageGroup === 'young_adult') {
    recommendations.push('High BP at your age is serious - lifestyle changes are crucial now')
  }

  // BMI-specific recommendations
  if (bmiCategory === 'obese') {
    recommendations.push('Weight loss is the most effective way to lower your BP')
    recommendations.push('Even 5kg weight loss can make a significant difference')
  }

  // Gender-specific considerations
  if (profile.gender === 'female' && ageGroup === 'middle_aged') {
    recommendations.push('Menopause can affect blood pressure - regular monitoring important')
  }

  return {
    metric,
    analysis: {
      status,
      ageAppropriate,
      bmiImpact,
      personalizedMessage,
      recommendations,
      normalRange: `${normalSystolic.min}-${normalSystolic.max}/${normalDiastolic.min}-${normalDiastolic.max} mmHg (age-adjusted)`,
      riskFactors,
      ageGroup,
      bmiCategory
    }
  }
}

const analyzeSpO2 = (
  metric: HealthMetric,
  profile: UserProfile,
  bmi: number,
  bmiCategory: string,
  ageGroup: string
): DemographicHealthAnalysis => {
  const spo2 = parseInt(metric.value)
  
  // Age-adjusted SpO2 expectations
  let normalRange: { min: number; max: number }
  switch (ageGroup) {
    case 'senior':
      normalRange = { min: 95, max: 100 } // Slightly lower acceptable for seniors
      break
    default:
      normalRange = { min: 96, max: 100 }
  }

  let status: DemographicHealthAnalysis['analysis']['status']
  let ageAppropriate: boolean
  let bmiImpact: 'positive' | 'neutral' | 'negative'
  let personalizedMessage: string
  let recommendations: string[] = []
  let riskFactors: string[] = []

  if (spo2 < 90) {
    status = 'critical'
    ageAppropriate = false
  } else if (spo2 < normalRange.min) {
    status = 'concerning'
    ageAppropriate = false
  } else if (spo2 >= 98) {
    status = 'excellent'
    ageAppropriate = true
  } else {
    status = 'good'
    ageAppropriate = true
  }

  // BMI impact on oxygen saturation
  if (bmiCategory === 'obese') {
    bmiImpact = 'negative'
    riskFactors.push('Obesity can affect breathing and oxygen levels')
  } else if (bmiCategory === 'overweight') {
    bmiImpact = 'negative'
    riskFactors.push('Excess weight can impact respiratory function')
  } else {
    bmiImpact = 'positive'
  }

  const genderTerm = profile.gender === 'male' ? 'uncle' : 'auntie'

  if (status === 'excellent') {
    personalizedMessage = `Excellent ${genderTerm}! Your oxygen level ${spo2}% is perfect for a ${profile.age}-year-old. Your lungs are working beautifully!`
  } else if (status === 'concerning' || status === 'critical') {
    personalizedMessage = `Alamak ${genderTerm}! Your oxygen level ${spo2}% is too low${ageGroup === 'senior' ? ' even for your age' : ''}. ${bmiCategory === 'obese' ? 'Your weight might be affecting your breathing.' : 'This needs immediate medical attention!'}`
  } else {
    personalizedMessage = `${genderTerm}, your oxygen level ${spo2}% is acceptable for a ${profile.age}-year-old, but could be better.`
  }

  // Age-specific recommendations
  if (ageGroup === 'senior') {
    recommendations.push('At your age, lung function naturally declines - regular monitoring important')
    recommendations.push('Gentle breathing exercises can help maintain lung capacity')
  }

  // BMI-specific recommendations
  if (bmiCategory === 'obese') {
    recommendations.push('Weight loss will significantly improve your breathing and oxygen levels')
    recommendations.push('Sleep apnea screening might be beneficial')
  }

  return {
    metric,
    analysis: {
      status,
      ageAppropriate,
      bmiImpact,
      personalizedMessage,
      recommendations,
      normalRange: `${normalRange.min}-${normalRange.max}% (age-adjusted)`,
      riskFactors,
      ageGroup,
      bmiCategory
    }
  }
}

const analyzeBloodSugar = (
  metric: HealthMetric,
  profile: UserProfile,
  bmi: number,
  bmiCategory: string,
  ageGroup: string
): DemographicHealthAnalysis => {
  const bs = parseFloat(metric.value)
  
  // Age-adjusted blood sugar targets (slightly more lenient for seniors)
  let normalRange: { min: number; max: number }
  switch (ageGroup) {
    case 'senior':
      normalRange = { min: 4.0, max: 8.0 } // Slightly higher acceptable for seniors
      break
    default:
      normalRange = { min: 4.0, max: 7.0 }
  }

  let status: DemographicHealthAnalysis['analysis']['status']
  let ageAppropriate: boolean
  let bmiImpact: 'positive' | 'neutral' | 'negative'
  let personalizedMessage: string
  let recommendations: string[] = []
  let riskFactors: string[] = []

  if (bs > 15.0) {
    status = 'critical'
    ageAppropriate = false
  } else if (bs > normalRange.max + 4) {
    status = 'concerning'
    ageAppropriate = false
  } else if (bs <= normalRange.max && bs >= normalRange.min) {
    status = 'excellent'
    ageAppropriate = true
  } else if (bs <= normalRange.max + 2) {
    status = 'good'
    ageAppropriate = true
  } else {
    status = 'borderline'
    ageAppropriate = false
  }

  // BMI impact on blood sugar
  if (bmiCategory === 'obese') {
    bmiImpact = 'negative'
    riskFactors.push('Obesity significantly increases diabetes risk')
  } else if (bmiCategory === 'overweight') {
    bmiImpact = 'negative'
    riskFactors.push('Excess weight increases insulin resistance')
  } else {
    bmiImpact = 'positive'
  }

  const genderTerm = profile.gender === 'male' ? 'uncle' : 'auntie'

  if (status === 'excellent') {
    personalizedMessage = `Excellent ${genderTerm}! Your blood sugar ${bs} mmol/L is perfect for a ${profile.age}-year-old. ${bmiCategory === 'normal' ? 'Your healthy weight is definitely helping!' : ''}`
  } else if (status === 'concerning' || status === 'critical') {
    personalizedMessage = `Alamak ${genderTerm}! Your blood sugar ${bs} mmol/L is very high${ageGroup === 'senior' ? ' even considering your age' : ''}. ${bmiCategory === 'obese' ? 'Your weight is making this much worse - urgent action needed!' : 'This needs immediate medical attention!'}`
  } else {
    personalizedMessage = `${genderTerm}, your blood sugar ${bs} mmol/L is ${status} for a ${profile.age}-year-old. ${bmiCategory !== 'normal' ? 'Your weight is affecting your sugar control.' : 'Keep monitoring closely.'}`
  }

  // Age-specific recommendations
  if (ageGroup === 'senior') {
    recommendations.push('At your age, slightly higher targets might be safer - discuss with doctor')
    recommendations.push('Avoid severe low blood sugar episodes - they\'re more dangerous for seniors')
  } else if (ageGroup === 'middle_aged') {
    recommendations.push('This is prime time for diabetes prevention - lifestyle changes are crucial')
  }

  // BMI-specific recommendations
  if (bmiCategory === 'obese') {
    recommendations.push('Weight loss is the most effective way to improve blood sugar control')
    recommendations.push('Even 10% weight loss can significantly reduce diabetes risk')
  }

  // Gender-specific considerations
  if (profile.gender === 'female' && ageGroup === 'middle_aged') {
    recommendations.push('Menopause can affect blood sugar - monitor more closely during this time')
  }

  return {
    metric,
    analysis: {
      status,
      ageAppropriate,
      bmiImpact,
      personalizedMessage,
      recommendations,
      normalRange: `${normalRange.min}-${normalRange.max} mmol/L (age-adjusted)`,
      riskFactors,
      ageGroup,
      bmiCategory
    }
  }
}
