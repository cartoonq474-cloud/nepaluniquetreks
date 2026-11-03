/**
 * Semantic Entity JSON-LD Schema.org Generator
 * Generates structured data graphs for Google Knowledge Graph and AI Search LLMs.
 */

export function injectStructuredData() {
  // Skip injection if static JSON-LD already exists in <head> (centerpiece annotation optimization)
  if (document.querySelector('script[type="application/ld+json"]')) return;

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": "https://namastehikingtrek.com/#agency",
        "name": "Nepal Unique Treks",
        "url": "https://namastehikingtrek.com",
        "logo": "https://namastehikingtrek.com/images/logo.png",
        "description": "Nepal Unique Treks offers trekking, tours, and peak climbing in Nepal.",
        "telephone": "+977 9851023285",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "16 - Sorhakhutte, Thamel",
          "addressLocality": "Kathmandu",
          "addressCountry": "NP"
        },
        "sameAs": [
          "https://www.facebook.com/nepaluniquetreks",
          "https://twitter.com/nepaluniquetrek",
          "https://www.youtube.com/user/nepaluniquetreks",
          "https://www.instagram.com/nepaluniquetreks/?hl=en",
          "https://www.linkedin.com/in/nepaluniquetreks/"
        ]
      },
      {
        "@type": "TouristTrip",
        "@id": "https://namastehikingtrek.com/trek/everest-base-camp-trek/#trip",
        "name": "Everest Base Camp Trek",
        "description": "14-day iconic teahouse trek through Sagarmatha National Park to Everest Base Camp (5,364m) and Kala Patthar (5,545m).",
        "touristType": ["Hikers", "Trekking Enthusiasts"],
        "itinerary": {
          "@type": "ItemList",
          "numberOfItems": 14,
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Kathmandu to Lukla Flight & Trek to Phakding (2,610m)" },
            { "@type": "ListItem", "position": 2, "name": "Trek to Namche Bazaar (3,440m)" },
            { "@type": "ListItem", "position": 3, "name": "Acclimatization Day in Namche Bazaar" }
          ]
        },
        "offers": {
          "@type": "Offer",
          "price": "1399",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://namastehikingtrek.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "When is the best season for trekking in Nepal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The prime trekking seasons in Nepal are Spring (March to May) for blooming rhododendrons and crystal clear skies, and Autumn (September to November) for ideal temperatures and mountain visibility."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need prior high-altitude experience for Everest Base Camp?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "While technical climbing skills are not required, good cardiovascular fitness and physical stamina are essential. Our itineraries include built-in acclimatization days in Namche Bazaar and Dingboche."
            }
          }
        ]
      }
    ]
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemaGraph);
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  injectStructuredData();
});
