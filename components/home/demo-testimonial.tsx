import { Testimonials } from "./testimonial";
const testimonials = [
  {
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    text: "I'm blown away by the variety of tour packages Victoria Tours offers. They make planning custom itineraries for my clients a breeze!",
    name: "Alice Johnson",
    username: "@travelwithAlice",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    text: "Working with Victoria Tours has significantly sped up our booking process. The quality of accommodations and attention to detail are remarkable!",
    name: "David Smith",
    username: "@smithtravels",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/kaDy9hV.jpeg",
    text: "Victoria Tours packages are not just well-designed but also highly customizable for different client needs. It's a travel agent's dream partner!",
    name: "Emma Brown",
    username: "@emmaexplores",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/cRwFxtE.png",
    text: "I love how responsive and well-organized Victoria Tours is. They've significantly improved the consistency of our clients' travel experiences across destinations.",
    name: "James Wilson",
    username: "@wilsonwanderlust",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/TQIqsob.png",
    text: "Partnering with Victoria Tours DMC was a game-changer for our agency. They've elevated our luxury package offerings to a whole new level!",
    name: "Sophia Lee",
    username: "@sophiatravels",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/3ROmJ0S.png",
    text: "Victoria Tours' local expertise and exclusive access to attractions has been a game-changer for our agency's reputation in the market.",
    name: "Michael Davis",
    username: "@davistravelco",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/6fKCuVC.png",
    text: "Their tour packages are perfectly balanced with activities and downtime, working seamlessly for different age groups and client preferences.",
    name: "Emily Chen",
    username: "@emilyexcursions",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/Jjqe7St.png",
    text: "I love how easy it is to customize Victoria Tours packages to fit our clients' specific interests. Their attention to cultural experiences is outstanding.",
    name: "Robert Lee",
    username: "@leegetaway",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/bG88vHI.png",
    text: "Victoria Tours has saved our agency significant time with their comprehensive booking platform. Their destination guides are excellent for client presentations.",
    name: "Sarah Taylor",
    username: "@taylortravelagency",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/tjmS77j.png",
    text: "I appreciate Victoria Tours' attention to detail in every itinerary. My luxury clients consistently return with glowing reviews of their experiences.",
    name: "Kevin White",
    username: "@whiteworldtravel",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/yTsomza.png",
    text: "Their packages are highly adaptable and can be easily integrated with our existing travel offerings. Their pricing structure is extremely agent-friendly.",
    name: "Rachel Patel",
    username: "@pateltrips",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
  {
    image: "https://i.imgur.com/pnsLqpq.png",
    text: "Victoria Tours' excursions cater beautifully to different group sizes, from intimate couples' retreats to large family reunions. Always reliable service!",
    name: "Brian Kim",
    username: "@kimescape",
    social: "https://i.imgur.com/VRtqhGC.png",
  },
];

export function TestimonialsDemo() {
  return (
    <div className="container py-10">
      <Testimonials testimonials={testimonials} />
    </div>
  );
}
