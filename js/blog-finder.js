/**
 * Nepal Unique Treks — Himalayan Blog Portal Interactive Filter, Search & Reader
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elements
  const catPills = document.querySelectorAll('.blog-cat-pill');
  const searchInput = document.getElementById('blog-search-input');
  const searchClear = document.getElementById('blog-search-clear');
  const sortSelect = document.getElementById('blog-sort-select');
  const resetBtn = document.getElementById('blog-reset-filters');
  const cardsContainer = document.getElementById('blog-cards-container');
  const resultsCounter = document.getElementById('blog-active-count');
  const noResultsBox = document.getElementById('blog-no-results');

  // Modal elements
  const readerModal = document.getElementById('blog-reader-modal');
  const modalCloseBtn = document.getElementById('blog-modal-close-btn');
  const modalCategory = document.getElementById('modal-blog-category');
  const modalReadtime = document.getElementById('modal-blog-readtime');
  const modalDate = document.getElementById('modal-blog-date');
  const modalTitle = document.getElementById('modal-blog-title');
  const modalAuthorName = document.getElementById('modal-blog-author-name');
  const modalAuthorRole = document.getElementById('modal-blog-author-role');
  const modalAuthorAvatar = document.getElementById('modal-blog-author-avatar');
  const modalHeroImg = document.getElementById('modal-blog-hero-img');
  const modalBody = document.getElementById('modal-blog-body');
  const modalTakeaways = document.getElementById('modal-blog-takeaways');
  const modalTips = document.getElementById('modal-blog-tips');
  const modalTrekCta = document.getElementById('modal-blog-trek-cta');

  // FAQ Elements
  const faqItems = document.querySelectorAll('.blog-faq-item');

  // Check required containers
  if (!cardsContainer) return;

  const blogCards = Array.from(cardsContainer.querySelectorAll('.blog-card'));

  let activeCategory = 'all';
  let searchQuery = '';
  let activeSort = 'recommended';

  // Article Database for Interactive Quick-Read Modal
  const articleDatabase = {
    'ebc-vs-act': {
      title: 'Everest Base Camp vs. Annapurna Circuit: The Ultimate 2026 Comparison',
      category: 'Route Comparison',
      categoryClass: 'badge-route',
      readTime: '9 MIN READ',
      date: 'Sep 28, 2026',
      author: 'Dil Gurung',
      role: 'Founder & Veteran Expedition Leader (22+ Years)',
      avatar: 'images/dil-gurung.jpg',
      heroImg: 'images/treks/everest-base-camp/everest-base-camp-mountain-trail-view-12.jpg',
      summary: 'Choosing between Nepal\'s two iconic crown-jewel trekking journeys is the most common dilemma for Himalayan trekkers. Everest Base Camp (EBC) is a dramatic high-altitude amphitheater surrounded by the world\'s tallest peaks, while the Annapurna Circuit (ACT) is an epic transition across climatic zones from lush subtropical valleys to Tibetan-style arid high plateaus.',
      takeaways: [
        'Scenery: EBC delivers dramatic, up-close glacial massifs (Everest, Lhotse, Ama Dablam). Annapurna offers incredible biodiversity, shifting from terraced paddy fields and rhododendrons to alpine deserts.',
        'Maximum Elevation: EBC reaches 5,545m at Kala Patthar. Annapurna Circuit summits at Thorong La Pass (5,416m). Both require disciplined acclimatization.',
        'Access Logistics: EBC starts with the thrilling scenic flight to Lukla (2,840m). Annapurna Circuit is reached by overland jeep/bus from Kathmandu or Pokhara.',
        'Teahouse Comfort: EBC lodges feature heated dining halls, bakeries in Namche, and luxury lodge options. Annapurna teahouses offer delicious apple pies in Marpha and authentic Gurung hospitality.',
        'Recommended Fitness: Strenuous for both. EBC keeps you above 4,000m for 5+ consecutive nights, demanding greater cold tolerance.'
      ],
      proTips: 'If you want iconic towering mountain giants and Sherpa Buddhist monasteries, choose Everest Base Camp. If you crave diverse landscapes, ethnic diversity, and a classic high-mountain pass crossing, Annapurna Circuit is unbeatable.',
      relatedTrekUrl: 'trek/everest-base-camp-trek/',
      relatedTrekLabel: 'Explore Everest Base Camp Trek (14 Days) →'
    },
    'autumn-treks': {
      title: 'Best Autumn Treks in Nepal: Complete September to November Guide',
      category: 'Seasonal Guide',
      categoryClass: 'badge-season',
      readTime: '8 MIN READ',
      date: 'Sep 14, 2026',
      author: 'Pasang Sherpa',
      role: 'Senior High-Pass Mountain Guide',
      avatar: 'images/team/pasang-sherpa.jpg',
      heroImg: 'images/treks/annapurna-circuit/annapurna-circuit-tilicho-lake-high-mountain-valley-trail-17.jpg',
      summary: 'Autumn (late September through November) is widely celebrated as the golden window for trekking in Nepal. The post-monsoon weather cleanses the atmosphere, leaving razor-sharp blue skies, mild daytime hiking temperatures, and breathtaking panoramas of Himalayan peaks from Dhaulagiri to Kanchenjunga.',
      takeaways: [
        'Optimal Window: Mid-October to mid-November offers peak visibility, dry trails, and negligible rainfall risk.',
        'Festive Atmosphere: Experience Nepal\'s two grandest Hindu festivals—Dashain and Tihar—celebrated with vibrant village hospitality.',
        'Top Autumn Routes: Everest Base Camp, Annapurna Circuit, Manaslu Circuit, and Gokyo Lakes are in prime conditions.',
        'Temperature Range: Daytime 12°C to 18°C at mid-elevations; nighttime drops to -5°C to -10°C above 4,500m.',
        'Crowd Strategy: Start mornings early (6:30 AM - 7:00 AM) to secure prime teahouse spots and enjoy peaceful trails.'
      ],
      proTips: 'Pack a 4-season sleeping bag (-10°C comfort rating) even in autumn. Teahouses do not have heated bedrooms, and night temperatures plunge quickly once the sun dips behind the ridge.',
      relatedTrekUrl: 'trek/manaslu-circuit-trek/',
      relatedTrekLabel: 'Explore Manaslu Circuit Trek (13 Days) →'
    },
    'ams-safety': {
      title: 'How to Prevent Altitude Sickness (AMS): Diamox, Acclimatization & Symptoms',
      category: 'Altitude & Safety',
      categoryClass: 'badge-altitude',
      readTime: '7 MIN READ',
      date: 'Sep 03, 2026',
      author: 'Dil Gurung',
      role: 'Wilderness First Responder & Founder',
      avatar: 'images/dil-gurung.jpg',
      heroImg: 'images/treks/annapurna-base-camp/annapurna-base-camp-snowy-mountain-landscape-09.jpg',
      summary: 'Acute Mountain Sickness (AMS) can affect anyone above 2,500 meters, regardless of age, gym fitness, or previous experience. Safe Himalayan trekking is 100% about science, disciplined pacing, proper hydration, and respecting your body\'s physiological adaptation to lower atmospheric oxygen.',
      takeaways: [
        'The Golden Rule of Altitude: Never ascend with symptoms of AMS. If symptoms worsen at rest, descend immediately.',
        'Climb High, Sleep Low: Take active acclimatization day hikes (e.g., Namche to Everest View Hotel, Dingboche to Nangkartshang Peak) before sleeping lower.',
        'Ascent Rate: Above 3,000m, limit your sleeping elevation gain to 300m - 500m per 24 hours, with a mandatory rest day every 3-4 days.',
        'Hydration Science: Drink 3.5 to 4.5 liters of clean water and herbal tea daily. Dehydration mimics and accelerates altitude sickness.',
        'Diamox (Acetazolamide): 125mg twice daily helps accelerate natural acclimatization by acidifying the blood and stimulating breathing rate.'
      ],
      proTips: 'Always travel with a pulse oximeter (our guides carry medical oximeters and oxygen on every high-altitude trip). Measure your SpO2 every morning and evening at teahouses to monitor trends.',
      relatedTrekUrl: 'recommended-medical-kit/',
      relatedTrekLabel: 'View Recommended Medical Kit Guide →'
    },
    'packing-checklist': {
      title: 'Ultimate Everest & Annapurna Packing Checklist: Layering for 5,000m',
      category: 'Gear & Packing',
      categoryClass: 'badge-gear',
      readTime: '8 MIN READ',
      date: 'Aug 22, 2026',
      author: 'Lakpa Tenzing',
      role: 'Equipment & Logistics Director',
      avatar: 'images/team/lakpa-tenzing.jpg',
      heroImg: 'images/treks/everest-base-camp/everest-base-camp-mountain-cairn-view-18.jpg',
      summary: 'Packing for a Himalayan expedition requires a disciplined 3-layer clothing philosophy. You will hike through 20°C sunny valleys during the day and sleep in -10°C sub-zero stone lodges at night. Carrying the wrong gear will ruin your trek, while packing too heavy burdens porters.',
      takeaways: [
        'Base Layer: 2-3 sets of 200gsm merino wool tops and bottoms. Wool wicks sweat, dries quickly, and stays odor-free for weeks.',
        'Mid Layer: 1 grid fleece jacket and 1 lightweight synthetic insulated hoodie for active hiking warmth.',
        'Outer Shell: GORE-TEX waterproof & windproof jacket (minimum 20,000mm rating) plus 750-800 fill-power goose down jacket.',
        'Footwear: Sturdy, waterproof hiking boots with solid ankle support and Vibram soles, broken in at least 2 months prior.',
        'Sleeping System: 4-season down sleeping bag with comfort limit of -10°C to -15°C, plus silk sleeping liner.'
      ],
      proTips: 'Keep your main duffel bag under 10-12 kg for porter welfare, and keep your daypack around 5-6 kg with essentials: water, shell jacket, camera, sunscreen, and snacks.',
      relatedTrekUrl: 'equipment-checklist/',
      relatedTrekLabel: 'Open Full Printable Packing Checklist →'
    },
    'top-5-basecamps': {
      title: 'Top 5 Base Camp Treks in Nepal: Everest, Annapurna, Manaslu, Kanchenjunga & Makalu',
      category: 'Route Guides',
      categoryClass: 'badge-route',
      readTime: '10 MIN READ',
      date: 'Aug 10, 2026',
      author: 'Pasang Sherpa',
      role: 'Senior High-Pass Mountain Guide',
      avatar: 'images/team/pasang-sherpa.jpg',
      heroImg: 'images/treks/annapurna-base-camp/annapurna-base-camp-trekking-group-snow-07.jpg',
      summary: 'Standing at the foot of an 8,000-meter giant is a bucket-list dream for mountaineers and trekkers worldwide. Nepal is home to eight of the fourteen 8,000-meter peaks. Here is our expert guide comparing Nepal\'s top five base camp trekking routes by difficulty, duration, and scenery.',
      takeaways: [
        '1. Everest Base Camp (5,364m): Legendary Sherpa culture, Khumbu Icefall, Kala Patthar 5,545m panoramic sunrise. 14 Days.',
        '2. Annapurna Base Camp (4,130m): Natural mountain amphitheater surrounded 360° by Annapurna I, Machhapuchhre, and Hiunchuli. 12 Days.',
        '3. Manaslu Base Camp (4,400m / Larkya La 5,106m): Unspoiled Tibetan-influenced valleys, restricted area permits, remote and peaceful. 13 Days.',
        '4. Kanchenjunga Base Camp (5,143m): Far-eastern wilderness sanctuary, world\'s third highest peak, authentic teahouse/camping experience. 18-22 Days.',
        '5. Makalu Base Camp (4,870m): Dramatic Barun Valley waterfalls, granite cliffs, rare alpine wildlife, rugged and remote. 16 Days.'
      ],
      proTips: 'For your first Himalayan trek, Annapurna Base Camp is the most forgiving on altitude (max sleeping alt 4,130m), whereas Everest Base Camp is the ultimate high-altitude pilgrimage.',
      relatedTrekUrl: 'nepal-trekking-packages/',
      relatedTrekLabel: 'Compare All Nepal Trek Packages →'
    },
    'first-timer-guide': {
      title: 'Trekking in Nepal for Beginners: Essential 2026 First-Timer Guide',
      category: 'Teahouse & Culture',
      categoryClass: 'badge-culture',
      readTime: '6 MIN READ',
      date: 'Jul 29, 2026',
      author: 'Dil Gurung',
      role: 'Founder & Head Guide',
      avatar: 'images/dil-gurung.jpg',
      heroImg: 'images/treks/mardi-himal/mardi-himal-trekkers-machhapuchhre-sunrise-11.jpg',
      summary: 'First time venturing into the Himalayas? Don\'t let the towering 8,000-meter statistics intimidate you. Nepal has the most developed teahouse trekking network in the world, meaning you don\'t need to carry tents or heavy food supplies.',
      takeaways: [
        'Mandatory Guide Regulation: Since 2023, the Nepal Tourism Board requires solo trekkers in most national parks to be accompanied by a licensed trekking guide.',
        'Daily Routine: Wake at 6:30 AM, hot breakfast, on trail by 7:30 AM, lunch around 11:30 AM, arrive at next lodge by 2:30 PM.',
        'Physical Preparation: Focus on cardio (stair climbing, cycling, hill walks with a weighted backpack) for 8-12 weeks before departure.',
        'Cash Economy: ATMs do not exist above Namche Bazaar or Besisahar. Always withdraw sufficient Nepalese Rupees in Kathmandu or Pokhara.',
        'Water Purification: Never drink unboiled tap water. Use reusable bottles with purification tablets (Aquatabs) or UV SteriPENs to avoid single-use plastics.'
      ],
      proTips: 'Pace yourself with "Sherpa steps": slow, steady rhythmic breathing without gasping for breath. The slower you ascend, the easier your body adapts.',
      relatedTrekUrl: 'trek/ghorepani-poon-hill-trek/',
      relatedTrekLabel: 'Explore Poon Hill 4-Day Beginner Trek →'
    },
    'teahouse-life': {
      title: 'Teahouse Food & Lodging in the Himalayas: Dal Bhat, Charging, Wi-Fi & Showers',
      category: 'Teahouse & Culture',
      categoryClass: 'badge-culture',
      readTime: '6 MIN READ',
      date: 'Jul 15, 2026',
      author: 'Maya Gurung',
      role: 'Community Trek Coordinator',
      avatar: 'images/team/maya-gurung.jpg',
      heroImg: 'images/treks/manaslu-circuit/manaslu-circuit-village-prayer-flags-13.jpg',
      summary: 'Teahouse culture is the beating heart of Nepalese trekking. These family-run mountain lodges offer cozy community dining halls heated by central yak-dung stoves, wholesome hot meals, and a place to rest after a day on the trail.',
      takeaways: [
        'The Legend of Dal Bhat: "Dal Bhat Power 24 Hour!" Steamed rice, spiced lentil soup, seasonal vegetable curry, and spicy pickles. Unlimited free refills on rice and lentils!',
        'Diverse Menus: You\'ll find Sherpa stew (Syangden), momo dumplings, garlic soup, porridge, Tibetan bread, and even apple pies and pizza.',
        'Electricity & Device Charging: In lower valleys, charging in rooms is free. Above 3,500m, solar charging costs NPR 200 - 500 per device in the communal dining hall.',
        'Hot Showers: Solar and gas-powered hot bucket showers are available for NPR 300 - 600. Above 4,500m, wet wipes are recommended to avoid catching chills.',
        'Connectivity: Everest region has Everest Link Wi-Fi cards; NTC and Ncell SIM cards offer 4G coverage up to Tengboche and Manang.'
      ],
      proTips: 'Always bring a high-capacity 20,000mAh power bank and keep your phone/camera batteries inside your sleeping bag at night so cold temperatures don\'t drain them.',
      relatedTrekUrl: 'nepal-travel-guide/',
      relatedTrekLabel: 'Read Complete Nepal Travel Guide →'
    },
    'spring-vs-autumn': {
      title: 'Spring vs. Autumn in Nepal: Which Season Has Better Mountain Views?',
      category: 'Seasons & Weather',
      categoryClass: 'badge-season',
      readTime: '7 MIN READ',
      date: 'Jun 28, 2026',
      author: 'Pasang Sherpa',
      role: 'High-Pass Mountain Guide',
      avatar: 'images/team/pasang-sherpa.jpg',
      heroImg: 'images/treks/manaslu-circuit/manaslu-circuit-purple-mountain-flowers-09.jpg',
      summary: 'The two prime trekking seasons in Nepal each possess unique magic. Autumn (Oct-Nov) brings crystal clarity and crisp blue skies, while Spring (Mar-May) brings warm days, active mountaineering expeditions at Base Camp, and slopes bursting with blooming wild rhododendron forests.',
      takeaways: [
        'Mountain Clarity: Autumn wins for razor-sharp horizon visibility and dry air. Spring has clearer mornings with occasional afternoon cloud build-up.',
        'Flora & Wildlife: Spring is magnificent for wild rhododendron, magnolia, and orchid blooms covering the hills from 2,000m to 3,500m.',
        'Temperature: Spring is warmer, especially in lower valleys. Autumn starts warm and cools down toward late November.',
        'Expedition Atmosphere: Spring is peak Everest climbing season. You will see massive expedition camps, sherpas, and international teams at EBC.',
        'High Passes: Both seasons are ideal for high passes like Thorong La (5,416m), Cho La (5,420m), and Larkya La (5,106m).'
      ],
      proTips: 'If your priority is crisp mountain photography and high pass crossings, choose Autumn. If you love blooming wildflowers and warmer afternoons, choose Spring.',
      relatedTrekUrl: 'annapurna-region-treks/',
      relatedTrekLabel: 'Explore Annapurna Treks in Spring →'
    },
    'visa-permits': {
      title: 'Nepal Tourist Visa on Arrival & Permit Requirements (TIMS, ACAP, Sagarmatha)',
      category: 'Teahouse & Culture',
      categoryClass: 'badge-culture',
      readTime: '5 MIN READ',
      date: 'Jun 12, 2026',
      author: 'Dil Gurung',
      role: 'Founder & Head Guide',
      avatar: 'images/dil-gurung.jpg',
      heroImg: 'uploads/durbar-squire-in-kathmandu.jpg',
      summary: 'Getting into Nepal and securing your trekking permits is straightforward when you know the statutory steps. Tourist visas are issued directly upon arrival at Tribhuvan International Airport (KTM) in Kathmandu.',
      takeaways: [
        'Visa on Arrival Fees: 15 Days ($30 USD), 30 Days ($50 USD), 90 Days ($125 USD). Payable in USD, EUR, GBP, or credit card.',
        'Passport Validity: Your passport must have at least 6 months validity from entry date and at least two blank pages.',
        'Online Pre-arrival Form: Complete the official Department of Immigration pre-arrival online form 1-2 weeks before landing to bypass airport kiosks.',
        'TIMS Card (Trekker Information Management System): Mandatory for all foreign trekkers; issued through certified agencies like Nepal Unique Treks.',
        'National Park & Conservation Permits: Sagarmatha National Park (NPR 3,000), Annapurna Conservation Area (ACAP, NPR 3,000), Manaslu Restricted Permit ($100/week in autumn).'
      ],
      proTips: 'When booking with Nepal Unique Treks, our team handles 100% of your TIMS cards, national park entries, and restricted area permits before you arrive in Kathmandu.',
      relatedTrekUrl: 'nepal-visa/',
      relatedTrekLabel: 'View Detailed Nepal Visa Guide →'
    },
    'insurance-heli': {
      title: 'Himalayan Travel Insurance & Helicopter Evacuation: Don\'t Trek Without It',
      category: 'Altitude & Safety',
      categoryClass: 'badge-altitude',
      readTime: '6 MIN READ',
      date: 'May 30, 2026',
      author: 'Lakpa Tenzing',
      role: 'Operations & Emergency Coordinator',
      avatar: 'images/team/lakpa-tenzing.jpg',
      heroImg: 'images/treks/everest-cho-la-pass/everest-cho-la-pass-trekking-group-high-pass-14.jpg',
      summary: 'Emergency helicopter evacuation in the Himalayas can cost upwards of $3,500 to $5,000 USD per flight if uninsured. Standard travel insurance policies almost universally exclude trekking above 2,500m or 3,000m unless an altitude rider is explicitly added.',
      takeaways: [
        'Altitude Rider: Verify your policy explicitly covers trekking up to 5,500m or 6,000m (e.g. World Nomads, Ripcord, Global Rescue, Allianz High Altitude).',
        'Helicopter Search & Rescue: Ensure your policy includes direct helicopter evacuation to a Kathmandu hospital without requiring upfront cash outlay.',
        'Repatriation Coverage: Policy must cover emergency repatriation, hospital hospitalization, and flight changes.',
        'Emergency SOS Protocols: Our expedition guides maintain 24/7 satellite & mobile links with Kathmandu flight operations for immediate dispatch.',
        'Pre-existing Medical Disclosure: Always declare asthma, cardiovascular conditions, or previous altitude complications to your insurer.'
      ],
      proTips: 'Save your insurance policy number, 24/7 international emergency claims phone line, and insurer name on your phone and provide a physical photocopy to your lead guide during your pre-trek briefing.',
      relatedTrekUrl: 'travel-insurance/',
      relatedTrekLabel: 'Read Complete Travel Insurance Guide →'
    },
    'manaslu-alternative': {
      title: 'Manaslu Circuit Trek: Why It\'s the #1 Remote Alternative to Annapurna',
      category: 'Route Guides',
      categoryClass: 'badge-route',
      readTime: '9 MIN READ',
      date: 'May 18, 2026',
      author: 'Pasang Sherpa',
      role: 'Senior High-Pass Guide',
      avatar: 'images/team/pasang-sherpa.jpg',
      heroImg: 'images/treks/manaslu-circuit/manaslu-circuit-suspension-bridge-10.jpg',
      summary: 'As road construction encroaches on sections of the classic Annapurna Circuit, savvy trekkers have turned their eyes to the Manaslu Circuit. Circling Mount Manaslu (8,163m)—the Mountain of the Spirit—this restricted-area trek offers raw wilderness, authentic Tibetan Buddhist culture, and zero road intrusion.',
      takeaways: [
        'Larkya La Pass (5,106m): A spectacular, thrilling pass crossing with panoramic vistas of Himlung Himal, Cheo Himal, and the Annapurna range.',
        'Restricted Area Advantage: Strict permit quotas mean fewer crowds, pristine stone villages like Samagaon and Samdo, and unspoiled cultural integrity.',
        'Side Trip to Manaslu Base Camp (4,400m) & Birendra Tal: Turquoise glacial lake beneath towering ice falls.',
        'Teahouse Evolution: Once a camping-only expedition, comfortable teahouses now line the entire circuit, serving fresh local food and warm rooms.',
        'Permit Rules: Requires a minimum group of 2 trekkers, a licensed government guide, and special restricted area permits.'
      ],
      proTips: 'Combine Manaslu Circuit with the mystical Hidden Tsum Valley (an 18-day combo) to explore ancient Tibetan meditation caves and 800-year-old gompas.',
      relatedTrekUrl: 'trek/manaslu-circuit-trek/',
      relatedTrekLabel: 'View Manaslu Circuit Trek Package →'
    },
    'hydration-nutrition': {
      title: 'High-Altitude Hydration & Nutrition: What to Eat & Drink Above 4,000 Meters',
      category: 'Altitude & Safety',
      categoryClass: 'badge-altitude',
      readTime: '5 MIN READ',
      date: 'May 04, 2026',
      author: 'Dil Gurung',
      role: 'Wilderness First Responder',
      avatar: 'images/dil-gurung.jpg',
      heroImg: 'images/treks/everest-base-camp/everest-base-camp-high-mountain-sunrise-13.jpg',
      summary: 'At high altitude, your body burns up to 30% more calories just keeping you warm and maintaining oxygen delivery to vital organs. Loss of appetite is a common symptom of high altitude, making disciplined eating and hydration a matter of survival and strength.',
      takeaways: [
        'The Hydration Target: 4 liters of fluid per day. As you breathe faster in dry mountain air, you lose immense moisture through exhalation.',
        'Complex Carbohydrates: Fuel your body with 65-70% carbs (potatoes, rice, oats, pasta, Sherpa stew). Carbs require less oxygen to metabolize than fats or proteins.',
        'Electrolytes: Bring hydration tablets (Nuun, ORS) to replenish sodium, potassium, and magnesium lost through exertion.',
        'Garlic Soup Magic: Himalayan guides swear by fresh garlic soup. Garlic thins the blood, aids circulation, and stimulates respiration naturally.',
        'Avoid Above 3,500m: Alcohol and excessive caffeine. Both act as diuretics, disrupt deep sleep, and mimic altitude headaches.'
      ],
      proTips: 'Even when you don\'t feel hungry, eat your meals. If heavy meals feel hard to swallow, order hot garlic broth, vegetable noodle soup (Thukpa), or porridge with honey.',
      relatedTrekUrl: 'recommended-medical-kit/',
      relatedTrekLabel: 'Check Altitude Medical Checklist →'
    },
    'boots-footwear': {
      title: 'Hiking Boots & Footwear Guide: Preventing Blisters on Himalayan Trails',
      category: 'Gear & Packing',
      categoryClass: 'badge-gear',
      readTime: '6 MIN READ',
      date: 'Apr 21, 2026',
      author: 'Lakpa Tenzing',
      role: 'Equipment Specialist',
      avatar: 'images/team/lakpa-tenzing.jpg',
      heroImg: 'images/treks/langtang-valley/langtang-trek-trekkers-mountain-view-01.jpg',
      summary: 'Nothing ruins a 14-day Himalayan trek faster than agonizing heel blisters or bruised toenails on steep descents. Your footwear is the single most critical gear investment you will make.',
      takeaways: [
        'Boot Sizing Rule: Buy boots 0.5 to 1 full size larger than your street shoe size. Your feet swell naturally at altitude, and your toes need room on steep descents.',
        'Break-in Period: Never wear brand new boots on day one of a trek. Walk at least 30-50 km in them over hill terrain before packing them.',
        'Lacing Technique: Learn the "Heel Lock" or "Surgeon\'s Knot" to keep your heel firmly planted in the heel cup and prevent foot slippage.',
        'Sock Layering System: Pair thin merino wool liner socks under medium-cushion wool hiking socks to reduce friction against your skin.',
        'Blister Kit: Carry Leukotape P, Compeed hydrocolloid bandages, and moleskin in your daypack, not deep in your porter duffel.'
      ],
      proTips: 'Clip your toenails straight across 3 days before your trek. On steep downhill descents like Namche or Ulleri, long toenails hit the front of boots, leading to painful blackened toenails.',
      relatedTrekUrl: 'equipment-checklist/',
      relatedTrekLabel: 'Download Equipment & Footwear Checklist →'
    },
    'langtang-gosaikunda': {
      title: 'Langtang Valley & Gosaikunda Lakes: The Best 7-10 Day Trek Near Kathmandu',
      category: 'Route Guides',
      categoryClass: 'badge-route',
      readTime: '7 MIN READ',
      date: 'Apr 08, 2026',
      author: 'Pasang Sherpa',
      role: 'Senior Guide',
      avatar: 'images/team/pasang-sherpa.jpg',
      heroImg: 'images/treks/langtang-valley/langtang-trek-hiker-mountain-view-03.jpg',
      summary: 'Short on vacation time or seeking a high-altitude trek without domestic mountain flights? Langtang National Park lies just a 6-hour scenic drive north of Kathmandu, delivering majestic alpine valleys, Tibetan Tamang culture, and sacred alpine holy lakes.',
      takeaways: [
        'Kyangjin Gompa (3,870m): Picturesque valley surrounded by Langtang Lirung (7,234m), famous local yak cheese factory, and ancient monastery.',
        'Kyangjin Ri (4,773m) & Tserko Ri (4,984m): Epic viewpoint day hikes with jaw-dropping views of Tibetan peaks and hanging glaciers.',
        'Sacred Gosaikunda (4,380m): Holy alpine lake sacred to Shiva, surrounded by rugged ridges and high Lauribina Pass (4,610m).',
        'Tamang Heritage Trail: Rich Tibetan-origin culture, authentic homestays, handwoven textiles, and warm community hospitality.',
        'Accessible Logistics: Drive directly from Kathmandu to Syabrubesi trailhead in a private 4WD jeep; no Lukla flight delays!'
      ],
      proTips: 'Langtang is ideal for trekkers with 8-10 days who want breathtaking 7,000m peaks without the logistical volatility of mountain flights.',
      relatedTrekUrl: 'trek/langtang-valley-trek/',
      relatedTrekLabel: 'Explore Langtang Valley Trek (8 Days) →'
    }
  };

  // 2. Filter & Sort Function
  function filterAndSortBlogs() {
    let visibleCount = 0;
    const cleanQuery = searchQuery.trim().toLowerCase();

    // Filter
    blogCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardSearchText = (card.getAttribute('data-search') || '').toLowerCase();
      const cardTitle = (card.querySelector('.blog-card-title')?.textContent || '').toLowerCase();
      const cardExcerpt = (card.querySelector('.blog-card-excerpt')?.textContent || '').toLowerCase();
      const cardAuthor = (card.querySelector('.blog-card-author-name')?.textContent || '').toLowerCase();

      // Category match
      const matchCategory = (activeCategory === 'all') || (cardCategory === activeCategory);

      // Search match
      let matchSearch = true;
      if (cleanQuery) {
        matchSearch = cardTitle.includes(cleanQuery) ||
                      cardExcerpt.includes(cleanQuery) ||
                      cardAuthor.includes(cleanQuery) ||
                      cardSearchText.includes(cleanQuery);
      }

      if (matchCategory && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Sort visible cards
    const sortedCards = [...blogCards].sort((a, b) => {
      const readtimeA = parseInt(a.getAttribute('data-readtime') || '0', 10);
      const readtimeB = parseInt(b.getAttribute('data-readtime') || '0', 10);
      const orderA = parseInt(a.getAttribute('data-order') || '0', 10);
      const orderB = parseInt(b.getAttribute('data-order') || '0', 10);

      if (activeSort === 'read-short') {
        return readtimeA - readtimeB;
      } else if (activeSort === 'read-long') {
        return readtimeB - readtimeA;
      } else if (activeSort === 'newest') {
        return orderA - orderB;
      }
      return orderA - orderB;
    });

    sortedCards.forEach(card => cardsContainer.appendChild(card));

    // Update Counter
    if (resultsCounter) {
      resultsCounter.textContent = visibleCount;
    }

    // Toggle No Results
    if (noResultsBox) {
      noResultsBox.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
  }

  // 3. Category Pill Handlers
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-cat') || 'all';
      filterAndSortBlogs();
    });
  });

  // 4. Live Search Handlers
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchClear) {
        searchClear.style.display = searchQuery ? 'block' : 'none';
      }
      filterAndSortBlogs();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      if (searchInput) searchInput.focus();
      filterAndSortBlogs();
    });
  }

  // 5. Sort Dropdown Handler
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndSortBlogs();
    });
  }

  // 6. Reset Filters Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      searchQuery = '';
      activeSort = 'recommended';
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (sortSelect) sortSelect.value = 'recommended';
      catPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-cat') === 'all');
      });
      filterAndSortBlogs();
    });
  }

  // 7. Interactive Quick-Read Modal Logic
  function openArticleModal(articleId) {
    const article = articleDatabase[articleId];
    if (!article || !readerModal) return;

    if (modalCategory) {
      modalCategory.textContent = article.category;
      modalCategory.className = 'blog-badge ' + (article.categoryClass || 'badge-route');
    }
    if (modalReadtime) modalReadtime.textContent = article.readTime;
    if (modalDate) modalDate.textContent = article.date;
    if (modalTitle) modalTitle.textContent = article.title;
    if (modalAuthorName) modalAuthorName.textContent = article.author;
    if (modalAuthorRole) modalAuthorRole.textContent = article.role;
    if (modalAuthorAvatar) {
      // Adjust path for subdirectory vs root
      const isSubdir = window.location.pathname.includes('/blogs/');
      const avatarSrc = isSubdir && !article.avatar.startsWith('../') ? '../' + article.avatar : article.avatar;
      modalAuthorAvatar.src = avatarSrc;
      modalAuthorAvatar.alt = article.author;
    }
    if (modalHeroImg) {
      const isSubdir = window.location.pathname.includes('/blogs/');
      const heroSrc = isSubdir && !article.heroImg.startsWith('../') ? '../' + article.heroImg : article.heroImg;
      modalHeroImg.src = heroSrc;
      modalHeroImg.alt = article.title;
    }
    if (modalBody) {
      modalBody.textContent = article.summary;
    }
    if (modalTakeaways) {
      modalTakeaways.innerHTML = article.takeaways.map(t => `<li><span class="takeaway-bullet">✓</span> <span>${t}</span></li>`).join('');
    }
    if (modalTips) {
      modalTips.textContent = article.proTips;
    }
    if (modalTrekCta) {
      const isSubdir = window.location.pathname.includes('/blogs/');
      const href = isSubdir && !article.relatedTrekUrl.startsWith('../') ? '../' + article.relatedTrekUrl : article.relatedTrekUrl;
      modalTrekCta.href = href;
      modalTrekCta.textContent = article.relatedTrekLabel;
    }

    readerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    if (!readerModal) return;
    readerModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach modal trigger listeners
  document.querySelectorAll('[data-open-article]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const articleId = btn.getAttribute('data-open-article');
      if (articleId) openArticleModal(articleId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeArticleModal);
  }

  if (readerModal) {
    readerModal.addEventListener('click', (e) => {
      if (e.target === readerModal) closeArticleModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && readerModal && readerModal.classList.contains('active')) {
      closeArticleModal();
    }
  });

  // 8. FAQ Accordion Logic
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.blog-faq-question');
    const answerEl = item.querySelector('.blog-faq-answer');

    if (!questionBtn || !answerEl) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.blog-faq-question');
          const otherAns = other.querySelector('.blog-faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = '0';
        }
      });

      // Toggle clicked item
      if (isOpen) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
        answerEl.style.maxHeight = '0';
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
      }
    });
  });

  // 9. Pillar Card Filter Trigger
  document.querySelectorAll('[data-pillar-cat]').forEach(pillar => {
    pillar.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCat = pillar.getAttribute('data-pillar-cat');
      if (targetCat) {
        const matchingPill = document.querySelector(`.blog-cat-pill[data-cat="${targetCat}"]`);
        if (matchingPill) {
          matchingPill.click();
          const targetSection = document.getElementById('all-articles');
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // Run initial filter on load
  filterAndSortBlogs();
});
