// Realistic Poultry Farm Data for West Bengal, India
// Includes districts like Nadia, North 24 Parganas, Howrah, Hooghly, etc.

export interface PoultryData {
  id: string;
  district: string;
  districtBn: string; // Bengali name
  farmName: string;
  farmNameBn: string;
  location: {
    lat: number;
    lng: number;
  };
  sensors: {
    ammonia: {
      value: number; // ppm
      unit: string;
      status: 'safe' | 'warning' | 'danger';
      label: string;
      labelBn: string;
    };
    temperature: {
      value: number; // Celsius
      unit: string;
      status: 'safe' | 'warning' | 'danger';
      label: string;
      labelBn: string;
    };
    humidity: {
      value: number; // percentage
      unit: string;
      status: 'safe' | 'warning' | 'danger';
      label: string;
      labelBn: string;
    };
    co2: {
      value: number; // ppm
      unit: string;
      status: 'safe' | 'warning' | 'danger';
      label: string;
      labelBn: string;
    };
  };
  flock: {
    count: number;
    age: number; // days
    breed: string;
    breedBn: string;
    healthStatus: 'healthy' | 'attention' | 'critical';
    healthStatusBn: string;
  };
  lastUpdated: string;
}

export const westBengalPoultryData: PoultryData[] = [
  {
    id: 'WB-ND-001',
    district: 'Nadia',
    districtBn: 'নদিয়া',
    farmName: 'Krishnanagar Poultry Farm',
    farmNameBn: 'কৃষ্ণনগর পোলট্রি ফার্ম',
    location: { lat: 23.4051, lng: 88.4978 },
    sensors: {
      ammonia: { value: 12.5, unit: 'ppm', status: 'safe', label: 'Ammonia', labelBn: 'অ্যামোনিয়া' },
      temperature: { value: 28.5, unit: '°C', status: 'safe', label: 'Temperature', labelBn: 'তাপমাত্রা' },
      humidity: { value: 65, unit: '%', status: 'safe', label: 'Humidity', labelBn: 'আর্দ্রতা' },
      co2: { value: 850, unit: 'ppm', status: 'safe', label: 'CO2', labelBn: 'কার্বন ডাই অক্সাইড' },
    },
    flock: {
      count: 5000,
      age: 25,
      breed: 'Broiler (Ross 308)',
      breedBn: 'ব্রয়লার (রস ৩০৮)',
      healthStatus: 'healthy',
      healthStatusBn: 'সুস্থ',
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'WB-N24-002',
    district: 'North 24 Parganas',
    districtBn: 'উত্তর চব্বিশ পরগনা',
    farmName: 'Barasat Green Farms',
    farmNameBn: 'ব্যারাসত গ্রীন ফার্মস',
    location: { lat: 22.7206, lng: 88.8372 },
    sensors: {
      ammonia: { value: 18.2, unit: 'ppm', status: 'warning', label: 'Ammonia', labelBn: 'অ্যামোনিয়া' },
      temperature: { value: 30.1, unit: '°C', status: 'warning', label: 'Temperature', labelBn: 'তাপমাত্রা' },
      humidity: { value: 78, unit: '%', status: 'warning', label: 'Humidity', labelBn: 'আর্দ্রতা' },
      co2: { value: 1200, unit: 'ppm', status: 'warning', label: 'CO2', labelBn: 'কার্বন ডাই অক্সাইড' },
    },
    flock: {
      count: 8500,
      age: 18,
      breed: 'Layer (BV 300)',
      breedBn: 'লেয়ার (বিভি ৩০০)',
      healthStatus: 'attention',
      healthStatusBn: 'মনোযোগ প্রয়োজন',
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'WB-HW-003',
    district: 'Howrah',
    districtBn: 'হাওড়া',
    farmName: 'Uluberia Poultry Unit',
    farmNameBn: 'উলুবেড়িয়া পোলট্রি ইউনিট',
    location: { lat: 22.2365, lng: 88.1044 },
    sensors: {
      ammonia: { value: 8.5, unit: 'ppm', status: 'safe', label: 'Ammonia', labelBn: 'অ্যামোনিয়া' },
      temperature: { value: 27.8, unit: '°C', status: 'safe', label: 'Temperature', labelBn: 'তাপমাত্রা' },
      humidity: { value: 62, unit: '%', status: 'safe', label: 'Humidity', labelBn: 'আর্দ্রতা' },
      co2: { value: 750, unit: 'ppm', status: 'safe', label: 'CO2', labelBn: 'কার্বন ডাই অক্সাইড' },
    },
    flock: {
      count: 3200,
      age: 42,
      breed: 'Native (Deshi)',
      breedBn: 'দেশি মুরগি',
      healthStatus: 'healthy',
      healthStatusBn: 'সুস্থ',
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'WB-HG-004',
    district: 'Hooghly',
    districtBn: 'হুগলি',
    farmName: 'Chinsurah Modern Farms',
    farmNameBn: 'চিনসুরাহ মডার্ন ফার্মস',
    location: { lat: 22.9073, lng: 88.3963 },
    sensors: {
      ammonia: { value: 25.0, unit: 'ppm', status: 'danger', label: 'Ammonia', labelBn: 'অ্যামোনিয়া' },
      temperature: { value: 32.5, unit: '°C', status: 'danger', label: 'Temperature', labelBn: 'তাপমাত্রা' },
      humidity: { value: 85, unit: '%', status: 'danger', label: 'Humidity', labelBn: 'আর্দ্রতা' },
      co2: { value: 1800, unit: 'ppm', status: 'danger', label: 'CO2', labelBn: 'কার্বন ডাই অক্সাইড' },
    },
    flock: {
      count: 6000,
      age: 12,
      breed: 'Broiler (Cobb 500)',
      breedBn: 'ব্রয়লার (কব ৫০০)',
      healthStatus: 'critical',
      healthStatusBn: 'জরুরি',
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'WB-MD-005',
    district: 'Malda',
    districtBn: 'মালদহ',
    farmName: 'English Bazar Poultry',
    farmNameBn: 'ইংরেজ বাজার পোলট্রি',
    location: { lat: 25.0096, lng: 88.1406 },
    sensors: {
      ammonia: { value: 10.2, unit: 'ppm', status: 'safe', label: 'Ammonia', labelBn: 'অ্যামোনিয়া' },
      temperature: { value: 29.0, unit: '°C', status: 'safe', label: 'Temperature', labelBn: 'তাপমাত্রা' },
      humidity: { value: 68, unit: '%', status: 'safe', label: 'Humidity', labelBn: 'আর্দ্রতা' },
      co2: { value: 900, unit: 'ppm', status: 'safe', label: 'CO2', labelBn: 'কার্বন ডাই অক্সাইড' },
    },
    flock: {
      count: 4500,
      age: 30,
      breed: 'Layer (Hy-Line)',
      breedBn: 'লেয়ার (হাই-লাইন)',
      healthStatus: 'healthy',
      healthStatusBn: 'সুস্থ',
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'WB-DD-006',
    district: 'Darjeeling',
    districtBn: 'দার্জিলিং',
    farmName: 'Siliguri Hills Poultry',
    farmNameBn: 'শিলিগুড়ি হিলস পোলট্রি',
    location: { lat: 26.7271, lng: 88.3953 },
    sensors: {
      ammonia: { value: 7.5, unit: 'ppm', status: 'safe', label: 'Ammonia', labelBn: 'অ্যামোনিয়া' },
      temperature: { value: 22.0, unit: '°C', status: 'safe', label: 'Temperature', labelBn: 'তাপমাত্রা' },
      humidity: { value: 70, unit: '%', status: 'safe', label: 'Humidity', labelBn: 'আর্দ্রতা' },
      co2: { value: 650, unit: 'ppm', status: 'safe', label: 'CO2', labelBn: 'কার্বন ডাই অক্সাইড' },
    },
    flock: {
      count: 2800,
      age: 35,
      breed: 'Native (Hill Chicken)',
      breedBn: 'পাহাড়ি মুরগি',
      healthStatus: 'healthy',
      healthStatusBn: 'সুস্থ',
    },
    lastUpdated: new Date().toISOString(),
  },
];

export const bengaliTranslations = {
  dashboard: 'ড্যাশবোর্ড',
  welcome: 'স্বাগতম',
  farmer: 'কৃষক',
  brother: 'ভাই',
  namaste: 'নমস্কার',
  district: 'জেলা',
  sensorHealth: 'সেন্সর স্বাস্থ্য',
  liveStatus: 'লাইভ অবস্থা',
  alerts: 'সতর্কতা',
  noAlerts: 'কোনো সতর্কতা নেই',
  viewReport: 'রিপোর্ট দেখুন',
  watchVideo: 'ভিডিও দেখুন',
  chatSupport: 'চ্যাট সহায়তা',
  callExpert: 'বিশেষজ্ঞকে কল করুন',
  help: 'সাহায্য',
  helpline: 'হেল্পলাইন',
  whatsapp: 'হোয়াটসঅ্যাপ',
  tutorials: 'ভিডিও টিউটোরিয়াল',
  safe: 'সুরক্ষিত',
  warning: 'সতর্কতা',
  danger: 'বিপদ',
  good: 'ভালো',
  caution: 'সতর্ক',
  bad: 'খারাপ',
  selectLanguage: 'ভাষা নির্বাচন করুন',
  english: 'ইংরেজি',
  hindi: 'হিন্দি',
  bengali: 'বাংলা',
};
