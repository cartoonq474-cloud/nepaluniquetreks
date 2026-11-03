// Weather Onboarding Visualizer State Management

const monthData = [
  { name: "January", min: -15, max: 9 },
  { name: "February", min: -20, max: 11 },
  { name: "March", min: -2, max: 15 },
  { name: "April", min: 1, max: 18 },
  { name: "May", min: 4, max: 19 },
  { name: "June", min: 9, max: 20 },
  { name: "July", min: 10, max: 19 },
  { name: "August", min: 10, max: 19 },
  { name: "September", min: 9, max: 18 },
  { name: "October", min: 2, max: 16 },
  { name: "November", min: -5, max: 12 },
  { name: "December", min: -10, max: 10 }
];

const baseDailyData = [
  { label: "Day 1 (1300 m / 4265 ft)", min: 5, max: 19 },
  { label: "Day 2 (2651 m / 8697 ft)", min: -10, max: 11 },
  { label: "Day 3 (3440 m / 11286 ft)", min: -15, max: 6 },
  { label: "Day 4 (3700 m / 12139 ft)", min: -15, max: 6 },
  { label: "Day 5 (3956 m / 12979 ft)", min: -17, max: 5 },
  { label: "Day 6 (4380 m / 14370 ft)", min: -25, max: -5 },
  { label: "Day 7 (4380 m / 14370 ft)", min: -25, max: -5 },
  { label: "Day 8 (4938 m / 16200 ft)", min: -20, max: 0 },
  { label: "Day 9 (5160 m / 16929 ft)", min: -20, max: -3 },
  { label: "Day 10 (4371 m / 14340 ft)", min: -15, max: 4 },
  { label: "Day 11 (3440 m / 11286 ft)", min: -15, max: 6 },
  { label: "Day 12 (2860 m / 9383 ft)", min: -10, max: 11 },
  { label: "Day 13 (1300 m / 4265 ft)", min: 5, max: 19 }
];

const annapurnaDailyData = [
  { label: "Day 1 (Kathmandu 1300 m)", min: 5, max: 19 },
  { label: "Day 2 (Chame 2710 m)", min: -4, max: 12 },
  { label: "Day 3 (Lower Pisang 3185 m)", min: -8, max: 8 },
  { label: "Day 4 (Manang 3500 m)", min: -12, max: 6 },
  { label: "Day 5 (Manang Acclim 3500 m)", min: -12, max: 6 },
  { label: "Day 6 (Yak Kharka 4018 m)", min: -16, max: 2 },
  { label: "Day 7 (Thorong Phedi 4450 m)", min: -20, max: -2 },
  { label: "Day 8 (Thorong La 5416 m / Muktinath)", min: -24, max: -4 },
  { label: "Day 9 (Jomsom 2720 m)", min: -2, max: 14 },
  { label: "Day 10 (Tatopani 1190 m)", min: 8, max: 23 },
  { label: "Day 11 (Ghorepani 2860 m)", min: -4, max: 12 },
  { label: "Day 12 (Poon Hill 3210 m / Pokhara)", min: 10, max: 24 },
  { label: "Day 13 (Kathmandu 1300 m)", min: 5, max: 19 },
  { label: "Day 14 (Departure 1300 m)", min: 5, max: 19 }
];

const trekDailyWeather = {
  "dhaulagiri_circuit": [
    { label: "Day 1 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 2 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 3 (Beni 836m)", min: 10, max: 24 },
    { label: "Day 4 (Babiyachaur 970m)", min: 9, max: 23 },
    { label: "Day 5 (Dharapani 1560m)", min: 6, max: 20 },
    { label: "Day 6 (Muri 1850m)", min: 4, max: 18 },
    { label: "Day 7 (Boghara 2080m)", min: 2, max: 16 },
    { label: "Day 8 (Dobang 2520m)", min: -1, max: 13 },
    { label: "Day 9 (Choriban Khola 3110m)", min: -4, max: 10 },
    { label: "Day 10 (Italian BC 3660m)", min: -8, max: 7 },
    { label: "Day 11 (Italian BC Rest 3660m)", min: -8, max: 7 },
    { label: "Day 12 (Glacier Camp 4200m)", min: -13, max: 3 },
    { label: "Day 13 (Dhaulagiri BC 4750m)", min: -18, max: -1 },
    { label: "Day 14 (DBC Rest 4750m)", min: -18, max: -1 },
    { label: "Day 15 (French Pass 5360m / Hidden Valley 5200m)", min: -24, max: -6 },
    { label: "Day 16 (Dhampus Pass 5250m / Yak Kharka 3680m)", min: -15, max: 5 },
    { label: "Day 17 (Jomsom 2720m)", min: -2, max: 15 },
    { label: "Day 18 (Pokhara 822m)", min: 11, max: 25 },
    { label: "Day 19 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 20 (Departure 1355m)", min: 5, max: 20 }
  ],
  "dhaulagiri-circuit-trek": [
    { label: "Day 1 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 2 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 3 (Beni 836m)", min: 10, max: 24 },
    { label: "Day 4 (Babiyachaur 970m)", min: 9, max: 23 },
    { label: "Day 5 (Dharapani 1560m)", min: 6, max: 20 },
    { label: "Day 6 (Muri 1850m)", min: 4, max: 18 },
    { label: "Day 7 (Boghara 2080m)", min: 2, max: 16 },
    { label: "Day 8 (Dobang 2520m)", min: -1, max: 13 },
    { label: "Day 9 (Choriban Khola 3110m)", min: -4, max: 10 },
    { label: "Day 10 (Italian BC 3660m)", min: -8, max: 7 },
    { label: "Day 11 (Italian BC Rest 3660m)", min: -8, max: 7 },
    { label: "Day 12 (Glacier Camp 4200m)", min: -13, max: 3 },
    { label: "Day 13 (Dhaulagiri BC 4750m)", min: -18, max: -1 },
    { label: "Day 14 (DBC Rest 4750m)", min: -18, max: -1 },
    { label: "Day 15 (French Pass 5360m / Hidden Valley 5200m)", min: -24, max: -6 },
    { label: "Day 16 (Dhampus Pass 5250m / Yak Kharka 3680m)", min: -15, max: 5 },
    { label: "Day 17 (Jomsom 2720m)", min: -2, max: 15 },
    { label: "Day 18 (Pokhara 822m)", min: 11, max: 25 },
    { label: "Day 19 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 20 (Departure 1355m)", min: 5, max: 20 }
  ],
  "dhaulagiri": [
    { label: "Day 1 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 2 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 3 (Beni 836m)", min: 10, max: 24 },
    { label: "Day 4 (Babiyachaur 970m)", min: 9, max: 23 },
    { label: "Day 5 (Dharapani 1560m)", min: 6, max: 20 },
    { label: "Day 6 (Muri 1850m)", min: 4, max: 18 },
    { label: "Day 7 (Boghara 2080m)", min: 2, max: 16 },
    { label: "Day 8 (Dobang 2520m)", min: -1, max: 13 },
    { label: "Day 9 (Choriban Khola 3110m)", min: -4, max: 10 },
    { label: "Day 10 (Italian BC 3660m)", min: -8, max: 7 },
    { label: "Day 11 (Italian BC Rest 3660m)", min: -8, max: 7 },
    { label: "Day 12 (Glacier Camp 4200m)", min: -13, max: 3 },
    { label: "Day 13 (Dhaulagiri BC 4750m)", min: -18, max: -1 },
    { label: "Day 14 (DBC Rest 4750m)", min: -18, max: -1 },
    { label: "Day 15 (French Pass 5360m / Hidden Valley 5200m)", min: -24, max: -6 },
    { label: "Day 16 (Dhampus Pass 5250m / Yak Kharka 3680m)", min: -15, max: 5 },
    { label: "Day 17 (Jomsom 2720m)", min: -2, max: 15 },
    { label: "Day 18 (Pokhara 822m)", min: 11, max: 25 },
    { label: "Day 19 (Kathmandu 1355m)", min: 5, max: 20 },
    { label: "Day 20 (Departure 1355m)", min: 5, max: 20 }
  ],
  "pikey_peak": [
    {
        "label": "Day 1 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 2 (Dhap Bazaar 2850m)",
        "min": -2,
        "max": 14
    },
    {
        "label": "Day 3 (Jhapre 2920m)",
        "min": -3,
        "max": 13
    },
    {
        "label": "Day 4 (Pikey Base Camp 3640m)",
        "min": -8,
        "max": 8
    },
    {
        "label": "Day 5 (Pikey Peak 4065m / Jasmane)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 6 (Junbesi 2700m)",
        "min": -1,
        "max": 15
    },
    {
        "label": "Day 7 (Phaplu 2469m)",
        "min": 1,
        "max": 16
    },
    {
        "label": "Day 8 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 9 (Departure 1400m)",
        "min": 5,
        "max": 20
    }
],
  "pikey-peak": [
    {
        "label": "Day 1 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 2 (Dhap Bazaar 2850m)",
        "min": -2,
        "max": 14
    },
    {
        "label": "Day 3 (Jhapre 2920m)",
        "min": -3,
        "max": 13
    },
    {
        "label": "Day 4 (Pikey Base Camp 3640m)",
        "min": -8,
        "max": 8
    },
    {
        "label": "Day 5 (Pikey Peak 4065m / Jasmane)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 6 (Junbesi 2700m)",
        "min": -1,
        "max": 15
    },
    {
        "label": "Day 7 (Phaplu 2469m)",
        "min": 1,
        "max": 16
    },
    {
        "label": "Day 8 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 9 (Departure 1400m)",
        "min": 5,
        "max": 20
    }
],
  "pikey-peak-trek": [
    {
        "label": "Day 1 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 2 (Dhap Bazaar 2850m)",
        "min": -2,
        "max": 14
    },
    {
        "label": "Day 3 (Jhapre 2920m)",
        "min": -3,
        "max": 13
    },
    {
        "label": "Day 4 (Pikey Base Camp 3640m)",
        "min": -8,
        "max": 8
    },
    {
        "label": "Day 5 (Pikey Peak 4065m / Jasmane)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 6 (Junbesi 2700m)",
        "min": -1,
        "max": 15
    },
    {
        "label": "Day 7 (Phaplu 2469m)",
        "min": 1,
        "max": 16
    },
    {
        "label": "Day 8 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 9 (Departure 1400m)",
        "min": 5,
        "max": 20
    }
],
  "pikey": [
    {
        "label": "Day 1 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 2 (Dhap Bazaar 2850m)",
        "min": -2,
        "max": 14
    },
    {
        "label": "Day 3 (Jhapre 2920m)",
        "min": -3,
        "max": 13
    },
    {
        "label": "Day 4 (Pikey Base Camp 3640m)",
        "min": -8,
        "max": 8
    },
    {
        "label": "Day 5 (Pikey Peak 4065m / Jasmane)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 6 (Junbesi 2700m)",
        "min": -1,
        "max": 15
    },
    {
        "label": "Day 7 (Phaplu 2469m)",
        "min": 1,
        "max": 16
    },
    {
        "label": "Day 8 (Kathmandu 1400m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 9 (Departure 1400m)",
        "min": 5,
        "max": 20
    }
],
  "mera_peak": [
    {
        "label": "Day 1 (Kathmandu 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 2 (Kathmandu 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 3 (Chutanga 3450m)",
        "min": -5,
        "max": 10
    },
    {
        "label": "Day 4 (Thuli Kharka 4300m)",
        "min": -12,
        "max": 4
    },
    {
        "label": "Day 5 (Kothe 3600m)",
        "min": -6,
        "max": 9
    },
    {
        "label": "Day 6 (Thangnak 4350m)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 7 (Thangnak 4350m)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 8 (Khare 5045m)",
        "min": -16,
        "max": 2
    },
    {
        "label": "Day 9 (Khare Training 5045m)",
        "min": -16,
        "max": 2
    },
    {
        "label": "Day 10 (Mera High Camp 5780m)",
        "min": -22,
        "max": -5
    },
    {
        "label": "Day 11 (Mera Summit 6476m)",
        "min": -28,
        "max": -12
    },
    {
        "label": "Day 12 (Contingency Khare 5045m)",
        "min": -16,
        "max": 2
    },
    {
        "label": "Day 13 (Kothe 3600m)",
        "min": -6,
        "max": 9
    },
    {
        "label": "Day 14 (Thuli Kharka 4250m)",
        "min": -11,
        "max": 5
    },
    {
        "label": "Day 15 (Lukla 2850m)",
        "min": -2,
        "max": 13
    },
    {
        "label": "Day 16 (Kathmandu 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 17 (Kathmandu Buffer 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 18 (Kathmandu Departure 1350m)",
        "min": 5,
        "max": 20
    }
],
  "mera-peak": [
    {
        "label": "Day 1 (Kathmandu 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 2 (Kathmandu 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 3 (Chutanga 3450m)",
        "min": -5,
        "max": 10
    },
    {
        "label": "Day 4 (Thuli Kharka 4300m)",
        "min": -12,
        "max": 4
    },
    {
        "label": "Day 5 (Kothe 3600m)",
        "min": -6,
        "max": 9
    },
    {
        "label": "Day 6 (Thangnak 4350m)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 7 (Thangnak 4350m)",
        "min": -12,
        "max": 5
    },
    {
        "label": "Day 8 (Khare 5045m)",
        "min": -16,
        "max": 2
    },
    {
        "label": "Day 9 (Khare Training 5045m)",
        "min": -16,
        "max": 2
    },
    {
        "label": "Day 10 (Mera High Camp 5780m)",
        "min": -22,
        "max": -5
    },
    {
        "label": "Day 11 (Mera Summit 6476m)",
        "min": -28,
        "max": -12
    },
    {
        "label": "Day 12 (Contingency Khare 5045m)",
        "min": -16,
        "max": 2
    },
    {
        "label": "Day 13 (Kothe 3600m)",
        "min": -6,
        "max": 9
    },
    {
        "label": "Day 14 (Thuli Kharka 4250m)",
        "min": -11,
        "max": 5
    },
    {
        "label": "Day 15 (Lukla 2850m)",
        "min": -2,
        "max": 13
    },
    {
        "label": "Day 16 (Kathmandu 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 17 (Kathmandu Buffer 1350m)",
        "min": 5,
        "max": 20
    },
    {
        "label": "Day 18 (Kathmandu Departure 1350m)",
        "min": 5,
        "max": 20
    }
],

  "everest-view": [
    { label: "Day 1 (Phakding 2610 m)", min: -2, max: 14 },
    { label: "Day 2 (Namche Bazaar 3440 m)", min: -6, max: 10 },
    { label: "Day 3 (Namche Acclimatization 3440 m)", min: -6, max: 10 },
    { label: "Day 4 (Everest View Hotel 3880 m)", min: -8, max: 8 },
    { label: "Day 5 (Phakding 2610 m)", min: -2, max: 14 },
    { label: "Day 6 (Lukla 2860 m)", min: -3, max: 13 },
    { label: "Day 7 (Kathmandu 1400 m)", min: 5, max: 20 }
  ],

  "mustang": [
    { label: "Day 1 (Kathmandu 1355 m)", min: 5, max: 19 },
    { label: "Day 2 (Kathmandu Prep 1355 m)", min: 5, max: 19 },
    { label: "Day 3 (Pokhara 822 m)", min: 10, max: 24 },
    { label: "Day 4 (Kagbeni 2743 m)", min: 2, max: 16 },
    { label: "Day 5 (Chele 3050 m)", min: 0, max: 14 },
    { label: "Day 6 (Gheling 3570 m)", min: -4, max: 12 },
    { label: "Day 7 (Charang 3630 m)", min: -6, max: 11 },
    { label: "Day 8 (Lo Manthang 3840 m)", min: -8, max: 10 },
    { label: "Day 9 (Namgyal & Tingkhar 3920 m)", min: -8, max: 10 },
    { label: "Day 10 (Drakmar 3810 m)", min: -7, max: 11 },
    { label: "Day 11 (Sangboche 3800 m)", min: -7, max: 11 },
    { label: "Day 12 (Chhusang 2980 m)", min: 1, max: 15 },
    { label: "Day 13 (Muktinath 3710 m)", min: -5, max: 11 },
    { label: "Day 14 (Jomsom 2720 m)", min: 2, max: 16 },
    { label: "Day 15 (Pokhara 822 m)", min: 10, max: 24 },
    { label: "Day 16 (Kathmandu 1355 m)", min: 5, max: 19 },
    { label: "Day 17 (Departure 1355 m)", min: 5, max: 19 }
  ],
  "upper-mustang": [
    { label: "Day 1 (Kathmandu 1355 m)", min: 5, max: 19 },
    { label: "Day 2 (Kathmandu Prep 1355 m)", min: 5, max: 19 },
    { label: "Day 3 (Pokhara 822 m)", min: 10, max: 24 },
    { label: "Day 4 (Kagbeni 2743 m)", min: 2, max: 16 },
    { label: "Day 5 (Chele 3050 m)", min: 0, max: 14 },
    { label: "Day 6 (Gheling 3570 m)", min: -4, max: 12 },
    { label: "Day 7 (Charang 3630 m)", min: -6, max: 11 },
    { label: "Day 8 (Lo Manthang 3840 m)", min: -8, max: 10 },
    { label: "Day 9 (Namgyal & Tingkhar 3920 m)", min: -8, max: 10 },
    { label: "Day 10 (Drakmar 3810 m)", min: -7, max: 11 },
    { label: "Day 11 (Sangboche 3800 m)", min: -7, max: 11 },
    { label: "Day 12 (Chhusang 2980 m)", min: 1, max: 15 },
    { label: "Day 13 (Muktinath 3710 m)", min: -5, max: 11 },
    { label: "Day 14 (Jomsom 2720 m)", min: 2, max: 16 },
    { label: "Day 15 (Pokhara 822 m)", min: 10, max: 24 },
    { label: "Day 16 (Kathmandu 1355 m)", min: 5, max: 19 },
    { label: "Day 17 (Departure 1355 m)", min: 5, max: 19 }
  ],

  "ebc": baseDailyData,
  "gokyo": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 3 (Phakding 2610 m)", min: -10, max: 11 },
    { label: "Day 4 (Namche Bazaar 3440 m)", min: -15, max: 6 },
    { label: "Day 5 (Namche Acclim 3900 m)", min: -16, max: 5 },
    { label: "Day 6 (Dole 4000 m)", min: -18, max: 4 },
    { label: "Day 7 (Machhermo 4470 m)", min: -22, max: 0 },
    { label: "Day 8 (Machhermo Acclim 4470 m)", min: -22, max: 0 },
    { label: "Day 9 (Gokyo Lakes 4790 m)", min: -25, max: -3 },
    { label: "Day 10 (Gokyo Ri Summit 5357 m)", min: -28, max: -6 },
    { label: "Day 11 (Dole 4000 m)", min: -18, max: 4 },
    { label: "Day 12 (Namche Bazaar 3440 m)", min: -15, max: 6 },
    { label: "Day 13 (Lukla 2850 m)", min: -10, max: 11 },
    { label: "Day 14 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 15 (Departure 1400 m)", min: 5, max: 19 }
  ],
  "abc": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Pokhara 910 m)", min: 8, max: 22 },
    { label: "Day 3 (Ulleri 1960 m)", min: 4, max: 17 },
    { label: "Day 4 (Ghorepani 2850 m)", min: 0, max: 13 },
    { label: "Day 5 (Tadapani 2500 m)", min: 2, max: 15 },
    { label: "Day 6 (Sinuwa 2360 m)", min: 2, max: 15 },
    { label: "Day 7 (Deurali 3230 m)", min: -6, max: 8 },
    { label: "Day 8 (ABC 4130 m)", min: -14, max: 2 },
    { label: "Day 9 (Bamboo 2310 m)", min: 2, max: 15 },
    { label: "Day 10 (Pokhara 910 m)", min: 8, max: 22 },
    { label: "Day 11 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 12 (Departure 1400 m)", min: 5, max: 19 }
  ],
  "abc_luxury": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Pokhara 820 m)", min: 8, max: 22 },
    { label: "Day 3 (Ghandruk 2000 m)", min: 4, max: 17 },
    { label: "Day 4 (Chhomrong 2150 m)", min: 3, max: 16 },
    { label: "Day 5 (Bamboo 2300 m)", min: 2, max: 15 },
    { label: "Day 6 (Dovan 2600 m)", min: 0, max: 13 },
    { label: "Day 7 (Himalaya 2870 m)", min: -2, max: 11 },
    { label: "Day 8 (Deurali 3200 m)", min: -6, max: 8 },
    { label: "Day 9 (MBC 3700 m)", min: -10, max: 5 },
    { label: "Day 10 (ABC 4130 m)", min: -14, max: 2 },
    { label: "Day 11 (Bamboo 2300 m)", min: 2, max: 15 },
    { label: "Day 12 (Pokhara 820 m)", min: 8, max: 22 },
    { label: "Day 13 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 14 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 15 (Departure 1400 m)", min: 5, max: 19 }
  ],
  "tilicho_circuit": annapurnaDailyData,
  "tilicho": annapurnaDailyData,
  "annapurna_circuit": annapurnaDailyData,
  "manaslu": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Machha Khola 900 m)", min: 10, max: 24 },
    { label: "Day 3 (Jagat 1340 m)", min: 8, max: 22 },
    { label: "Day 4 (Deng 1860 m)", min: 5, max: 19 },
    { label: "Day 5 (Namrung 2630 m)", min: 0, max: 14 },
    { label: "Day 6 (Lho 3180 m)", min: -4, max: 10 },
    { label: "Day 7 (Samagaon 3530 m)", min: -8, max: 7 },
    { label: "Day 8 (Samagaon Acclim 3530 m)", min: -8, max: 7 },
    { label: "Day 9 (Samdo 3860 m)", min: -12, max: 4 },
    { label: "Day 10 (Samdo Acclim 3860 m)", min: -12, max: 4 },
    { label: "Day 11 (Dharamsala 4460 m)", min: -18, max: -2 },
    { label: "Day 12 (Larkya La 5106 m / Bimthang)", min: -22, max: -4 },
    { label: "Day 13 (Tilije 2300 m)", min: 2, max: 16 },
    { label: "Day 14 (Kathmandu 1400 m)", min: 5, max: 19 }
  ],
  "manaslu-circuit": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Machha Khola 900 m)", min: 10, max: 24 },
    { label: "Day 3 (Jagat 1340 m)", min: 8, max: 22 },
    { label: "Day 4 (Deng 1860 m)", min: 5, max: 19 },
    { label: "Day 5 (Namrung 2630 m)", min: 0, max: 14 },
    { label: "Day 6 (Lho 3180 m)", min: -4, max: 10 },
    { label: "Day 7 (Samagaon 3530 m)", min: -8, max: 7 },
    { label: "Day 8 (Samagaon Acclim 3530 m)", min: -8, max: 7 },
    { label: "Day 9 (Samdo 3860 m)", min: -12, max: 4 },
    { label: "Day 10 (Samdo Acclim 3860 m)", min: -12, max: 4 },
    { label: "Day 11 (Dharamsala 4460 m)", min: -18, max: -2 },
    { label: "Day 12 (Larkya La 5106 m / Bimthang)", min: -22, max: -4 },
    { label: "Day 13 (Tilije 2300 m)", min: 2, max: 16 },
    { label: "Day 14 (Kathmandu 1400 m)", min: 5, max: 19 }
  ],
  "langtang-gosaikunda": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Syabrubesi 1450 m)", min: 6, max: 20 },
    { label: "Day 3 (Lama Hotel 2480 m)", min: 1, max: 15 },
    { label: "Day 4 (Langtang Village 3430 m)", min: -4, max: 10 },
    { label: "Day 5 (Kyanjin Gompa 3800 m)", min: -8, max: 7 },
    { label: "Day 6 (Tserko Ri 4984 m)", min: -16, max: 0 },
    { label: "Day 7 (Lama Hotel 2480 m)", min: 1, max: 15 },
    { label: "Day 8 (Thulo Syabru 2210 m)", min: 3, max: 17 },
    { label: "Day 9 (Sing Gompa 3330 m)", min: -4, max: 11 },
    { label: "Day 10 (Gosaikunda 4380 m)", min: -12, max: 4 },
    { label: "Day 11 (Laurebina La 4610 m / Ghopte)", min: -15, max: 2 },
    { label: "Day 12 (Kutumsang 2470 m)", min: 2, max: 16 },
    { label: "Day 13 (Chisapani 2165 m)", min: 3, max: 17 },
    { label: "Day 14 (Sundarijal / KTM 1400 m)", min: 5, max: 19 }
  ],
  "langtang_gosaikunda": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Syabrubesi 1450 m)", min: 6, max: 20 },
    { label: "Day 3 (Lama Hotel 2480 m)", min: 1, max: 15 },
    { label: "Day 4 (Langtang Village 3430 m)", min: -4, max: 10 },
    { label: "Day 5 (Kyanjin Gompa 3800 m)", min: -8, max: 7 },
    { label: "Day 6 (Tserko Ri 4984 m)", min: -16, max: 0 },
    { label: "Day 7 (Lama Hotel 2480 m)", min: 1, max: 15 },
    { label: "Day 8 (Thulo Syabru 2210 m)", min: 3, max: 17 },
    { label: "Day 9 (Sing Gompa 3330 m)", min: -4, max: 11 },
    { label: "Day 10 (Gosaikunda 4380 m)", min: -12, max: 4 },
    { label: "Day 11 (Laurebina La 4610 m / Ghopte)", min: -15, max: 2 },
    { label: "Day 12 (Kutumsang 2470 m)", min: 2, max: 16 },
    { label: "Day 13 (Chisapani 2165 m)", min: 3, max: 17 },
    { label: "Day 14 (Sundarijal / KTM 1400 m)", min: 5, max: 19 }
  ],
  "langtang": [
    { label: "Day 1 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 2 (Kathmandu Prep 1400 m)", min: 5, max: 19 },
    { label: "Day 3 (Syabrubesi 1450 m)", min: 6, max: 20 },
    { label: "Day 4 (Lama Hotel 2480 m)", min: 1, max: 15 },
    { label: "Day 5 (Langtang Village 3430 m)", min: -4, max: 10 },
    { label: "Day 6 (Kyanjin Gompa 3870 m)", min: -8, max: 7 },
    { label: "Day 7 (Kyanjin Acclim 3870 m)", min: -8, max: 7 },
    { label: "Day 8 (Kyanjin Ri 4773 m)", min: -15, max: 2 },
    { label: "Day 9 (Lama Hotel 2480 m)", min: 1, max: 15 },
    { label: "Day 10 (Syabrubesi 1450 m)", min: 6, max: 20 },
    { label: "Day 11 (Kathmandu 1400 m)", min: 5, max: 19 },
    { label: "Day 12 (Kathmandu Rest 1400 m)", min: 5, max: 19 },
    { label: "Day 13 (Kathmandu Culture 1400 m)", min: 5, max: 19 },
    { label: "Day 14 (Departure 1400 m)", min: 5, max: 19 }
  ]
};

const monthOffsets = {
  "January": 0,
  "February": 2,
  "March": 7,
  "April": 10,
  "May": 12,
  "June": 15,
  "July": 16,
  "August": 16,
  "September": 14,
  "October": 9,
  "November": 4,
  "December": 1
};

let currentTab = "daily"; // "daily" or "monthly"
let tempUnit = localStorage.getItem("namaste-temp-unit") || "c"; // "c" or "f"
let currentMonth = "January";

function formatTemp(c) {
  if (tempUnit === "f") {
    const f = Math.floor((c * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${c}°C`;
}

function getSplinePath(points, includeM = true) {
  if (points.length === 0) return "";
  let d = includeM ? `M ${points[0].x},${points[0].y}` : `L ${points[0].x},${points[0].y}`;
  if (points.length === 1) return d;
  
  const tension = 0.15;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    
    const cpX1 = p1.x + (p2.x - p0.x) * tension;
    const cpY1 = p1.y + (p2.y - p0.y) * tension;
    
    const cpX2 = p2.x - (p3.x - p1.x) * tension;
    const cpY2 = p2.y - (p3.y - p1.y) * tension;
    
    d += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p2.x},${p2.y}`;
  }
  return d;
}

export function renderWeatherChart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isDaily = currentTab === "daily";
  const isFahrenheit = tempUnit === "f";

  // Data to render
  let points = [];
  if (isDaily) {
    const offset = monthOffsets[currentMonth] || 0;
    const trekKey = container.getAttribute('data-trek-key') || 'ebc';
    const dailyData = trekDailyWeather[trekKey] || baseDailyData;
    points = dailyData.map(d => ({
      label: d.label,
      min: d.min + offset,
      max: d.max + offset
    }));
  } else {
    points = monthData.map(m => ({
      label: m.name,
      min: m.min,
      max: m.max
    }));
  }

  // Dimensions
  const width = isDaily ? 1000 : 800; // Scrollable if daily
  const height = 300;
  const paddingLeft = isDaily ? 130 : 60;
  const paddingRight = 40;
  const paddingTop = 50;
  const paddingBottom = 60;

  const allVals = points.flatMap(p => [p.min, p.max]);
  const maxVal = Math.max(...allVals) + 5;
  const minVal = Math.min(...allVals) - 5;

  const getX = (index) => paddingLeft + (index / (points.length - 1)) * (width - paddingLeft - paddingRight);
  const getY = (val) => height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);

  // Generate Splines and Range Areas
  let pathHTML = "";
  let areaCoords = "";
  const colorTheme = isDaily ? "#00a8ff" : "#F2A623"; // Blue for daily, Orange for monthly
  const fillOpacity = isDaily ? "0.15" : "0.12";

  if (isDaily) {
    // Range Area Chart with top/bottom lines
    const maxCoords = points.map((p, i) => ({ x: getX(i), y: getY(p.max) }));
    const minCoords = points.map((p, i) => ({ x: getX(i), y: getY(p.min) }));
    
    const maxSpline = getSplinePath(maxCoords, true);
    const minCoordsReversed = [...minCoords].reverse();
    const minSplineReversed = getSplinePath(minCoordsReversed, false);
    
    areaCoords = `${maxSpline} ${minSplineReversed} Z`;
    
    pathHTML = `
      <path d="${areaCoords}" fill="url(#weatherGradient)" />
      <path d="${maxSpline}" fill="none" stroke="${colorTheme}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="${getSplinePath(minCoords, true)}" fill="none" stroke="${colorTheme}" stroke-width="2.5" stroke-linecap="round"/>
    `;
  } else {
    // Single Average Max Chart
    const maxCoords = points.map((p, i) => ({ x: getX(i), y: getY(p.max) }));
    const maxSpline = getSplinePath(maxCoords, true);
    
    areaCoords = `${maxSpline} L ${getX(points.length - 1)},${height - paddingBottom} L ${getX(0)},${height - paddingBottom} Z`;
    
    pathHTML = `
      <path d="${areaCoords}" fill="url(#weatherGradient)" />
      <path d="${maxSpline}" fill="none" stroke="${colorTheme}" stroke-width="2.5" stroke-linecap="round"/>
    `;
  }

  // Draw grid lines
  const gridLines = [];
  const step = isFahrenheit ? 20 : 10;
  const startGrid = Math.ceil(minVal / step) * step;
  const endGrid = Math.floor(maxVal / step) * step;
  for (let val = startGrid; val <= endGrid; val += step) {
    gridLines.push(val);
  }

  const wrapperHTML = `
    <!-- Segmented Tab Group Switcher -->
    <div class="weather-tab-group">
      <button type="button" class="weather-tab-btn ${isDaily ? 'active' : ''}" data-tab="daily">Daily Temperature Variation</button>
      <button type="button" class="weather-tab-btn ${!isDaily ? 'active' : ''}" data-tab="monthly">Average Temperature (Month to Month)</button>
    </div>

    <!-- Interactive Sub-control Row -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <!-- Month Dropdown (Daily Tab Only) -->
      <div>
        ${isDaily ? `
          <select id="weather-month-selector" class="control-select" style="background: #ffffff; color: var(--color-primary-navy); border: 1px solid #C7D3CB; border-radius: 8px; padding: 8px 16px; font-size: 0.95rem; font-weight: bold; cursor: pointer; outline: none;">
            ${monthData.map(m => `<option value="${m.name}" ${currentMonth === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
        ` : `
          <span style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary-navy);">Everest Averages</span>
        `}
      </div>

      <!-- Unit Switcher -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-neutral-400); text-transform: uppercase; letter-spacing: 0.05em; user-select: none;">Temperature in:</span>
        <div style="display: inline-flex; background: #EFF3EF; padding: 3px; border-radius: 30px; border: 1px solid #DDE6DF;">
          <button type="button" class="weather-unit-btn ${!isFahrenheit ? 'active' : ''}" data-unit="c">CELSIUS</button>
          <button type="button" class="weather-unit-btn ${isFahrenheit ? 'active' : ''}" data-unit="f">FAHRENHEIT</button>
        </div>
      </div>
    </div>

    <!-- Scrollable Chart Container -->
    <div class="weather-scroll-container">
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 100%; min-width: ${isDaily ? '850px' : '650px'}; height: auto; display: block; overflow: visible;">
        <defs>
          <linearGradient id="weatherGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${colorTheme}" stop-opacity="${fillOpacity}"/>
            <stop offset="100%" stop-color="${colorTheme}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Horizontal Grid Lines -->
        ${gridLines.map(val => `
          <line x1="${paddingLeft}" y1="${getY(val)}" x2="${width - paddingRight}" y2="${getY(val)}" stroke="#DDE6DF" stroke-dasharray="4"/>
          <text x="${paddingLeft - 8}" y="${getY(val) + 4}" font-size="10.5" font-weight="600" text-anchor="end" fill="#8B9B91">${isFahrenheit ? Math.round((val * 9)/5 + 32) : val}°</text>
        `).join('')}

        <!-- Spline Line and Shaded Areas -->
        ${pathHTML}

        <!-- Solid X-axis Base Line -->
        <line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="#C7D3CB" stroke-width="1.5"/>

        <!-- Nodes, Anchors, and Labels -->
        ${points.map((p, i) => {
          const x = getX(i);
          const yMin = getY(p.min);
          const yMax = getY(p.max);

          const minLabel = formatTemp(p.min);
          const maxLabel = formatTemp(p.max);

          return `
            <!-- Vertical Anchor Line (Between Max and Min for daily, or to baseline for monthly) -->
            <line x1="${x}" y1="${yMax}" x2="${x}" y2="${isDaily ? yMin : height - paddingBottom}" stroke="${colorTheme}" stroke-dasharray="2" stroke-width="1.5" opacity="0.6"/>
            
            <!-- Nodes (Min/Max points) -->
            <circle cx="${x}" cy="${yMax}" r="4.5" fill="#FFFFFF" stroke="${colorTheme}" stroke-width="2"/>
            ${isDaily ? `<circle cx="${x}" cy="${yMin}" r="4.5" fill="#FFFFFF" stroke="${colorTheme}" stroke-width="2"/>` : ''}

            <!-- Min/Max Floating Label Box -->
            <g transform="translate(${x}, ${yMax - 22})">
              <!-- Label bubble background -->
              <rect x="-38" y="-12" width="76" height="24" rx="4" fill="${colorTheme}"/>
              <!-- Label texts -->
              <text x="0" y="-1" font-size="8.5" font-weight="700" text-anchor="middle" fill="#FFFFFF">Min: ${minLabel}</text>
              <text x="0" y="8" font-size="8.5" font-weight="700" text-anchor="middle" fill="#FFFFFF">Max: ${maxLabel}</text>
            </g>

            <!-- Slanted X-axis labels -->
            <g transform="translate(${x}, ${height - paddingBottom + 20})">
              <text transform="rotate(-15)" font-size="9" font-weight="600" text-anchor="end" fill="#65736B">${p.label}</text>
            </g>
          `;
        }).join('')}
      </svg>
    </div>

    <!-- Custom Navigation Scrollbar Bar -->
    <div class="weather-scroll-controls">
      <button type="button" class="weather-scroll-btn prev">◀</button>
      <div class="weather-scrollbar-track">
        <div class="weather-scrollbar-thumb"></div>
      </div>
      <button type="button" class="weather-scroll-btn next">▶</button>
    </div>
  `;

  container.innerHTML = wrapperHTML;

  // Bind Switch Tab click handlers
  const tabButtons = container.querySelectorAll('.weather-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentTab = e.target.getAttribute('data-tab');
      renderWeatherChart(containerId);
    });
  });

  // Bind Month selector change handlers
  const monthSelector = container.querySelector('#weather-month-selector');
  if (monthSelector) {
    monthSelector.addEventListener('change', (e) => {
      currentMonth = e.target.value;
      renderWeatherChart(containerId);
    });
  }

  // Bind unit switcher button handlers
  const unitButtons = container.querySelectorAll('.weather-unit-btn');
  unitButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tempUnit = e.target.getAttribute('data-unit');
      localStorage.setItem("namaste-temp-unit", tempUnit);
      renderWeatherChart(containerId);
    });
  });

  // Setup scrollbar thumb tracking and sync logic
  const scrollContainer = container.querySelector('.weather-scroll-container');
  const thumb = container.querySelector('.weather-scrollbar-thumb');
  const prevBtn = container.querySelector('.weather-scroll-btn.prev');
  const nextBtn = container.querySelector('.weather-scroll-btn.next');
  
  if (scrollContainer && thumb) {
    const updateThumb = () => {
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const controls = container.querySelector('.weather-scroll-controls');
      if (maxScroll <= 0) {
        thumb.style.width = '100%';
        thumb.style.left = '0%';
        if (controls) controls.style.display = 'none';
        return;
      }
      if (controls) controls.style.display = 'flex';
      const scrollRatio = scrollContainer.scrollLeft / maxScroll;
      const visibleRatio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
      const thumbWidth = Math.max(20, visibleRatio * 100);
      thumb.style.width = `${thumbWidth}%`;
      thumb.style.left = `${scrollRatio * (100 - thumbWidth)}%`;
    };

    scrollContainer.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
      });
    }
    
    // Call initially to size and position
    setTimeout(updateThumb, 50);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('weather-chart-wrapper');
  if (wrapper) {
    renderWeatherChart('weather-chart-wrapper');
  }
});
